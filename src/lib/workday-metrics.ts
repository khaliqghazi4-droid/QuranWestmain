// Late / overtime metrics for a teacher's workday, relative to their shift.
// Pakistan is a fixed UTC+5 offset (no DST), so we can build PKT-anchored
// instants by appending +05:00 to an ISO string.

export type ShiftKind = "DAY" | "NIGHT" | null;

// Office hours per shift (PKT)
const SHIFT_HOURS: Record<Exclude<ShiftKind, null>, { start: string; end: string; crossesMidnight: boolean }> = {
  DAY: { start: "13:00", end: "21:00", crossesMidnight: false },
  NIGHT: { start: "21:00", end: "04:00", crossesMidnight: true },
};

export function shiftLabel(shift: ShiftKind): string {
  if (!shift) return "No shift assigned";
  return shift === "DAY" ? "1:00 PM – 9:00 PM PKT" : "9:00 PM – 4:00 AM PKT";
}

// Get expected start/end as UTC instants for the PKT day that `dayKey` represents.
// `dayKey` is a Date stored at PKT day's UTC midnight key (the one we save in DB).
export function shiftWindowUTC(dayKey: Date, shift: ShiftKind): { start: Date; end: Date } | null {
  if (!shift) return null;
  const hours = SHIFT_HOURS[shift];
  // dayKey is e.g. 2026-06-02T00:00:00Z (a label for PKT day 2026-06-02).
  const ymd = dayKey.toISOString().slice(0, 10);
  const start = new Date(`${ymd}T${hours.start}:00+05:00`);
  // For night shift, the end is on the next PKT day at 04:00
  const endYmd = hours.crossesMidnight
    ? new Date(dayKey.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : ymd;
  const end = new Date(`${endYmd}T${hours.end}:00+05:00`);
  return { start, end };
}

export type WorkdayMetrics = {
  lateMin: number;       // minutes late checking in (0 if on time / no shift)
  overtimeMin: number;   // minutes worked past shift end (0 if none)
  workedMs: number;      // total worked duration (0 if not checked out)
  status: "On Time" | "Late" | "Working" | "Absent";
};

export function workdayMetrics(
  record: { signInAt: Date | string; signOutAt: Date | string | null } | null,
  dayKey: Date,
  shift: ShiftKind
): WorkdayMetrics {
  if (!record) {
    return { lateMin: 0, overtimeMin: 0, workedMs: 0, status: "Absent" };
  }
  const inAt = new Date(record.signInAt);
  const outAt = record.signOutAt ? new Date(record.signOutAt) : null;
  const win = shiftWindowUTC(dayKey, shift);

  let lateMin = 0;
  let overtimeMin = 0;
  if (win) {
    const diffInMs = inAt.getTime() - win.start.getTime();
    if (diffInMs > 0) lateMin = Math.round(diffInMs / 60_000);
    if (outAt) {
      const diffOutMs = outAt.getTime() - win.end.getTime();
      if (diffOutMs > 0) overtimeMin = Math.round(diffOutMs / 60_000);
    }
  }

  const workedMs = outAt ? outAt.getTime() - inAt.getTime() : 0;
  const status: WorkdayMetrics["status"] = outAt
    ? lateMin > 0
      ? "Late"
      : "On Time"
    : "Working";

  return { lateMin, overtimeMin, workedMs, status };
}

export function fmtDurationHM(ms: number): string {
  if (ms <= 0) return "0h";
  const m = Math.round(ms / 60_000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}m`;
  if (mm === 0) return `${h}h`;
  return `${h}h ${mm}m`;
}

export function fmtMinutes(min: number): string {
  if (min <= 0) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Time formatters for the two timezones we display
export function fmtPKT(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function fmtUK(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-US", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
