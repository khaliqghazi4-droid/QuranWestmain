import { pktDayMidnightUTC, pktDayYmd } from "@/lib/pkt-day";
import type { AttendanceDay } from "@/components/teacher/week-attendance-strip";

// Build the last N PKT calendar days as a strip, populating each day with the
// matching attendance record (if any).
export function buildWeekDays<
  R extends { date: Date; signInAt: Date; signOutAt: Date | null },
>(records: R[], daysToShow = 7): AttendanceDay[] {
  const today = pktDayMidnightUTC();
  const since = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);

  const byYmd = new Map<string, R>();
  for (const r of records) byYmd.set(pktDayYmd(r.date), r);

  const out: AttendanceDay[] = [];
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const ymd = pktDayYmd(d);
    const r = byYmd.get(ymd) ?? null;
    out.push({
      ymd,
      label: d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" }),
      dayOfMonth: Number(ymd.slice(-2)),
      isToday: d.getTime() === today.getTime(),
      record: r
        ? { signInAt: r.signInAt.toISOString(), signOutAt: r.signOutAt?.toISOString() ?? null }
        : null,
    });
  }
  return out;
}

export function weekTotalMs<
  R extends { signInAt: Date; signOutAt: Date | null },
>(records: R[]): number {
  let total = 0;
  for (const r of records) {
    if (r.signOutAt) total += r.signOutAt.getTime() - r.signInAt.getTime();
  }
  return total;
}
