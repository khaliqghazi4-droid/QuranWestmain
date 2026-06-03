"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  Search,
  Filter,
  X,
} from "lucide-react";
import { DAYS } from "@/lib/timezones";
import { formatSlotRange } from "@/lib/shifts";

export type FilterableClass = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  student: string;
  country: string | null;
  courseName: string;
  level: string;
  classHref: string;
  startUTC: number;
  isLive: boolean;
  minutesUntil: number;
  isToday: boolean;
};

// Day-of-week chips + free-text search over student + course name.
// Sits inside the "Upcoming Classes" card; filtering is client-side because
// the underlying list is already loaded server-side.
export function ClassesFilterableList({
  classes,
}: {
  classes: FilterableClass[];
}) {
  const [query, setQuery] = React.useState("");
  const [dayFilter, setDayFilter] = React.useState<number | "all">("all");

  // Days that actually have at least one class — keeps the chip row from
  // showing every weekday when the teacher only teaches on two.
  const activeDays = React.useMemo(() => {
    const s = new Set<number>();
    for (const c of classes) s.add(c.dayOfWeek);
    return Array.from(s).sort((a, b) => a - b);
  }, [classes]);

  const filtered = classes.filter((c) => {
    if (dayFilter !== "all" && c.dayOfWeek !== dayFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.student.toLowerCase().includes(q) ||
      c.courseName.toLowerCase().includes(q)
    );
  });

  const hasFilter = query.trim() !== "" || dayFilter !== "all";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student or course…"
            className="w-full rounded-full border border-border bg-background pl-9 pr-8 py-2 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full hover:bg-muted text-muted-foreground"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {activeDays.length > 1 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-0.5" />
            <button
              onClick={() => setDayFilter("all")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                dayFilter === "all"
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              All
            </button>
            {activeDays.map((d) => (
              <button
                key={d}
                onClick={() => setDayFilter(d)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  dayFilter === d
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                    : "border border-border bg-card hover:bg-muted"
                }`}
              >
                {DAYS[d].short}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-semibold">
            {hasFilter ? "No classes match your filter" : "No classes booked yet"}
          </p>
          {hasFilter ? (
            <button
              onClick={() => {
                setQuery("");
                setDayFilter("all");
              }}
              className="mt-2 text-xs text-primary font-semibold hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              When the admin books a student into one of your available time slots, the
              class will appear here automatically with a Start Class button.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ClassRow key={c.id} c={c} highlight={c.isLive} />
          ))}
        </div>
      )}
    </>
  );
}

function ClassRow({ c, highlight }: { c: FilterableClass; highlight?: boolean }) {
  const dateLabel = new Date(c.startUTC).toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  let when: string;
  if (c.isLive) when = "Live now";
  else if (c.minutesUntil < 60) when = `in ${c.minutesUntil} min`;
  else if (c.minutesUntil < 24 * 60)
    when = `in ${Math.round(c.minutesUntil / 60)} h`;
  else when = `in ${Math.round(c.minutesUntil / (60 * 24))} d`;

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
        highlight
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <div
        className={`grid h-12 w-12 place-items-center rounded-xl shadow-md shrink-0 ${
          highlight
            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
            : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
        }`}
      >
        <Video className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> {c.student}
          </p>
          {c.isLive ? (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              LIVE
            </span>
          ) : c.isToday ? (
            <span className="rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--gold))]">
              TODAY
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> {c.courseName}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Calendar className="h-3 w-3" /> {DAYS[c.dayOfWeek].long}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatSlotRange(c.startTime)} PKT
          </span>
          <span className="text-muted-foreground">
            Next: {dateLabel} · {when}
          </span>
        </div>
      </div>

      <Link
        href={c.classHref}
        className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 ${
          c.isLive
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            : "bg-gradient-to-r from-primary to-accent text-primary-foreground"
        }`}
      >
        <Video className="h-4 w-4" /> Start Class
      </Link>
    </div>
  );
}
