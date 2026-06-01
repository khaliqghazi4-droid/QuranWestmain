// Helpers for checking whether a teacher is free at a given trial time
// (PKT-based comparison against recurring bookings + other trial assignments).

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const SLOT_MINUTES = 30;

export function pktBucket(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const pkt = new Date(d.getTime() + PKT_OFFSET_MS);
  return {
    dayOfWeek: pkt.getUTCDay(),
    minutes: pkt.getUTCHours() * 60 + pkt.getUTCMinutes(),
    ms: d.getTime(),
  };
}

export function hhmmToMin(s: string) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

type BookingLite = { dayOfWeek: number; startTime: string; duration: number };
type AssignLite = { trialTime: Date | string; mongoEnrollmentId?: string };

export function checkTeacherFree(opts: {
  trialTime: Date | string;
  ignoreMongoId?: string; // skip same-trial when re-assigning
  teacherBookings: BookingLite[];
  otherAssignments: AssignLite[];
}): { free: boolean; reason: string | null } {
  const t = pktBucket(opts.trialTime);
  const tEnd = t.minutes + SLOT_MINUTES;

  for (const b of opts.teacherBookings) {
    if (b.dayOfWeek !== t.dayOfWeek) continue;
    const bStart = hhmmToMin(b.startTime);
    const bEnd = bStart + (b.duration ?? SLOT_MINUTES);
    if (bStart < tEnd && t.minutes < bEnd) {
      return { free: false, reason: `Booked ${b.startTime} PKT` };
    }
  }

  for (const o of opts.otherAssignments) {
    if (opts.ignoreMongoId && o.mongoEnrollmentId === opts.ignoreMongoId) continue;
    const otherMs = new Date(o.trialTime).getTime();
    if (Math.abs(t.ms - otherMs) < SLOT_MINUTES * 60_000) {
      return { free: false, reason: "Another trial at this time" };
    }
  }

  return { free: true, reason: null };
}
