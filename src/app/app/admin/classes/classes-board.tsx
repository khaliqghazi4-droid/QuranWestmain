"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, CalendarDays, GraduationCap, Lock, User, Video, X } from "lucide-react";
import { FilterSelect, type FilterOption } from "@/components/admin/filter-select";
import { IconBadge } from "@/components/dashboard/icon-badge";
import { pktDayYmd } from "@/lib/pkt-day";
import { type AdminClass, DAY_MS, countdown, dayFmt, endsAt, shortDayFmt, startsIn, timeFmt } from "./class-format";

export type { AdminClass };

// Time left until `target`, ticking every second (tabular digits, so the
// button doesn't jiggle). `from` is the board's "now", so the server HTML and
// the first render agree; `onDone` fires once the time is up.
function Countdown({ target, from, onDone }: { target: number; from: number; onDone: () => void }) {
  const [now, setNow] = React.useState(from);
  React.useEffect(() => {
    function tick() {
      const t = Date.now();
      setNow(t);
      if (t >= target) onDone();
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onDone]);
  return <span className="tabular-nums">{countdown(target - now)}</span>;
}

// Upcoming classes grouped by PKT day, with filters. A student's schedule
// page (classes/[student]) shows it with `oneStudent`: no student filter, and
// each row leads with the course. Without it, it is the old every-student list
// the Classes page showed before its student cards; to bring that back, render
// <ClassesBoard classes={…} …/> in classes/page.tsx instead of <ClassStudents>.
export function ClassesBoard({
  classes,
  generatedAt,
  weeksAhead,
  oneStudent = false,
}: {
  classes: AdminClass[];
  // Server's "now", so the first render matches the server HTML
  generatedAt: number;
  weeksAhead: number;
  oneStudent?: boolean;
}) {
  const [course, setCourse] = React.useState("all");
  const [student, setStudent] = React.useState("all");
  const [day, setDay] = React.useState("all"); // PKT day "YYYY-MM-DD"
  const [now, setNow] = React.useState(generatedAt);

  // Keep LIVE / "in 20 min" current while the page stays open
  React.useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  // The next class's countdown calls this at zero, so it turns live (and its
  // Join opens) that second instead of on the next 30s tick
  const refreshNow = React.useCallback(() => setNow(Date.now()), []);

  const courseNames = React.useMemo(
    () => Array.from(new Set(classes.map((c) => c.courseName))).sort((a, b) => a.localeCompare(b)),
    [classes]
  );
  const studentNames = React.useMemo(() => {
    const byKey = new Map<string, string>();
    for (const c of classes) {
      byKey.set(c.studentKey, c.kind === "trial" ? `${c.studentName} (trial)` : c.studentName);
    }
    return Array.from(byKey).sort((a, b) => a[1].localeCompare(b[1]));
  }, [classes]);

  const today = pktDayYmd(new Date(now));
  const tomorrow = pktDayYmd(new Date(now + DAY_MS));

  // Classes not over yet (drops the ones that end while the page is open)
  const upcoming = classes.filter((c) => endsAt(c) >= now);
  const dayOf = (c: AdminClass) => pktDayYmd(new Date(c.startUTC));
  const inCourse = (c: AdminClass) => course === "all" || c.courseName === course;
  const ofStudent = (c: AdminClass) => student === "all" || c.studentKey === student;
  const onDay = (c: AdminClass) => day === "all" || dayOf(c) === day;

  const filtersOn = course !== "all" || student !== "all" || day !== "all";
  const shown = upcoming.filter((c) => inCourse(c) && ofStudent(c) && onDay(c));
  const liveCount = shown.filter((c) => c.startUTC <= now).length;

  // Each menu counts what its choices would show with the other filters kept
  const courseOptions: FilterOption<string>[] = [
    { value: "all", label: "All courses", count: upcoming.filter((c) => ofStudent(c) && onDay(c)).length },
    ...courseNames.map((name) => ({
      value: name,
      label: name,
      count: upcoming.filter((c) => c.courseName === name && ofStudent(c) && onDay(c)).length,
    })),
  ];
  const studentOptions: FilterOption<string>[] = [
    { value: "all", label: "All students", count: upcoming.filter((c) => inCourse(c) && onDay(c)).length },
    ...studentNames.map(([key, name]) => ({
      value: key,
      label: name,
      count: upcoming.filter((c) => c.studentKey === key && inCourse(c) && onDay(c)).length,
    })),
  ];
  // Only the days that have classes, in order: "Today", "Tomorrow", "Sun, Oct 25"
  const dayOptions: FilterOption<string>[] = [
    { value: "all", label: "All days", count: upcoming.filter((c) => inCourse(c) && ofStudent(c)).length },
  ];
  for (const c of upcoming) {
    const ymd = dayOf(c);
    if (dayOptions.some((o) => o.value === ymd)) continue;
    dayOptions.push({
      value: ymd,
      label: ymd === today ? "Today" : ymd === tomorrow ? "Tomorrow" : shortDayFmt.format(c.startUTC),
      count: upcoming.filter((u) => dayOf(u) === ymd && inCourse(u) && ofStudent(u)).length,
    });
  }

  // Only each student's next class (or one running now) is open to join; the
  // later ones show faded and locked. Worked out before the filters, so
  // picking a later day doesn't unlock it.
  const openKeys = new Set<string>();
  const hasNext = new Set<string>();
  for (const c of upcoming) {
    if (c.startUTC <= now || !hasNext.has(c.studentKey)) openKeys.add(c.key);
    hasNext.add(c.studentKey);
  }

  // Group by PKT calendar day (already sorted by start time)
  const days: { ymd: string; items: AdminClass[] }[] = [];
  for (const c of shown) {
    const ymd = dayOf(c);
    const last = days[days.length - 1];
    if (last?.ymd === ymd) last.items.push(c);
    else days.push({ ymd, items: [c] });
  }

  function clearFilters() {
    setCourse("all");
    setStudent("all");
    setDay("all");
  }

  return (
    <div className="space-y-5">
      {/* The title and count, then the navy filter pills of the other admin
          pages (their own menus, not the browser's cream fields). relative
          z-[5]: the menus open over the day cards below. Sizes written out:
          Bootstrap's .text-sm/.text-xs have no line height. */}
      <div className="adm-glass relative z-[5] flex flex-wrap items-center gap-[12px] rounded-2xl border-[1px] border-border bg-card px-[16px] py-[14px] sm:px-[20px]">
        <div className="mr-auto min-w-0">
          <h2 className="text-[15px] font-bold leading-[22px]">{oneStudent ? "Upcoming classes" : "All classes"}</h2>
          <p className="text-[12px] leading-[18px] text-muted-foreground">
            <span className="font-bold text-foreground">{shown.length}</span>{" "}
            {shown.length === 1 ? "class" : "classes"}
            {filtersOn ? " match" : ` in the next ${weeksAhead} weeks`}
            {liveCount > 0 && (
              <span className="ml-[6px] whitespace-nowrap font-bold text-emerald-600">· {liveCount} live now</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          {/* one course only: nothing to choose */}
          {courseNames.length > 1 && (
            <FilterSelect label="Course" value={course} onChange={setCourse} options={courseOptions} />
          )}
          {!oneStudent && (
            <FilterSelect label="Student" value={student} onChange={setStudent} options={studentOptions} />
          )}
          <FilterSelect label="Day" value={day} onChange={setDay} options={dayOptions} />
          {filtersOn && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[14px] py-[8px] text-[13px] font-semibold leading-[20px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {days.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-semibold">
            {filtersOn ? "No classes match these filters" : "No upcoming classes"}
          </p>
          {filtersOn && (
            <button onClick={clearFilters} className="mt-2 text-xs font-semibold text-primary underline">
              Show all classes
            </button>
          )}
        </div>
      ) : (
        days.map((day) => (
          <section key={day.ymd}>
            {/* a day with only locked classes fades its heading too */}
            <h2
              className={`flex items-center gap-2 text-sm font-bold ${
                day.items.some((c) => openKeys.has(c.key)) ? "" : "opacity-[0.5]"
              }`}
            >
              <IconBadge icon={CalendarDays} size={22} />
              {day.ymd === today ? "Today · " : day.ymd === tomorrow ? "Tomorrow · " : ""}
              {dayFmt.format(new Date(day.items[0].startUTC))}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {day.items.length}
              </span>
            </h2>
            <ul className="adm-glass mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {day.items.map((c) => {
                const live = c.startUTC <= now;
                const locked = !openKeys.has(c.key);
                const end = c.startUTC + c.durationMin * 60_000;
                return (
                  <li
                    key={c.key}
                    title={locked ? "Locked: only the next class can be joined" : undefined}
                    className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${
                      live ? "bg-emerald-500/5" : ""
                    } ${locked ? "cursor-not-allowed select-none opacity-[0.5]" : ""}`}
                  >
                    <div className="shrink-0 sm:w-40">
                      <p className="text-sm font-bold">
                        {timeFmt.format(c.startUTC)} – {timeFmt.format(end)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{c.durationMin} min · PKT</p>
                    </div>

                    <div className="min-w-0 flex-1">
                      {oneStudent ? (
                        <>
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <IconBadge icon={BookOpen} size={22} />
                            <span className="truncate">{c.courseName}</span>
                            {c.kind === "trial" && (
                              <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                Free trial
                              </span>
                            )}
                          </p>
                          <p className="mt-[6px] flex items-center gap-[8px] text-[12px] leading-[18px] text-muted-foreground">
                            <IconBadge icon={User} size={22} /> with {c.teacherName}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <IconBadge icon={GraduationCap} size={22} />
                            <span className="truncate">{c.studentName}</span>
                            {c.kind === "trial" && (
                              <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                Free trial
                              </span>
                            )}
                          </p>
                          <p className="mt-[6px] flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-[12px] leading-[18px] text-muted-foreground">
                            <span className="inline-flex items-center gap-[8px]">
                              <IconBadge icon={User} size={22} /> with {c.teacherName}
                            </span>
                            <span className="inline-flex items-center gap-[8px]">
                              <IconBadge icon={BookOpen} size={22} /> {c.courseName}
                            </span>
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                      {live ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          LIVE
                        </span>
                      ) : locked ? (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {startsIn(c.startUTC - now)}
                        </span>
                      ) : (
                        // phones: just the countdown button, so the row fits
                        <span className="adm-chip hidden rounded-full bg-primary/10 px-[10px] py-[3px] text-[11px] font-bold leading-[16px] text-primary sm:inline">
                          Next
                        </span>
                      )}
                      {locked ? (
                        // Not a link: the room can't be opened from here.
                        // relative: holds the sr-only text, which otherwise
                        // hangs off the scrolling main and scrolls the window
                        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.08] px-4 py-2 text-xs font-bold text-muted-foreground">
                          <Lock className="h-3.5 w-3.5" /> Join
                          <span className="sr-only">(locked)</span>
                        </span>
                      ) : !live ? (
                        // The next class: Join stays shut until it starts, the
                        // time left ticking down on the button
                        <span
                          title="Join opens when the class starts"
                          className="inline-flex cursor-not-allowed select-none items-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[8px] text-[12px] font-bold leading-[16px] text-primary-foreground opacity-[0.6]"
                        >
                          <Lock className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Starts in <Countdown target={c.startUTC} from={now} onDone={refreshNow} />
                          </span>
                        </span>
                      ) : (
                        <Link
                          href={`/app/admin/class/${c.roomId}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg"
                          title="Join as admin (camera and mic off)"
                        >
                          <Video className="h-3.5 w-3.5" /> Join
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
