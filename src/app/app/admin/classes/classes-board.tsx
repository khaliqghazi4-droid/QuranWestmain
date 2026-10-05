"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Filter,
  GraduationCap,
  User,
  Video,
  X,
} from "lucide-react";
import { pktDayYmd } from "@/lib/pkt-day";

export type AdminClass = {
  key: string; // unique per occurrence
  roomId: string; // "booking-<id>" | "trial-<id>"
  kind: "booking" | "trial";
  startUTC: number;
  durationMin: number;
  studentKey: string; // user id, or "trial-<requestId>" for a trial
  studentName: string;
  courseName: string;
  teacherName: string;
};

const PK_TZ = "Asia/Karachi";
const DAY_MS = 24 * 60 * 60_000;
const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: PK_TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const dayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: PK_TZ,
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const selectClass =
  "w-full sm:w-auto rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function startsIn(ms: number) {
  const min = Math.max(1, Math.round(ms / 60_000));
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return min % 60 ? `in ${h}h ${min % 60}m` : `in ${h}h`;
  const d = Math.round(h / 24);
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

export function ClassesBoard({
  classes,
  generatedAt,
  weeksAhead,
}: {
  classes: AdminClass[];
  // Server's "now", so the first render matches the server HTML
  generatedAt: number;
  weeksAhead: number;
}) {
  const [course, setCourse] = React.useState("all");
  const [student, setStudent] = React.useState("all");
  const [date, setDate] = React.useState(""); // PKT day "YYYY-MM-DD"
  const [now, setNow] = React.useState(generatedAt);

  // Keep LIVE / "in 20 min" current while the page stays open
  React.useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const courseOptions = React.useMemo(
    () => Array.from(new Set(classes.map((c) => c.courseName))).sort((a, b) => a.localeCompare(b)),
    [classes]
  );
  const studentOptions = React.useMemo(() => {
    const byKey = new Map<string, string>();
    for (const c of classes) {
      byKey.set(c.studentKey, c.kind === "trial" ? `${c.studentName} (trial)` : c.studentName);
    }
    return Array.from(byKey).sort((a, b) => a[1].localeCompare(b[1]));
  }, [classes]);

  const today = pktDayYmd(new Date(now));
  const tomorrow = pktDayYmd(new Date(now + DAY_MS));
  const lastDay = pktDayYmd(new Date(now + weeksAhead * 7 * DAY_MS));

  const filtersOn = course !== "all" || student !== "all" || date !== "";
  const shown = classes.filter(
    (c) =>
      // drop classes that ended while the page was open
      c.startUTC + c.durationMin * 60_000 >= now &&
      (course === "all" || c.courseName === course) &&
      (student === "all" || c.studentKey === student) &&
      (date === "" || pktDayYmd(new Date(c.startUTC)) === date)
  );
  const liveCount = shown.filter((c) => c.startUTC <= now).length;

  // Group by PKT calendar day (already sorted by start time)
  const days: { ymd: string; items: AdminClass[] }[] = [];
  for (const c of shown) {
    const ymd = pktDayYmd(new Date(c.startUTC));
    const last = days[days.length - 1];
    if (last?.ymd === ymd) last.items.push(c);
    else days.push({ ymd, items: [c] });
  }

  function clearFilters() {
    setCourse("all");
    setStudent("all");
    setDate("");
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
          <Filter className="h-4 w-4" />
        </div>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className={selectClass}
          aria-label="Filter by course"
        >
          <option value="all">All courses</option>
          {courseOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          className={selectClass}
          aria-label="Filter by student"
        >
          <option value="all">All students</option>
          {studentOptions.map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          min={today}
          max={lastDay}
          onChange={(e) => setDate(e.target.value)}
          className={selectClass}
          aria-label="Filter by date (PKT)"
        />
        <button
          onClick={clearFilters}
          disabled={!filtersOn}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <X className="h-3.5 w-3.5" /> All
        </button>
        <p className="w-full sm:w-auto sm:ml-auto text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{shown.length}</span>{" "}
          {shown.length === 1 ? "class" : "classes"}
          {liveCount > 0 && (
            <span className="ml-2 font-bold text-emerald-600">· {liveCount} live now</span>
          )}
        </p>
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
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="h-4 w-4 text-primary" />
              {day.ymd === today ? "Today · " : day.ymd === tomorrow ? "Tomorrow · " : ""}
              {dayFmt.format(new Date(day.items[0].startUTC))}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {day.items.length}
              </span>
            </h2>
            <ul className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {day.items.map((c) => {
                const live = c.startUTC <= now;
                const end = c.startUTC + c.durationMin * 60_000;
                return (
                  <li
                    key={c.key}
                    className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${
                      live ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <div className="shrink-0 sm:w-40">
                      <p className="text-sm font-bold">
                        {timeFmt.format(c.startUTC)} – {timeFmt.format(end)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{c.durationMin} min · PKT</p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{c.studentName}</span>
                        {c.kind === "trial" && (
                          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Free trial
                          </span>
                        )}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" /> with {c.teacherName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {c.courseName}
                        </span>
                      </p>
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
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {startsIn(c.startUTC - now)}
                        </span>
                      )}
                      <Link
                        href={`/app/admin/class/${c.roomId}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg"
                        title="Join as admin (camera and mic off)"
                      >
                        <Video className="h-3.5 w-3.5" /> Join
                      </Link>
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
