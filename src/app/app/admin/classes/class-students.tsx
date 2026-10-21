"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Repeat,
  Search,
  User,
  X,
} from "lucide-react";
import { FilterSelect, type FilterOption } from "@/components/admin/filter-select";
import { Avatar } from "@/components/avatar";
import { IconBadge } from "@/components/dashboard/icon-badge";
import { pktDayYmd } from "@/lib/pkt-day";
import {
  type AdminClass,
  DAY_MS,
  endsAt,
  shortDayFmt,
  startsIn,
  timeFmt,
  weeklySlots,
} from "./class-format";

type StudentClasses = {
  key: string; // user id, or "trial-<requestId>"
  name: string;
  image: string | null;
  trial: boolean;
  classes: AdminClass[]; // not yet over, by start time
};

// Small uppercase label. A span, not a p: the glass cards turn an uppercase
// p into an eyebrow with a line before it.
const labelClass =
  "block text-[10px] font-bold uppercase leading-[14px] tracking-[0.1em] text-muted-foreground";

function unique(values: string[]) {
  return Array.from(new Set(values));
}

// The Classes page: one card per student with upcoming classes, A–Z. A card
// shows the next class and the weekly timetable; it opens the student's own
// schedule page (classes/[student]) with every class and its Join button.
export function ClassStudents({
  classes,
  generatedAt,
  weeksAhead,
}: {
  classes: AdminClass[];
  // Server's "now", so the first render matches the server HTML
  generatedAt: number;
  weeksAhead: number;
}) {
  const [query, setQuery] = React.useState("");
  const [course, setCourse] = React.useState("all");
  const [now, setNow] = React.useState(generatedAt);

  // Keep LIVE / "in 20 min" current while the page stays open
  React.useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const courseNames = React.useMemo(
    () => unique(classes.map((c) => c.courseName)).sort((a, b) => a.localeCompare(b)),
    [classes]
  );

  // One entry per student, from the classes not yet over, A–Z
  const students = React.useMemo(() => {
    const byKey = new Map<string, StudentClasses>();
    for (const c of classes) {
      if (endsAt(c) < now) continue;
      let s = byKey.get(c.studentKey);
      if (!s) {
        s = { key: c.studentKey, name: c.studentName, image: c.studentImage, trial: c.kind === "trial", classes: [] };
        byKey.set(c.studentKey, s);
      }
      s.classes.push(c);
    }
    return Array.from(byKey.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [classes, now]);

  const today = pktDayYmd(new Date(now));
  const tomorrow = pktDayYmd(new Date(now + DAY_MS));

  const q = query.trim().toLowerCase();
  const filtersOn = q !== "" || course !== "all";
  const matchesQuery = (s: StudentClasses) => q === "" || s.name.toLowerCase().includes(q);
  const takes = (s: StudentClasses, name: string) => s.classes.some((c) => c.courseName === name);
  const shown = students.filter((s) => matchesQuery(s) && (course === "all" || takes(s, course)));
  // How many students each choice would show, with the search kept
  const courseOptions: FilterOption<string>[] = [
    { value: "all", label: "All courses", count: students.filter(matchesQuery).length },
    ...courseNames.map((name) => ({
      value: name,
      label: name,
      count: students.filter((s) => matchesQuery(s) && takes(s, name)).length,
    })),
  ];
  const classCount = shown.reduce((n, s) => n + s.classes.length, 0);
  const liveCount = shown.filter((s) => s.classes[0].startUTC <= now).length;

  function clearFilters() {
    setQuery("");
    setCourse("all");
  }

  function dayLabel(startUTC: number) {
    const ymd = pktDayYmd(new Date(startUTC));
    if (ymd === today) return "Today";
    if (ymd === tomorrow) return "Tomorrow";
    return shortDayFmt.format(startUTC);
  }

  function renderCard(s: StudentClasses) {
    const next = s.classes[0];
    const live = next.startUTC <= now;
    const courses = unique(s.classes.map((c) => c.courseName));
    const teachers = unique(s.classes.map((c) => c.teacherName));
    const slots = weeklySlots(s.classes);
    return (
      <Link
        key={s.key}
        href={`/app/admin/classes/${s.key}`}
        aria-label={`${s.name}: view class schedule`}
        className="adm-glass group flex flex-col rounded-2xl border-[1px] border-border bg-card p-[20px] transition-all hover:-translate-y-0.5 hover:border-primary/40"
      >
        {/* Sizes written out: Bootstrap's .text-sm/.text-xs have no line height */}
        <div className="flex items-start gap-[12px]">
          <Avatar name={s.name} src={s.image} size={48} />
          <div className="min-w-0 flex-1">
            <p className="flex min-w-0 items-center gap-[8px]">
              <span className="truncate text-[16px] font-bold leading-[22px]">{s.name}</span>
              {s.trial && (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-[8px] py-[2px] text-[10px] font-bold leading-[14px] text-amber-700">
                  Free trial
                </span>
              )}
            </p>
            <p className="mt-[4px] flex min-w-0 items-center gap-[8px] text-[12.5px] leading-[19px] text-muted-foreground">
              <IconBadge icon={BookOpen} />
              <span className="truncate">{courses.join(", ")}</span>
            </p>
            <p className="mt-[4px] flex min-w-0 items-center gap-[8px] text-[12.5px] leading-[19px] text-muted-foreground">
              <IconBadge icon={User} />
              <span className="truncate">with {teachers.join(", ")}</span>
            </p>
          </div>
        </div>

        <div
          className={`adm-tile mt-[16px] rounded-xl border-[1px] border-border px-[14px] py-[12px] ${
            live ? "bg-emerald-500/5" : "bg-background/60"
          }`}
        >
          <div className="flex items-center justify-between gap-[8px]">
            <span className={labelClass}>{live ? "In class now" : "Next class"}</span>
            {live ? (
              <span className="inline-flex items-center gap-[6px] rounded-full bg-emerald-500/15 px-[10px] py-[3px] text-[11px] font-bold leading-[14px] text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                LIVE
              </span>
            ) : (
              <span className="text-[11px] font-semibold leading-[16px] text-muted-foreground">
                {startsIn(next.startUTC - now)}
              </span>
            )}
          </div>
          <p className="mt-[6px] text-[14px] font-bold leading-[20px]">
            {dayLabel(next.startUTC)} · {timeFmt.format(next.startUTC)} – {timeFmt.format(endsAt(next))}
          </p>
          {courses.length > 1 && (
            <p className="truncate text-[12px] leading-[18px] text-muted-foreground">{next.courseName}</p>
          )}
        </div>

        <div className="mt-[14px]">
          <span className={labelClass}>{s.trial ? "Free trial" : "Every week · PKT"}</span>
          <div className="mt-[6px] flex flex-wrap gap-[6px]">
            {s.trial ? (
              <span className="rounded-full bg-amber-500/15 px-[10px] py-[3px] text-[11.5px] font-semibold leading-[16px] text-amber-700">
                One trial class
              </span>
            ) : (
              slots.map((slot) => (
                <span
                  key={`${slot.day} ${slot.time}`}
                  className="adm-chip inline-flex items-center gap-[6px] rounded-full bg-primary/10 py-[3px] pl-[3px] pr-[10px] text-[11.5px] font-semibold leading-[16px] text-primary"
                >
                  <IconBadge icon={Repeat} size={16} />
                  {slot.day} {slot.time}
                </span>
              ))
            )}
          </div>
        </div>

        {/* mt-auto: the footers line up along the bottom of a row of cards */}
        <div className="mt-auto pt-[16px]">
          <div className="flex items-center justify-between gap-[8px] border-t border-border pt-[14px]">
            <span className="text-[12px] leading-[18px] text-muted-foreground">
              <span className="font-bold text-foreground">{s.classes.length}</span>{" "}
              {s.classes.length === 1 ? "class" : "classes"} · next {weeksAhead} weeks
            </span>
            <span className="inline-flex shrink-0 items-center gap-[2px] text-[12.5px] font-bold leading-[18px] text-primary">
              View schedule
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-5">
      {/* The title and count, then search and the navy Course pill of the
          other admin pages (its own menu, not the browser's cream field).
          relative z-[5]: the menu opens over the cards below. Sizes written
          out: Bootstrap's .text-sm/.text-xs have no line height. */}
      <div className="adm-glass relative z-[5] flex flex-wrap items-center gap-[12px] rounded-2xl border-[1px] border-border bg-card px-[16px] py-[14px] sm:px-[20px]">
        <div className="mr-auto min-w-0">
          <h2 className="text-[15px] font-bold leading-[22px]">Students</h2>
          <p className="text-[12px] leading-[18px] text-muted-foreground">
            <span className="font-bold text-foreground">{shown.length}</span>{" "}
            {shown.length === 1 ? "student" : "students"} ·{" "}
            <span className="font-bold text-foreground">{classCount}</span>{" "}
            {classCount === 1 ? "class" : "classes"} in the next {weeksAhead} weeks
            {liveCount > 0 && (
              <span className="ml-[6px] whitespace-nowrap font-bold text-emerald-600">· {liveCount} live now</span>
            )}
          </p>
        </div>
        {/* Phones: one row, the search taking the room the pill leaves */}
        <div className="flex w-full flex-wrap items-center gap-[8px] sm:w-auto">
          <div className="relative min-w-[140px] flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search students"
              className="w-full rounded-full border-[1px] border-border bg-background py-[8px] pl-[36px] pr-[16px] text-[13.5px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {/* one course only: nothing to choose */}
          {courseNames.length > 1 && (
            <FilterSelect label="Course" value={course} onChange={setCourse} options={courseOptions} />
          )}
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

      {shown.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          {filtersOn ? (
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/40" />
          ) : (
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
          )}
          <p className="mt-3 text-sm font-semibold">
            {filtersOn ? "No students match these filters" : "No upcoming classes"}
          </p>
          {filtersOn && (
            <button onClick={clearFilters} className="mt-2 text-xs font-semibold text-primary underline">
              Show all students
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">{shown.map(renderCard)}</div>
      )}
    </div>
  );
}
