"use client";

import * as React from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Filter,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StudentFilters = {
  teacher: string; // "all" | "none" (enrolled, no teacher assigned) | teacherId
  course: string; // "all" | "none" (not enrolled) | courseId
  from: string; // joined on/after, YYYY-MM-DD; "" = no lower bound
  to: string; // joined on/before, YYYY-MM-DD; "" = no upper bound
};

export const NO_FILTERS: StudentFilters = { teacher: "all", course: "all", from: "", to: "" };

export type FilterOption = { id: string; name: string; count: number };

export function activeFilterCount(f: StudentFilters) {
  return (f.teacher !== "all" ? 1 : 0) + (f.course !== "all" ? 1 : 0) + (f.from || f.to ? 1 : 0);
}

// YYYY-MM-DD in the viewer's timezone, so the date filter agrees with the "Joined" column.
export function localDateKey(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const fieldCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function StudentsFilterMenu({
  value,
  onChange,
  teachers,
  courses,
  counts,
}: {
  value: StudentFilters;
  onChange: (filters: StudentFilters) => void;
  teachers: FilterOption[];
  courses: FilterOption[];
  counts: { total: number; unassigned: number; notEnrolled: number };
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reopening starts from what's applied, so edits closed without Apply don't linger
  function toggle() {
    if (!open) setDraft(value);
    setOpen((o) => !o);
  }

  const badRange = !!draft.from && !!draft.to && draft.from > draft.to;
  const active = activeFilterCount(value);

  function apply() {
    if (badRange) return;
    onChange(draft);
    setOpen(false);
  }

  function reset() {
    setDraft(NO_FILTERS);
    onChange(NO_FILTERS);
    setOpen(false);
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "adm-badge inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
          active > 0 || open
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-background hover:bg-muted"
        )}
      >
        <Filter className="h-4 w-4" />
        Filter
        {active > 0 && (
          <span className="adm-count grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {active}
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter students"
          // adm-modal: white fields in the light admin (globals.css)
          className="adm-modal absolute left-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-4rem))] rounded-2xl border border-border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-bold">Filter students</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label
                htmlFor="filter-teacher"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
              >
                <Users className="h-3.5 w-3.5" /> Filter by teacher
              </label>
              <select
                id="filter-teacher"
                value={draft.teacher}
                onChange={(e) => setDraft((d) => ({ ...d, teacher: e.target.value }))}
                className={fieldCls}
              >
                <option value="all">All teachers</option>
                <option value="none">No teacher assigned ({counts.unassigned})</option>
                {teachers.length > 0 && (
                  <optgroup label="Teachers">
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.count})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-course"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" /> Filter by course
              </label>
              <select
                id="filter-course"
                value={draft.course}
                onChange={(e) => setDraft((d) => ({ ...d, course: e.target.value }))}
                className={fieldCls}
              >
                <option value="all">All courses ({counts.total})</option>
                <option value="none">Not enrolled ({counts.notEnrolled})</option>
                {courses.length > 0 && (
                  <optgroup label="Courses">
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.count})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Filter by joined date
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    From
                  </span>
                  <input
                    type="date"
                    value={draft.from}
                    max={draft.to || undefined}
                    onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                    className={fieldCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    To
                  </span>
                  <input
                    type="date"
                    value={draft.to}
                    min={draft.from || undefined}
                    onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                    className={fieldCls}
                  />
                </label>
              </div>
              {badRange && (
                <p className="mt-1.5 text-[11px] text-destructive">
                  &quot;From&quot; date can&apos;t be after &quot;To&quot; date.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-b-2xl border-t border-border bg-muted/20 px-4 py-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={badRange}
              className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActiveStudentFilters({
  value,
  onChange,
  teachers,
  courses,
}: {
  value: StudentFilters;
  onChange: (filters: StudentFilters) => void;
  teachers: FilterOption[];
  courses: FilterOption[];
}) {
  if (activeFilterCount(value) === 0) return null;

  const chips: { key: string; label: string; clear: Partial<StudentFilters> }[] = [];

  if (value.teacher !== "all") {
    const name =
      value.teacher === "none"
        ? "No teacher assigned"
        : teachers.find((t) => t.id === value.teacher)?.name ?? "Unknown";
    chips.push({ key: "teacher", label: `Teacher: ${name}`, clear: { teacher: "all" } });
  }
  if (value.course !== "all") {
    const name =
      value.course === "none"
        ? "Not enrolled"
        : courses.find((c) => c.id === value.course)?.name ?? "Unknown";
    chips.push({ key: "course", label: `Course: ${name}`, clear: { course: "all" } });
  }
  if (value.from || value.to) {
    const label =
      value.from && value.to
        ? `Joined ${formatDateKey(value.from)} – ${formatDateKey(value.to)}`
        : value.from
        ? `Joined since ${formatDateKey(value.from)}`
        : `Joined up to ${formatDateKey(value.to)}`;
    chips.push({ key: "date", label, clear: { from: "", to: "" } });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <span className="text-xs text-muted-foreground">Filtered by:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onChange({ ...value, ...chip.clear })}
            aria-label={`Remove filter: ${chip.label}`}
            className="grid h-4 w-4 place-items-center rounded-full hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange(NO_FILTERS)}
        className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent"
      >
        <X className="h-3 w-3" /> Clear all
      </button>
    </div>
  );
}
