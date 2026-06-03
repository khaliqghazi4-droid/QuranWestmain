// Daily.co integration helpers.
//
// Two pieces:
//   1. ensureDailyRoom(roomName) — idempotently make sure a Daily room with
//      the given name exists. We try to fetch it first; if it 404s we create
//      it with our standard properties; either way we return its URL.
//   2. The DAILY_DOMAIN / DAILY_API_KEY pair pulled from env.

const API_BASE = "https://api.daily.co/v1";

function readEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`${name} is not configured`);
  }
  return v.trim();
}

export function isDailyConfigured(): boolean {
  return Boolean(process.env.DAILY_API_KEY?.trim() && process.env.DAILY_DOMAIN?.trim());
}

export function dailyDomain(): string {
  return readEnv("DAILY_DOMAIN");
}

// Daily room names are limited: lowercase + digits + dashes, ~41 chars.
// Our room ids look like `booking-cmxxxxxxxxxx`; normalize defensively.
export function toDailyRoomName(roomId: string): string {
  return roomId
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 41);
}

export type DailyRoom = {
  name: string;
  url: string;
};

type DailyApiRoom = {
  id?: string;
  name: string;
  url: string;
  privacy?: string;
  config?: Record<string, unknown>;
};

async function dailyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = readEnv("DAILY_API_KEY");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; info?: string };
  if (!res.ok) {
    const msg = (data as { error?: string; info?: string }).info
      ?? (data as { error?: string }).error
      ?? `Daily API ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

// Make sure a Daily room exists with our standard config; create it if not.
// Returns the public URL the browser embeds.
export async function ensureDailyRoom(roomId: string): Promise<DailyRoom> {
  const name = toDailyRoomName(roomId);
  try {
    const room = await dailyFetch<DailyApiRoom>(`/rooms/${name}`);
    return { name: room.name, url: room.url };
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status !== 404) {
      // Some other API error — bubble it up so the caller can surface it.
      throw err;
    }
  }

  // Create the room. Properties tuned for an online classroom:
  // - private + knock disabled so anyone with the link can join immediately,
  //   gated by our own auth / role checks at /app/{role}/class/[id].
  // - max_participants kept small for free tier sanity.
  // - enable_prejoin_ui: false → drops the "Setup audio/video" splash so the
  //   teacher lands straight in the meeting.
  // - enable_recording: "local" — the only recording mode available on free
  //   tier; our screen-recorder will trigger it via the call frame.
  const created = await dailyFetch<DailyApiRoom>("/rooms", {
    method: "POST",
    body: JSON.stringify({
      name,
      privacy: "public",
      properties: {
        max_participants: 10,
        enable_prejoin_ui: false,
        enable_screenshare: true,
        enable_chat: true,
        enable_knocking: false,
        enable_recording: "local",
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });
  return { name: created.name, url: created.url };
}
