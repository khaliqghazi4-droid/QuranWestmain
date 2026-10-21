// Shared by the Classes page (student cards), a student's schedule page and
// ClassesBoard. No "use client": the server pages call these too, and a
// function imported from a client module can't be called on the server.

export type AdminClass = {
  key: string; // unique per occurrence
  roomId: string; // "booking-<id>" | "trial-<id>"
  kind: "booking" | "trial";
  startUTC: number;
  durationMin: number;
  studentKey: string; // user id, or "trial-<requestId>" for a trial
  studentName: string;
  studentImage: string | null; // their uploaded photo; trials have none
  courseName: string;
  teacherName: string;
};

const PK_TZ = "Asia/Karachi";
const PKT_OFFSET_MS = 5 * 60 * 60_000;
export const DAY_MS = 24 * 60 * 60_000;

export const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: PK_TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
export const dayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: PK_TZ,
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
});
// "Wed, Oct 21"
export const shortDayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: PK_TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function startsIn(ms: number) {
  const min = Math.max(1, Math.round(ms / 60_000));
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return min % 60 ? `in ${h}h ${min % 60}m` : `in ${h}h`;
  const d = Math.round(h / 24);
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

// Time left as a ticking countdown, days first when there are any:
// "2 days 4h 05m 09s", "19h 38m 12s", "38m 12s", "12s"
export function countdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d} day${d === 1 ? "" : "s"} ${h}h ${pad(m)}m ${pad(s)}s`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

export function endsAt(c: AdminClass) {
  return c.startUTC + c.durationMin * 60_000;
}

// A student's weekly timetable read off their upcoming weekly classes: each
// PKT weekday + start time once, Monday first ("Wed 3:30 PM"). Trials are
// one-off, so they're left out.
export function weeklySlots(classes: AdminClass[]) {
  const slots = new Map<
    string,
    { order: number; day: string; time: string; endTime: string; courseName: string; teacherName: string }
  >();
  for (const c of classes) {
    if (c.kind !== "booking") continue;
    const pkt = new Date(c.startUTC + PKT_OFFSET_MS);
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][pkt.getUTCDay()];
    const time = timeFmt.format(c.startUTC);
    const id = `${day} ${time}`;
    if (slots.has(id)) continue;
    // Monday first, then by time of day
    const order = ((pkt.getUTCDay() + 6) % 7) * 24 * 60 + pkt.getUTCHours() * 60 + pkt.getUTCMinutes();
    slots.set(id, {
      order,
      day,
      time,
      endTime: timeFmt.format(endsAt(c)),
      courseName: c.courseName,
      teacherName: c.teacherName,
    });
  }
  return Array.from(slots.values()).sort((a, b) => a.order - b.order);
}
