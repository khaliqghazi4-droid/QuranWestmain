import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/avatar";
import { pktDayMidnightUTC } from "@/lib/pkt-day";
import { CalendarClock, LogIn, Clock, Percent, Sun, Moon, Check, X } from "lucide-react";
import { SHIFT_RANGES, type Shift } from "@/lib/shifts";
import { AttendanceHeader, AttendanceShell } from "./shell";
import { parsePeriod, ymdOf, WEEK_DAYS, type Period } from "./period";
import { PeriodPicker } from "./period-picker";

// Rendered per request, not at build time (the build has no database);
// the data itself stays cached for 10 minutes by unstable_cache below.
export const dynamic = "force-dynamic";

const DAY = 86_400_000;

function fmtDuration(ms: number) {
  if (ms <= 0) return "0h";
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// The teachers, their records between two PKT days, and today's records (for
// the "signed in today" count, whatever period is on screen). Cached per range.
const getCachedAttendance = unstable_cache(
  async (fromISO: string, toISO: string) => {
    const today = pktDayMidnightUTC();
    const [teachers, records, todayRecords] = await Promise.all([
      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true, email: true, country: true, shift: true, image: true, createdAt: true },
        orderBy: { name: "asc" },
      }),
      prisma.teacherAttendance.findMany({
        where: { date: { gte: new Date(fromISO), lte: new Date(toISO) } },
      }),
      prisma.teacherAttendance.findMany({ where: { date: today } }),
    ]);
    const plain = (r: (typeof records)[number]) => ({
      teacherId: r.teacherId,
      date: new Date(r.date).toISOString(),
      signInAt: new Date(r.signInAt).toISOString(),
      signOutAt: r.signOutAt ? new Date(r.signOutAt).toISOString() : null,
    });
    return {
      // createdAt as a string: the cache stores JSON, so a Date would come back as one anyway
      teachers: teachers.map(({ createdAt, ...t }) => ({ ...t, joinedISO: new Date(createdAt).toISOString() })),
      records: records.map(plain),
      todayRecords: todayRecords.map(plain),
      todayISO: today.toISOString(),
    };
  },
  ["admin-teacher-attendance"],
  { revalidate: 600 }
);

export default function AdminTeacherAttendancePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const period = parsePeriod(searchParams, pktDayMidnightUTC());
  return (
    // adm-night: the black-and-gold dark mode (globals.css), page by page
    <div className="adm-night space-y-6">
      <AttendanceHeader />
      <PeriodPicker
        view={period.view}
        title={period.title}
        fromYmd={period.fromYmd}
        toYmd={period.toYmd}
        month={period.month}
        year={period.year}
        prevHref={period.prevHref}
        nextHref={period.nextHref}
        thisMonth={period.thisMonth}
        thisYear={period.thisYear}
        todayYmd={period.todayYmd}
      />
      {/* keyed by the range, so the placeholder shows while another period loads */}
      <Suspense key={`${period.fromYmd}_${period.toYmd}`} fallback={<AttendanceShell />}>
        <AttendanceData period={period} />
      </Suspense>
    </div>
  );
}

type Day = {
  ymd: string;
  label: string; // "Mon"
  dayOfMonth: number;
  monthShort: string; // "Oct"
  isToday: boolean;
  isFuture: boolean;
  beforeJoin: boolean; // before the teacher's account existed: not counted
  record: { signInAt: string; signOutAt: string | null } | null;
};

// Every day of the period for one teacher, with their record if they came
function buildDays(
  period: Period,
  today: number,
  joinDay: number,
  byYmd: Map<string, { signInAt: string; signOutAt: string | null }>
): Day[] {
  const days: Day[] = [];
  for (let t = period.from.getTime(); t <= period.to.getTime(); t += DAY) {
    const d = new Date(t);
    const ymd = ymdOf(d);
    days.push({
      ymd,
      label: d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" }),
      dayOfMonth: d.getUTCDate(),
      monthShort: d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" }),
      isToday: t === today,
      isFuture: t > today,
      beforeJoin: t < joinDay,
      record: byYmd.get(ymd) ?? null,
    });
  }
  return days;
}

// Days present, days absent (past days with no sign-in since they joined;
// today only counts once they've signed in), hours worked (signed-out days)
// and the rate
function summarize(days: Day[]) {
  let present = 0;
  let due = 0;
  let ms = 0;
  for (const d of days) {
    if (d.record) {
      present++;
      due++;
      if (d.record.signOutAt) ms += new Date(d.record.signOutAt).getTime() - new Date(d.record.signInAt).getTime();
    } else if (!d.isToday && !d.isFuture && !d.beforeJoin) {
      due++;
    }
  }
  return { present, absent: due - present, due, ms, rate: due ? present / due : null };
}

// Sizes and gaps are written out ([13px], [12px]…) throughout: the website's
// Bootstrap sheet overrides .text-sm, .text-xs, .gap-3, .border and friends.
async function AttendanceData({ period }: { period: Period }) {
  const { teachers, records, todayRecords, todayISO } = await getCachedAttendance(
    period.from.toISOString(),
    period.to.toISOString()
  );
  const today = new Date(todayISO).getTime();
  const totalDays = Math.round((period.to.getTime() - period.from.getTime()) / DAY) + 1;
  // How the days are drawn: tiles for a week, a square per day up to two
  // months, a bar per month beyond that
  const mode = totalDays <= WEEK_DAYS ? "tiles" : totalDays <= 62 ? "days" : "months";

  const byTeacher = new Map<string, Map<string, { signInAt: string; signOutAt: string | null }>>();
  for (const r of records) {
    const m = byTeacher.get(r.teacherId) ?? new Map();
    m.set(r.date.slice(0, 10), { signInAt: r.signInAt, signOutAt: r.signOutAt });
    byTeacher.set(r.teacherId, m);
  }

  const rows = teachers.map((t) => {
    const joinDay = pktDayMidnightUTC(new Date(t.joinedISO)).getTime();
    const days = buildDays(period, today, joinDay, byTeacher.get(t.id) ?? new Map());
    return { teacher: t, days, sum: summarize(days) };
  });

  const signedInToday = todayRecords.length;
  const stillWorking = todayRecords.filter((r) => !r.signOutAt).length;
  const totalMs = rows.reduce((s, r) => s + r.sum.ms, 0);
  const totalPresent = rows.reduce((s, r) => s + r.sum.present, 0);
  const totalDue = rows.reduce((s, r) => s + r.sum.due, 0);
  const totalAbsent = totalDue - totalPresent;

  const stats = [
    { icon: CalendarClock, label: "Teachers", value: String(teachers.length) },
    {
      icon: LogIn,
      label: "Signed in today",
      value: `${signedInToday}/${teachers.length}`,
      sub: `${stillWorking} still working`,
    },
    { icon: Clock, label: "Hours worked", value: fmtDuration(totalMs), sub: period.title },
    {
      icon: Percent,
      label: "Attendance",
      value: totalDue ? `${Math.round((totalPresent / totalDue) * 100)}%` : "–",
      sub: `${totalAbsent} ${totalAbsent === 1 ? "absence" : "absences"}`,
    },
  ];

  return (
    <>
      {/* Counts as one strip, as on the teacher profile */}
      <div className="adm-glass grid grid-cols-2 overflow-hidden rounded-2xl border-[1px] border-border bg-card sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-[10px] px-[14px] py-[16px] sm:gap-[12px] sm:px-[20px] sm:py-[18px] ${
              i % 2 === 1 ? "border-l border-border" : ""
            } ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}
          >
            <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary sm:h-11 sm:w-11">
              <s.icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-[18px] font-bold leading-[24px] sm:text-[22px] sm:leading-[26px]">{s.value}</p>
              <p className="text-[12.5px] leading-[17px] text-muted-foreground">{s.label}</p>
              {s.sub && <p className="truncate text-[11px] leading-[15px] text-muted-foreground">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {teachers.length === 0 ? (
        <div className="adm-glass rounded-2xl border-[1px] border-dashed border-border bg-card/50 p-[48px] text-center">
          <p className="text-[14px] text-muted-foreground">No teachers in the academy yet.</p>
        </div>
      ) : (
        <section className="adm-glass overflow-hidden rounded-2xl border-[1px] border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-[12px] px-[20px] py-[16px]">
            <div>
              <h2 className="text-[16px] font-bold leading-[22px]">{period.title}</h2>
              <p className="text-[12.5px] leading-[18px] text-muted-foreground">
                {totalDays} {totalDays === 1 ? "day" : "days"} · times in PKT
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-[14px] text-[12px] leading-[16px] text-muted-foreground">
              <Legend className="bg-emerald-500">Present</Legend>
              <Legend className="bg-[hsl(var(--primary))]">Signed in</Legend>
              <Legend className="bg-rose-500">Absent</Legend>
              {mode !== "tiles" && <Legend className="bg-foreground/[0.12]">Upcoming / before joining</Legend>}
            </ul>
          </div>

          <ul className="adm-rows divide-y divide-border border-t border-border">
            {rows.map(({ teacher: t, days, sum }) => {
              const shift = t.shift as Shift | null;
              return (
                <li
                  key={t.id}
                  className="grid gap-x-[24px] gap-y-[14px] px-[20px] py-[18px] xl:grid-cols-[250px_minmax(0,1fr)_160px] xl:items-center"
                >
                  {/* Who */}
                  <Link href={`/app/admin/teachers/${t.id}`} className="group flex min-w-0 items-center gap-[12px]">
                    <Avatar name={t.name} src={t.image} size={44} />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold leading-[21px] transition-opacity group-hover:opacity-80">
                        {t.name}
                      </p>
                      <p className="truncate text-[12px] leading-[17px] text-muted-foreground">
                        {t.email}
                        {t.country ? ` · ${t.country}` : ""}
                      </p>
                      {shift && (
                        <span className="mt-[4px] inline-flex items-center gap-[4px] rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-semibold leading-[16px] text-primary">
                          {shift === "DAY" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                          {SHIFT_RANGES[shift].label}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* The days */}
                  {mode === "tiles" ? (
                    <div className="grid gap-[6px] sm:gap-[8px]" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                      {days.map((d) => (
                        <DayTile key={d.ymd} day={d} />
                      ))}
                    </div>
                  ) : mode === "days" ? (
                    <DaySquares days={days} />
                  ) : (
                    <MonthBars days={days} />
                  )}

                  {/* The period's totals */}
                  <div className="flex items-center gap-[16px] xl:block xl:space-y-[10px]">
                    <div className="flex items-center gap-[8px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[15px] font-bold leading-[20px]">{fmtDuration(sum.ms)}</p>
                        <p className="text-[11px] leading-[14px] text-muted-foreground">
                          hours · {sum.absent} {sum.absent === 1 ? "absence" : "absences"}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-[120px] flex-1 xl:flex-none">
                      <div className="flex items-baseline justify-between text-[11px] leading-[14px] text-muted-foreground">
                        <span>Days present</span>
                        <span className="text-[12.5px] font-bold text-foreground">
                          {sum.present}/{sum.due}
                          {sum.rate !== null && (
                            <span className="ml-[4px] font-semibold text-muted-foreground">{Math.round(sum.rate * 100)}%</span>
                          )}
                        </span>
                      </div>
                      <div className="adm-track mt-[6px] h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${(sum.rate ?? 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-[6px]">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} /> {children}
    </li>
  );
}

function dayTitle(d: Day) {
  const date = `${d.label} ${d.monthShort} ${d.dayOfMonth}`;
  const r = d.record;
  if (r) return `${date}: in ${fmtTime(r.signInAt)}${r.signOutAt ? `, out ${fmtTime(r.signOutAt)}` : ", still in"}`;
  if (d.isFuture) return `${date}: upcoming`;
  if (d.beforeJoin) return `${date}: before joining`;
  if (d.isToday) return `${date}: not signed in yet`;
  return `${date}: absent`;
}

// One day of a week: weekday and date, then what happened. On phones the
// tiles are narrow, so only the status icon shows; the times are in the tooltip.
function DayTile({ day: d }: { day: Day }) {
  const r = d.record;
  const live = !!r && !r.signOutAt;
  const durationMs = r?.signOutAt ? new Date(r.signOutAt).getTime() - new Date(r.signInAt).getTime() : 0;
  const absent = !r && !d.isToday && !d.isFuture && !d.beforeJoin;

  return (
    <div
      title={dayTitle(d)}
      // The edge colours carry `!`: globals.css gives every border inside the
      // dashboards the theme's border colour (`.admin-dashboard *`), which
      // otherwise wins over a plain border-colour class
      className={`relative flex min-w-0 flex-col items-center rounded-xl border-[1px] px-[2px] pb-[8px] pt-[8px] text-center sm:px-[6px] ${
        d.isToday
          ? "!border-[hsl(var(--primary))] bg-background shadow-[0_6px_16px_-10px_rgb(0_0_0/0.35)]"
          : r
            ? live
              ? "!border-primary/30 bg-primary/5"
              : "!border-emerald-500/30 bg-emerald-500/[0.06]"
            : "border-border bg-background/60"
      }`}
    >
      {d.isToday && (
        <span className="adm-badge absolute -top-[9px] left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-[7px] py-[1px] text-[9px] font-bold uppercase leading-[14px] tracking-[0.06em] text-primary-foreground">
          Today
        </span>
      )}
      <span className="text-[10px] font-semibold uppercase leading-[14px] tracking-[0.06em] text-muted-foreground">
        {d.label}
      </span>
      <span className="text-[16px] font-bold leading-[22px]">{d.dayOfMonth}</span>

      <div className="mt-[6px] flex min-h-[22px] items-center justify-center">
        {r ? (
          live ? (
            <span className="inline-flex items-center gap-[5px] rounded-full bg-primary/10 px-[6px] py-[2px] text-[11px] font-semibold leading-[16px] text-primary">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--primary))] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
              </span>
              <span className="hidden sm:inline">In</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-[4px] rounded-full bg-emerald-500/10 px-[6px] py-[2px] text-[11px] font-semibold leading-[16px] text-emerald-700">
              <Check className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">{fmtDuration(durationMs)}</span>
            </span>
          )
        ) : absent ? (
          <span className="inline-flex items-center gap-[4px] rounded-full bg-rose-500/10 px-[6px] py-[2px] text-[11px] font-semibold leading-[16px] text-rose-600">
            <X className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">Absent</span>
          </span>
        ) : (
          <span className="text-[11px] italic leading-[16px] text-muted-foreground">
            <span className="hidden sm:inline">{d.isToday ? "Not yet" : "–"}</span>
            <span className="sm:hidden">–</span>
          </span>
        )}
      </div>

      {r && (
        <span className="mt-[4px] hidden text-[10.5px] leading-[14px] text-muted-foreground sm:block">
          {fmtTime(r.signInAt)}
          {r.signOutAt && (
            <>
              <br />
              {fmtTime(r.signOutAt)}
            </>
          )}
        </span>
      )}
    </div>
  );
}

// A month or so: one square per day (hover shows the times), with the day
// numbers every five days and the month's name where a month begins
function DaySquares({ days }: { days: Day[] }) {
  const cols = { gridTemplateColumns: `repeat(${days.length}, minmax(4px, 1fr))` };
  // A day number is left out just before a month's name, where they would collide
  const label = (d: Day, i: number) => {
    if (d.dayOfMonth === 1) return d.monthShort;
    if (days.slice(i + 1, i + 3).some((n) => n.dayOfMonth === 1)) return "";
    return i === 0 || d.dayOfMonth % 5 === 0 ? d.dayOfMonth : "";
  };
  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="grid gap-[2px] sm:gap-[3px]" style={cols}>
        {days.map((d) => {
          const r = d.record;
          return (
            <div
              key={d.ymd}
              title={dayTitle(d)}
              className={`h-[26px] rounded-[5px] ${
                r
                  ? r.signOutAt
                    ? "bg-emerald-500"
                    : "bg-[hsl(var(--primary))]"
                  : d.isFuture || d.beforeJoin
                    ? "bg-foreground/[0.07]"
                    : d.isToday
                      ? "border-[1.5px] border-dashed !border-[hsl(var(--primary))]"
                      : "bg-rose-400/80"
              }`}
            />
          );
        })}
      </div>
      <div className="mt-[4px] grid gap-[2px] sm:gap-[3px]" style={cols}>
        {days.map((d, i) => (
          <span
            key={d.ymd}
            className="overflow-visible whitespace-nowrap text-center text-[9.5px] leading-[12px] text-muted-foreground"
          >
            {label(d, i)}
          </span>
        ))}
      </div>
    </div>
  );
}

// A year or longer: one bar per month, filled to the share of that month's
// days (so far) the teacher came, with the count above it
function MonthBars({ days }: { days: Day[] }) {
  const months: { key: string; label: string; year: number; days: Day[] }[] = [];
  for (const d of days) {
    const key = d.ymd.slice(0, 7);
    let m = months[months.length - 1];
    if (!m || m.key !== key) {
      m = { key, label: d.monthShort, year: Number(d.ymd.slice(0, 4)), days: [] };
      months.push(m);
    }
    m.days.push(d);
  }
  const cols = { gridTemplateColumns: `repeat(${months.length}, minmax(22px, 1fr))` };
  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="grid items-end gap-[6px]" style={cols}>
        {months.map((m) => {
          const s = summarize(m.days);
          const upcoming = s.due === 0;
          return (
            <div
              key={m.key}
              title={
                upcoming
                  ? `${m.label} ${m.year}: nothing to count (upcoming or before joining)`
                  : `${m.label} ${m.year}: ${s.present} of ${s.due} days · ${fmtDuration(s.ms)}`
              }
              className="flex flex-col items-center"
            >
              <span className="mb-[3px] text-[10.5px] font-semibold leading-[14px] text-muted-foreground">
                {upcoming ? "" : s.present}
              </span>
              <div className="relative h-[48px] w-full max-w-[34px] overflow-hidden rounded-[6px] bg-foreground/[0.07]">
                {!upcoming && (
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-[6px] ${s.present ? "bg-emerald-500" : ""}`}
                    style={{ height: `${Math.max(s.rate ?? 0, 0) * 100}%` }}
                  />
                )}
                {!upcoming && s.present === 0 && (
                  <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-rose-400" />
                )}
              </div>
              <span className="mt-[4px] text-[10px] leading-[13px] text-muted-foreground">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
