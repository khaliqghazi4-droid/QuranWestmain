// The period the attendance page shows, read from its address:
//   ?view=week&end=YYYY-MM-DD   the 7 days ending that day (default: the last 7 days)
//   ?view=month&month=YYYY-MM   a calendar month (default: this month)
//   ?view=year&year=YYYY        a calendar year (default: this year)
//   ?view=custom&from=…&to=…    any range of days, at most MAX_DAYS long
// Days are PKT calendar days stored as 00:00 UTC, the same as
// TeacherAttendance.date, and both ends are included.

export type View = "week" | "month" | "year" | "custom";

export type Period = {
  view: View;
  from: Date;
  to: Date;
  fromYmd: string;
  toYmd: string;
  title: string; // "Oct 14 – 20, 2026", "October 2026", "2026"
  prevHref: string | null;
  nextHref: string | null;
  // what the Month and Year pickers start from
  month: string; // YYYY-MM
  year: number;
  // today's limits, for the pickers' max
  thisMonth: string;
  thisYear: number;
  todayYmd: string;
};

export const BASE = "/app/admin/teacher-attendance";
export const WEEK_DAYS = 7;
export const MAX_DAYS = 731;
export const FIRST_YEAR = 2024;
const DAY = 86_400_000;

export function ymdOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseYmd(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString("en-US", { timeZone: "UTC", ...o });

// "Oct 14 – 20, 2026", "Sep 28 – Oct 4, 2026", "Dec 1, 2025 – Jan 31, 2026"
export function rangeTitle(from: Date, to: Date) {
  const fy = from.getUTCFullYear();
  const ty = to.getUTCFullYear();
  if (from.getTime() === to.getTime()) return fmt(from, { month: "short", day: "numeric", year: "numeric" });
  if (fy === ty && from.getUTCMonth() === to.getUTCMonth()) {
    return `${fmt(from, { month: "short", day: "numeric" })} – ${fmt(to, { day: "numeric" })}, ${ty}`;
  }
  if (fy === ty) {
    return `${fmt(from, { month: "short", day: "numeric" })} – ${fmt(to, { month: "short", day: "numeric" })}, ${ty}`;
  }
  return `${fmt(from, { month: "short", day: "numeric", year: "numeric" })} – ${fmt(to, { month: "short", day: "numeric", year: "numeric" })}`;
}

export function parsePeriod(
  sp: Record<string, string | string[] | undefined>,
  today: Date
): Period {
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const todayYmd = ymdOf(today);
  const thisMonth = todayYmd.slice(0, 7);
  const thisYear = today.getUTCFullYear();
  const raw = get("view");
  const view: View = raw === "month" || raw === "year" || raw === "custom" ? raw : "week";
  const common = { thisMonth, thisYear, todayYmd };

  if (view === "month") {
    const m = get("month");
    const valid = !!m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) && m <= thisMonth && Number(m.slice(0, 4)) >= FIRST_YEAR;
    const month = valid ? m! : thisMonth;
    const [y, mo] = month.split("-").map(Number);
    const from = new Date(Date.UTC(y, mo - 1, 1));
    const to = new Date(Date.UTC(y, mo, 0));
    const prev = ymdOf(new Date(Date.UTC(y, mo - 2, 1))).slice(0, 7);
    const next = ymdOf(new Date(Date.UTC(y, mo, 1))).slice(0, 7);
    return {
      view, from, to, fromYmd: ymdOf(from), toYmd: ymdOf(to),
      title: fmt(from, { month: "long", year: "numeric" }),
      prevHref: Number(prev.slice(0, 4)) >= FIRST_YEAR ? `${BASE}?view=month&month=${prev}` : null,
      nextHref: next <= thisMonth ? `${BASE}?view=month&month=${next}` : null,
      month, year: y, ...common,
    };
  }

  if (view === "year") {
    const n = Number(get("year"));
    const year = Number.isInteger(n) && n >= FIRST_YEAR && n <= thisYear ? n : thisYear;
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year, 11, 31));
    return {
      view, from, to, fromYmd: ymdOf(from), toYmd: ymdOf(to),
      title: String(year),
      prevHref: year - 1 >= FIRST_YEAR ? `${BASE}?view=year&year=${year - 1}` : null,
      nextHref: year + 1 <= thisYear ? `${BASE}?view=year&year=${year + 1}` : null,
      month: year === thisYear ? thisMonth : `${year}-12`, year, ...common,
    };
  }

  if (view === "custom") {
    let from = parseYmd(get("from")) ?? new Date(Date.UTC(thisYear, today.getUTCMonth(), 1));
    let to = parseYmd(get("to")) ?? today;
    if (from > to) [from, to] = [to, from];
    if (to > today) to = today;
    if (from > to) from = to;
    if ((to.getTime() - from.getTime()) / DAY + 1 > MAX_DAYS) from = new Date(to.getTime() - (MAX_DAYS - 1) * DAY);
    return {
      view, from, to, fromYmd: ymdOf(from), toYmd: ymdOf(to),
      title: rangeTitle(from, to),
      prevHref: null, nextHref: null,
      month: ymdOf(to).slice(0, 7), year: to.getUTCFullYear(), ...common,
    };
  }

  // week: the 7 days ending `end` (today unless set), stepping 7 days at a time
  let end = parseYmd(get("end")) ?? today;
  if (end > today) end = today;
  const from = new Date(end.getTime() - (WEEK_DAYS - 1) * DAY);
  const prevEnd = new Date(end.getTime() - WEEK_DAYS * DAY);
  const nextEnd = new Date(Math.min(end.getTime() + WEEK_DAYS * DAY, today.getTime()));
  return {
    view, from, to: end, fromYmd: ymdOf(from), toYmd: ymdOf(end),
    title: rangeTitle(from, end),
    prevHref: prevEnd.getUTCFullYear() >= FIRST_YEAR ? `${BASE}?view=week&end=${ymdOf(prevEnd)}` : null,
    nextHref: end < today ? (nextEnd.getTime() === today.getTime() ? BASE : `${BASE}?view=week&end=${ymdOf(nextEnd)}`) : null,
    month: ymdOf(end).slice(0, 7), year: end.getUTCFullYear(), ...common,
  };
}
