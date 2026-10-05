"use client";

import * as React from "react";
import { Loader2, RefreshCw, User } from "lucide-react";

// Jitsi meeting embed via Jitsi's External API.
// - With `jaas` (JaaS keys configured): joins on 8x8.vc with a signed JWT, so
//   the class's teacher is the moderator. No embed cutoff there.
// - Without it: public meet.jit.si, auto-rejoining on its free 5-minute embed
//   cutoff so the user sees a ~2s reconnect instead of a hard disconnect.
// - With `waitingLabel`: while nobody else is in the room, a black "waiting"
//   pane sits next to the meeting and Jitsi's filmstrip is hidden, so the
//   user sees their own camera once instead of twice (Jitsi otherwise puts
//   the local video on the large view too when alone).
// - With `enableLobby` (the teacher): turns Jitsi's lobby on once we're the
//   moderator, so students knock and wait to be admitted. On JaaS the
//   SETTINGS_PROVISIONING webhook (/api/jaas/settings) can turn it on for
//   every room; this covers the time before that's set up. Anyone who got in
//   before our lobby was on is sent back to it.
// - With `waitForTeacherLabel` (the student): a student who walks into an
//   empty room (lobby still off) waits behind a "waiting for your teacher"
//   screen, and once the teacher arrives leaves and rejoins, so they land in
//   the lobby and the teacher has to admit them.
// Both lobby options are JaaS only: meet.jit.si has no fixed moderator and
// its 5-minute embed rejoin would send the student back to the lobby.
type JitsiApi = {
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  dispose: () => void;
  executeCommand: (cmd: string, ...args: unknown[]) => void;
};
type JitsiApiCtor = new (
  domain: string,
  options: Record<string, unknown>
) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiCtor;
  }
}

// Teacher: joins this soon after ours may have beaten our lobby switching on
const LOBBY_SETTLE_MS = 3000;
// Teacher: when someone who skipped the lobby is sent back to it, if they
// haven't already left and rejoined by themselves
const SEND_TO_LOBBY_AFTER_MS = 4500;
// Student: wait for people already in the room to show up before deciding
// we walked into an empty one
const ROOM_SETTLE_MS = 1500;
// Student: pause before rejoining, so the teacher's lobby is on by then
const REJOIN_DELAY_MS = 2000;

export function JitsiMeeting({
  jitsiRoomName,
  displayName,
  jaas,
  onHangup,
  onRejoin,
  waitingLabel,
  enableLobby,
  waitForTeacherLabel,
}: {
  jitsiRoomName: string;
  displayName: string;
  jaas?: { appId: string; jwt: string } | null;
  // JaaS only: the user hung up / clicked Rejoin. Not called for the
  // meet.jit.si embed cutoff, which rejoins by itself.
  onHangup?: () => void;
  onRejoin?: () => void;
  // Shown in the black pane while no one else has joined
  waitingLabel?: string;
  // Moderator only: make everyone else wait in the lobby to be admitted
  enableLobby?: boolean;
  // Student: shown while the teacher isn't in the class
  waitForTeacherLabel?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<JitsiApi | null>(null);
  const onHangupRef = React.useRef(onHangup);
  onHangupRef.current = onHangup;
  const [version, setVersion] = React.useState(0);
  const [reconnecting, setReconnecting] = React.useState(false);
  // JaaS only: the user hung up and sees a Rejoin button instead of auto-rejoin
  const [left, setLeft] = React.useState(false);
  // Remote participants in the current meeting, and whether Jitsi's
  // filmstrip is showing (both reset whenever the meeting is recreated)
  const [remoteCount, setRemoteCount] = React.useState(0);
  const [conferenceJoined, setConferenceJoined] = React.useState(false);
  const filmstripVisibleRef = React.useRef(true);
  // Teacher: participants who came in through the lobby (kept across
  // reconnects, so reconnecting doesn't send the student back to it)
  const admittedRef = React.useRef(new Set<string>());
  // Student: left the room to rejoin through the lobby
  const [toLobby, setToLobby] = React.useState(false);
  const appId = jaas?.appId;
  const jwt = jaas?.jwt;
  const waitingEnabled = !!waitingLabel;
  const lobbyOn = !!enableLobby && !!appId;
  const holdForTeacher = !!waitForTeacherLabel && !!appId;

  React.useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    const remoteIds = new Set<string>();
    setRemoteCount(0);
    setConferenceJoined(false);
    setToLobby(false);
    filmstripVisibleRef.current = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(() => !cancelled && fn(), ms));
    };

    function loadScript(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-jitsi="external-api"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () =>
            reject(new Error("Jitsi script failed"))
          );
          return;
        }
        const s = document.createElement("script");
        s.src = appId
          ? `https://8x8.vc/${appId}/external_api.js`
          : "https://meet.jit.si/external_api.js";
        s.async = true;
        s.dataset.jitsi = "external-api";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Jitsi script failed"));
        document.body.appendChild(s);
      });
    }

    (async () => {
      try {
        await loadScript();
        if (cancelled || !container || !window.JitsiMeetExternalAPI) return;
        const api = new window.JitsiMeetExternalAPI(appId ? "8x8.vc" : "meet.jit.si", {
          roomName: appId ? `${appId}/${jitsiRoomName}` : jitsiRoomName,
          ...(jwt ? { jwt } : {}),
          parentNode: container,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            // Older and newer Jitsi spellings of "skip the Join meeting screen"
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            startWithVideoMuted: false,
            disableDeepLinking: true,
            requireDisplayName: false,
            // Students in the lobby ask to join straight away (no prejoin click)
            lobby: { autoKnock: true, enableChat: false },
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
          },
        });
        apiRef.current = api;
        // toggleLobby takes the wanted state, so calling it again is harmless.
        // It only works for a moderator, hence the retry on role change.
        const turnOnLobby = () => {
          if (!cancelled && lobbyOn) api.executeCommand("toggleLobby", true);
        };

        // Teacher: when we joined, and who got in before our lobby was on
        let joinedAt: number | null = null;
        const early: string[] = [];
        const sendToLobby = (id: string) => {
          const at = (joinedAt ?? Date.now()) + SEND_TO_LOBBY_AFTER_MS;
          later(() => {
            if (remoteIds.has(id)) api.executeCommand("kickParticipant", id);
          }, Math.max(0, at - Date.now()));
        };

        // Student: we joined an empty room, so we didn't come through the lobby
        let unadmitted = false;
        let goingToLobby = false;
        const goToLobby = (hangUp: boolean) => {
          if (goingToLobby) return;
          goingToLobby = true;
          setToLobby(true);
          if (hangUp) api.executeCommand("hangup");
          later(() => setVersion((v) => v + 1), REJOIN_DELAY_MS);
        };

        api.addEventListener("videoConferenceJoined", () => {
          if (cancelled) return;
          setConferenceJoined(true);
          if (lobbyOn) {
            turnOnLobby();
            joinedAt = Date.now();
            early.splice(0).forEach(sendToLobby);
          }
          if (holdForTeacher) {
            later(() => {
              if (remoteIds.size === 0) unadmitted = true;
            }, ROOM_SETTLE_MS);
          }
        });
        api.addEventListener("participantRoleChanged", (e) => {
          if ((e as { role?: string } | undefined)?.role === "moderator") turnOnLobby();
        });
        api.addEventListener("participantJoined", (e) => {
          const id = (e as { id?: string } | undefined)?.id;
          if (cancelled || !id) return;
          remoteIds.add(id);
          setRemoteCount(remoteIds.size);
          if (lobbyOn && !admittedRef.current.has(id)) {
            if (joinedAt === null) early.push(id);
            else if (Date.now() < joinedAt + LOBBY_SETTLE_MS) sendToLobby(id);
            else admittedRef.current.add(id);
          }
          // The teacher arrived while we sat in the room without being admitted
          if (holdForTeacher && unadmitted) goToLobby(true);
        });
        // Student: the teacher sent us back to the lobby
        api.addEventListener("participantKickedOut", (e) => {
          const kicked = (e as { kicked?: { local?: boolean } } | undefined)?.kicked;
          if (!cancelled && holdForTeacher && kicked?.local) goToLobby(false);
        });
        api.addEventListener("participantLeft", (e) => {
          const id = (e as { id?: string } | undefined)?.id;
          if (cancelled || !id) return;
          remoteIds.delete(id);
          setRemoteCount(remoteIds.size);
        });
        api.addEventListener("filmstripDisplayChanged", (e) => {
          if (cancelled) return;
          filmstripVisibleRef.current = !!(e as { visible?: boolean } | undefined)?.visible;
        });
        api.addEventListener("readyToClose", () => {
          if (cancelled || goingToLobby) return;
          // JaaS has no embed cutoff, so this only fires when the user hangs up
          if (appId) {
            setLeft(true);
            onHangupRef.current?.();
            return;
          }
          setReconnecting(true);
          setTimeout(() => {
            if (cancelled) return;
            setVersion((v) => v + 1);
          }, 1500);
        });
      } catch (e) {
        console.error("[jitsi-meeting] load failed", e);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      try {
        apiRef.current?.dispose();
      } catch {
        /* ignore */
      }
      apiRef.current = null;
      if (container) container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, jitsiRoomName, displayName, appId, jwt, lobbyOn, holdForTeacher]);

  React.useEffect(() => {
    if (reconnecting) {
      const t = setTimeout(() => setReconnecting(false), 4000);
      return () => clearTimeout(t);
    }
  }, [reconnecting, version]);

  // Hide the filmstrip while alone (the large view already shows our own
  // camera) and bring it back once someone joins
  React.useEffect(() => {
    if (!waitingEnabled || !conferenceJoined) return;
    const want = remoteCount > 0;
    if (filmstripVisibleRef.current === want) return;
    apiRef.current?.executeCommand("toggleFilmStrip");
    filmstripVisibleRef.current = want;
  }, [waitingEnabled, conferenceJoined, remoteCount]);

  const waiting = waitingEnabled && remoteCount === 0;
  // Student: covers the meeting while the teacher isn't there (while in the
  // lobby the meeting shows Jitsi's own "asking to join" screen instead)
  const holding = holdForTeacher && (toLobby || (conferenceJoined && remoteCount === 0));

  return (
    <>
      <div className="absolute inset-0 flex flex-col sm:flex-row">
        {/* Stands in for the other person's video until they join */}
        {waiting && (
          <div className="flex-1 min-h-0 min-w-0 grid place-items-center bg-black text-white/70 border-b sm:border-b-0 sm:border-r border-white/10">
            <div className="px-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10">
                <User className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">{waitingLabel}</p>
            </div>
          </div>
        )}
        {/* Stays in the same slot so the iframe is resized, never remounted */}
        <div className="relative flex-1 min-h-0 min-w-0">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
      {holding && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black p-6 text-white">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10">
              {toLobby ? <Loader2 className="h-6 w-6 animate-spin" /> : <User className="h-6 w-6" />}
            </div>
            <p className="mt-3 text-sm font-semibold">
              {toLobby ? "Your teacher is here. Asking to join…" : waitForTeacherLabel}
            </p>
          </div>
        </div>
      )}
      {left && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/80 text-white">
          <div className="text-center">
            <p className="text-sm font-semibold">You left the class</p>
            <button
              onClick={() => {
                setLeft(false);
                setVersion((v) => v + 1);
                onRejoin?.();
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-white/90"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Rejoin
            </button>
          </div>
        </div>
      )}
      {reconnecting && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 text-white px-4 py-2 text-xs font-semibold backdrop-blur">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Reconnecting…
        </div>
      )}
      <button
        onClick={() => setVersion((v) => v + 1)}
        title="Reconnect meeting"
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 text-[11px] font-semibold backdrop-blur"
      >
        <RefreshCw className="h-3 w-3" /> Reconnect
      </button>
    </>
  );
}
