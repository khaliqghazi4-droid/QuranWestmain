import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Globe,
  GraduationCap,
  Hourglass,
  Mail,
  Phone,
  TrendingUp,
  Trophy,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { IconBadge } from "@/components/dashboard/icon-badge";
import { formatTime12h } from "@/lib/timezones";

// One student's report, as plain JSON (dates as ISO strings), so the server
// page and the Reports page's pop-up can both show it. Loaded by
// loadStudentReport (src/lib/student-report.ts).
export type StudentReportData = {
  student: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    timezone: string | null;
    bio: string | null;
    image: string | null;
    createdAt: string;
    suspended: boolean;
    accessExpiresAt: string | null; // free-trial logins
  };
  enrollments: Array<{
    id: string;
    progress: number;
    status: string;
    startedAt: string;
    course: { id: string; name: string; duration: string | null; level: string };
    teacherName: string | null;
    lessonsCompleted: number;
  }>;
  bookings: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string; // "HH:MM" PKT
    duration: number;
    courseName: string;
    teacherName: string;
  }>;
  attendance: {
    present: number;
    late: number;
    absent: number;
    // newest first; `date` is the PKT calendar day stored at 00:00 UTC
    recent: Array<{
      id: string;
      status: "PRESENT" | "LATE" | "ABSENT";
      date: string;
      startTime: string;
      courseName: string;
      teacherName: string;
    }>;
  };
  lessonsCompleted: number;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const percent = (part: number, whole: number) => Math.round((part / whole) * 100);
const plural = (n: number, word: string, words = `${word}s`) => `${n} ${n === 1 ? word : words}`;
const pkt = (iso: string | Date, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", ...opts });
const utcDay = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });

// The report, laid out like a teacher's page: the header card (banner,
// photo, name, tags, the four counts) beside About, then courses with weekly
// classes, then attendance. `actions` sit beside the name (not printed);
// `children` come after attendance. A letterhead and footer show on paper
// only: printing shows .adm-report alone (globals.css).
// Sizes and gaps are written out ([13px], [16px]…) throughout: the website's
// Bootstrap sheet overrides .text-sm, .text-xs, .gap-3, .border and friends.
export function StudentReport({
  data,
  actions,
  children,
}: {
  data: StudentReportData;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { student, enrollments, bookings, attendance } = data;

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;
  const completedCourses = enrollments.filter((e) => e.progress >= 100).length;

  // As on the Reports page, a late student still came to class
  const marked = attendance.present + attendance.late + attendance.absent;
  const attendancePct = marked ? percent(attendance.present + attendance.late, marked) : null;
  const tally = [
    { key: "present", label: "Present", icon: CheckCircle2, bar: "bg-emerald-500", count: attendance.present },
    { key: "late", label: "Late", icon: Clock, bar: "bg-amber-500", count: attendance.late },
    { key: "absent", label: "Absent", icon: XCircle, bar: "bg-destructive", count: attendance.absent },
  ];

  // The week from Monday, each day with its classes in time order
  const week = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => ({
      day: d,
      classes: bookings.filter((b) => b.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
    .filter((d) => d.classes.length > 0);

  const joined = pkt(student.createdAt, { month: "short", day: "numeric", year: "numeric" });

  // Suspended, on a free-trial login, or simply active
  const now = new Date();
  const trialEnds = student.accessExpiresAt ? new Date(student.accessExpiresAt) : null;
  const status: { tone: Tone; label: string } = student.suspended
    ? { tone: "red", label: "Suspended" }
    : trialEnds && trialEnds < now
    ? { tone: "muted", label: "Trial login ended" }
    : trialEnds
    ? { tone: "amber", label: `Trial login until ${pkt(trialEnds, { month: "short", day: "numeric" })}` }
    : { tone: "green", label: "Active" };

  const stats = [
    { icon: BookOpen, label: "Courses", value: enrollments.length },
    { icon: TrendingUp, label: "Avg progress", value: `${avgProgress}%` },
    { icon: GraduationCap, label: "Lessons done", value: data.lessonsCompleted },
    { icon: ClipboardCheck, label: "Attendance", value: attendancePct === null ? "—" : `${attendancePct}%` },
  ];

  const contact = [
    { icon: Mail, label: "Email", value: student.email },
    { icon: Phone, label: "Phone", value: student.phone },
    { icon: Globe, label: "Country", value: student.country },
    { icon: Clock, label: "Time zone", value: student.timezone?.replace(/_/g, " ") },
  ];

  return (
    // adm-report: what globals.css prints, on its own, when Print is pressed.
    // text-foreground: in dark mode the text would take Bootstrap's grey body colour
    <div className="adm-report text-foreground">
      {/* Letterhead, on paper only. Outside the spaced column below: as a
          hidden sibling there it still gave the first card a top margin. */}
      <div className="mb-[20px] hidden items-center justify-between gap-[16px] border-b-[2px] border-border pb-[14px] print:flex">
        <div className="flex items-center gap-[14px]">
          {/* the logo carries the "Quran West" wordmark itself */}
          <Image
            src="/quran-academy-logo.png"
            alt="Quran West Academy"
            width={119}
            height={48}
            className="h-[48px] w-auto object-contain"
          />
          <div className="border-l border-border pl-[14px]">
            <p className="text-[18px] font-bold leading-[24px]">Student progress report</p>
            <p className="text-[12px] leading-[16px] text-muted-foreground">Quran West Academy</p>
          </div>
        </div>
        <p className="text-right text-[12px] leading-[16px] text-muted-foreground">
          Printed {pkt(now, { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="space-y-[20px]">
        {/* Top row: the header card with About beside it (same height) */}
        <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="adm-glass flex flex-col overflow-hidden rounded-2xl border-[1px] border-border bg-card">
            <div className="adm-cover relative h-[112px] overflow-hidden bg-gradient-to-br from-primary via-accent to-primary print:hidden">
              <span className="absolute right-[16px] top-[16px] z-[1] inline-flex items-center gap-[6px] rounded-full bg-white/15 px-[12px] py-[5px] text-[12px] font-semibold leading-[16px] text-white ring-1 ring-white/25 backdrop-blur-sm">
                <CalendarDays className="h-3.5 w-3.5" /> Joined {joined}
              </span>
            </div>

            <div className="px-[20px] pb-[20px] sm:px-[28px] print:pt-[20px]">
              {/* items-start: the photo rises 56px into the banner while the
                  name keeps clear of it */}
              <div className="flex flex-wrap items-start justify-between gap-[16px]">
                <div className="flex min-w-0 flex-wrap items-start gap-x-[20px] gap-y-[8px]">
                  <div className="relative z-[1] -mt-[56px] shrink-0 print:mt-[0px]">
                    <Avatar
                      name={student.name}
                      src={student.image}
                      size={112}
                      className="border-4 border-card shadow-[0_14px_30px_-12px_rgb(0_0_0/0.45)]"
                    />
                  </div>
                  <div className="min-w-0 pt-[16px]">
                    <h1 className="break-words text-[26px] font-bold leading-[32px]">{student.name}</h1>
                    <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
                      <Tag icon={GraduationCap}>Student</Tag>
                      <Tag tone={status.tone} dot>
                        {status.label}
                      </Tag>
                      <Tag icon={CalendarDays} className="hidden print:inline-flex">
                        Joined {joined}
                      </Tag>
                    </div>
                  </div>
                </div>
                {actions && <div className="flex items-center gap-[8px] sm:pt-[24px] print:hidden">{actions}</div>}
              </div>
            </div>

            <div className="adm-rows mt-auto grid grid-cols-2 border-t border-border sm:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  // Tighter than the teacher's strip: "Avg progress" and "Lessons
                  // done" stay on one line in a quarter of the card
                  className={`flex items-center gap-[10px] px-[20px] py-[16px] sm:px-[18px] ${
                    i % 2 === 1 ? "border-l border-border" : ""
                  } ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}
                >
                  <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <s.icon className="h-[17px] w-[17px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[20px] font-bold leading-[24px] tabular-nums">{s.value}</p>
                    <p className="whitespace-nowrap text-[12px] leading-[16px] text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ReportCard title="About">
            <div className="px-[20px] pb-[20px]">
              <p className="whitespace-pre-line text-[13.5px] leading-[22px]">
                {student.bio?.trim() || <span className="italic text-muted-foreground">No bio added yet.</span>}
              </p>
              <dl className="mt-[14px] divide-y divide-border border-t border-border">
                {contact.map((c) => (
                  <div key={c.label} className="flex items-center gap-[10px] py-[10px]">
                    <span className="adm-icon grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                      <c.icon className="h-3.5 w-3.5" />
                    </span>
                    {/* font-normal / mb-[0px]: Bootstrap makes dt bold and gives dd a bottom margin */}
                    <dt className="shrink-0 text-[12.5px] font-normal leading-[18px] text-muted-foreground">{c.label}</dt>
                    <dd
                      // pr: room for the italic "Not set", whose t leans past the clip edge
                      className="mb-[0px] min-w-0 flex-1 truncate pr-[2px] text-right text-[13px] font-medium leading-[18px]"
                      title={c.value?.trim() || undefined}
                    >
                      {c.value?.trim() || <span className="font-normal italic text-muted-foreground">Not set</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </ReportCard>
        </div>

        {/* Courses beside the weekly classes, in the same columns as above */}
        <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <ReportCard
            title="Course progress"
            count={enrollments.length}
            action={
              // Not on phones, where it pushed the title onto two lines; the
              // finished courses still show their own Completed tag and 100%
              completedCourses > 0 && (
                <span className="hidden items-center gap-[6px] whitespace-nowrap rounded-full bg-emerald-500/10 px-[10px] py-[3px] text-[12px] font-semibold leading-[18px] text-emerald-600 sm:inline-flex">
                  <Trophy className="h-3.5 w-3.5" /> {completedCourses} completed
                </span>
              )
            }
          >
            {enrollments.length === 0 ? (
              <Empty icon={BookOpen}>Not enrolled in any course yet.</Empty>
            ) : (
              <ul className="adm-rows divide-y divide-border">
                {enrollments.map((e) => {
                  const done = e.progress >= 100;
                  return (
                    <li key={e.id} className="px-[20px] py-[16px] print:break-inside-avoid">
                      <div className="flex items-center gap-[12px]">
                        <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                          <BookOpen className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px]">
                            <p className="min-w-0 break-words text-[14.5px] font-semibold leading-[20px]">{e.course.name}</p>
                            <span className="rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-semibold leading-[16px] text-primary">
                              {e.course.level}
                            </span>
                            {done && (
                              <span className="inline-flex items-center gap-[4px] rounded-full bg-emerald-500/10 px-[8px] py-[1px] text-[11px] font-semibold leading-[16px] text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Completed
                              </span>
                            )}
                            {e.status === "paused" && (
                              <span className="rounded-full bg-muted px-[8px] py-[1px] text-[11px] font-semibold leading-[16px] text-muted-foreground">
                                Paused
                              </span>
                            )}
                          </div>
                          <p className="mt-[2px] text-[12px] leading-[16px] text-muted-foreground">
                            Started {pkt(e.startedAt, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-[22px] font-bold leading-[26px] tabular-nums ${
                            done ? "text-emerald-600" : e.progress === 0 ? "text-muted-foreground" : ""
                          }`}
                        >
                          {e.progress}%
                        </p>
                      </div>
                      <div className="adm-track mt-[12px] h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <div className="mt-[10px] flex flex-wrap gap-x-[16px] gap-y-[6px] text-[12.5px] leading-[18px] text-muted-foreground">
                        <span className="inline-flex items-center gap-[8px]">
                          <IconBadge icon={UserRound} />
                          {e.teacherName ?? <span className="italic">No teacher yet</span>}
                        </span>
                        {e.course.duration && (
                          <span className="inline-flex items-center gap-[8px]">
                            <IconBadge icon={Hourglass} /> {e.course.duration}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-[8px]">
                          <IconBadge icon={GraduationCap} />
                          {plural(e.lessonsCompleted, "lesson")} done
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </ReportCard>

          <ReportCard
            title="Weekly classes"
            count={bookings.length}
            action={
              <Link
                href={`/app/admin/classes/${student.id}`}
                className="text-[13px] font-semibold leading-[18px] text-primary hover:underline print:hidden"
              >
                Open schedule
              </Link>
            }
          >
            {week.length === 0 ? (
              <Empty icon={Calendar}>No weekly classes booked yet.</Empty>
            ) : (
              <ul className="adm-rows divide-y divide-border">
                {week.map((d) => (
                  <li key={d.day} className="flex gap-[14px] px-[20px] py-[14px] print:break-inside-avoid">
                    <span className="adm-badge grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-[13px] font-bold leading-[18px] text-primary-foreground">
                      {DAYS[d.day]}
                    </span>
                    <div className="min-w-0 flex-1 space-y-[8px]">
                      {d.classes.map((b) => (
                        <div key={b.id} className="min-w-0">
                          <p className="text-[13.5px] font-semibold leading-[20px]">
                            {formatTime12h(b.startTime)} PKT
                            <span className="font-normal text-muted-foreground"> · {b.duration} min</span>
                          </p>
                          <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">
                            {b.courseName} · with {b.teacherName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ReportCard>
        </div>

        <ReportCard
          title="Attendance"
          count={marked}
          action={
            marked > 0 && <span className="text-[12px] leading-[16px] text-muted-foreground">Late counts as attended</span>
          }
        >
          {attendancePct === null ? (
            <Empty icon={ClipboardCheck}>No classes marked yet. Teachers mark attendance after each class.</Empty>
          ) : (
            <div className="grid gap-[16px] px-[20px] pb-[20px] md:grid-cols-[280px_minmax(0,1fr)]">
              {/* The rate, one bar split three ways, and the three counts */}
              <div className="adm-tile self-start rounded-xl border-[1px] border-border bg-background/60 p-[16px] print:break-inside-avoid">
                <p className="text-[34px] font-bold leading-[40px] tabular-nums">{attendancePct}%</p>
                <p className="text-[12.5px] leading-[18px] text-muted-foreground">
                  attended, of {plural(marked, "class", "classes")} marked
                </p>
                <div className="mt-[14px] flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-muted">
                  {tally.map(
                    (t) =>
                      t.count > 0 && (
                        <div key={t.key} className={t.bar} style={{ width: `${(t.count / marked) * 100}%` }} />
                      )
                  )}
                </div>
                <ul className="mt-[14px] space-y-[10px]">
                  {tally.map((t) => (
                    <li key={t.key} className="flex items-center gap-[10px]">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white ${t.bar}`}>
                        <t.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 text-[13px] leading-[18px]">{t.label}</span>
                      <span className="text-[14px] font-bold leading-[18px] tabular-nums">{t.count}</span>
                      <span className="w-[40px] text-right text-[12px] leading-[18px] text-muted-foreground tabular-nums">
                        {percent(t.count, marked)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The latest marks, newest first */}
              <div className="min-w-0">
                <p className="mb-[8px] text-[10px] font-bold uppercase leading-[14px] tracking-[0.1em] text-muted-foreground">
                  Latest classes
                </p>
                <ul className="adm-rows divide-y divide-border overflow-hidden rounded-xl border-[1px] border-border">
                  {attendance.recent.map((m) => (
                    <li key={m.id} className="flex items-center gap-[12px] px-[14px] py-[10px] print:break-inside-avoid">
                      <span className="adm-icon grid h-11 w-11 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-center text-primary">
                        <span className="block text-[15px] font-bold leading-[17px]">{utcDay(m.date, { day: "numeric" })}</span>
                        <span className="block text-[10px] font-semibold uppercase leading-[12px]">
                          {utcDay(m.date, { month: "short" })}
                        </span>
                      </span>
                      {/* Phones: the status moves under the course name, so the
                          name gets the row's full width */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold leading-[19px]">{m.courseName}</p>
                        <div className="mt-[2px] flex min-w-0 items-center gap-[8px] sm:mt-[0px]">
                          <StatusPill status={m.status} className="inline-flex sm:hidden" />
                          <p className="min-w-0 truncate text-[12px] leading-[17px] text-muted-foreground">
                            {utcDay(m.date, { weekday: "short" })} · {formatTime12h(m.startTime)} PKT · with{" "}
                            {m.teacherName}
                          </p>
                        </div>
                      </div>
                      <StatusPill status={m.status} className="hidden sm:inline-flex" />
                    </li>
                  ))}
                </ul>
                {marked > attendance.recent.length && (
                  <p className="mt-[8px] text-[12px] leading-[16px] text-muted-foreground">
                    The latest {attendance.recent.length} of {marked} marked classes
                  </p>
                )}
              </div>
            </div>
          )}
        </ReportCard>

        {children}
      </div>

      <p className="mt-[20px] hidden border-t border-border pt-[12px] text-center text-[11px] leading-[16px] text-muted-foreground print:block">
        Quran West Academy · Confidential student progress report
      </p>
    </div>
  );
}

// The two buttons beside the name: an outlined pill, or the navy one
export function ReportAction({
  href,
  icon: Icon,
  primary = false,
  children,
}: {
  href: string;
  icon: LucideIcon;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const className = primary
    ? "inline-flex items-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[9px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md transition-shadow hover:shadow-lg"
    : "inline-flex items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[16px] py-[9px] text-[13px] font-semibold leading-[18px] transition-colors hover:border-primary/40 hover:text-primary";
  const content = (
    <>
      <Icon className="h-4 w-4" /> {children}
    </>
  );
  return href.startsWith("mailto:") ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

// A glass card with a title row (title, optional count, optional extra on the right)
export function ReportCard({
  title,
  count,
  action,
  className = "",
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`adm-glass overflow-hidden rounded-2xl border-[1px] border-border bg-card ${className}`}>
      <div className="flex items-center justify-between gap-[12px] px-[20px] py-[16px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="text-[16px] font-bold leading-[22px]">{title}</h2>
          {count !== undefined && (
            <span className="rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-bold leading-[16px] text-primary">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

type Tone = "navy" | "green" | "amber" | "red" | "muted";

const TONES: Record<Tone, string> = {
  navy: "bg-primary/10 text-primary",
  green: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/15 text-amber-600",
  red: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

// A small rounded tag under the name: an icon in its gradient badge, or a
// status dot in the tag's own colour
function Tag({
  icon,
  dot = false,
  tone = "navy",
  className = "",
  children,
}: {
  icon?: LucideIcon;
  dot?: boolean;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-full py-[3px] pr-[10px] text-[12px] font-semibold leading-[18px] ${
        icon ? "pl-[3px]" : "pl-[10px]"
      } ${TONES[tone]} ${className}`}
    >
      {icon && <IconBadge icon={icon} size={18} />}
      {dot && <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-current" />}
      {children}
    </span>
  );
}

function StatusPill({ status, className = "inline-flex" }: { status: string; className?: string }) {
  const [tone, label, Icon] =
    status === "PRESENT"
      ? (["green", "Present", CheckCircle2] as const)
      : status === "LATE"
      ? (["amber", "Late", Clock] as const)
      : (["red", "Absent", XCircle] as const);
  return (
    <span
      className={`shrink-0 items-center gap-[4px] rounded-full px-[9px] py-[2px] text-[11.5px] font-bold leading-[17px] ${TONES[tone]} ${className}`}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function Empty({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="mx-[20px] mb-[20px] flex items-center gap-[12px] rounded-xl border-[1px] border-dashed border-border px-[16px] py-[14px] text-[13px] leading-[18px] text-muted-foreground">
      <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </div>
  );
}
