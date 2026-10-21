"use client";

import * as React from "react";
import {
  Search,
  Download,
  FileText,
  Users,
  TrendingUp,
  ClipboardCheck,
  Trophy,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { FilterSelect } from "@/components/admin/filter-select";
import { StatTiles } from "@/components/admin/stat-tiles";
import { StudentReportModal } from "@/components/admin/student-report-modal";
import { downloadCsv } from "@/lib/csv";

type Enrollment = {
  id: string;
  courseId: string;
  courseName: string;
  teacherName: string | null;
  progress: number;
};

type Student = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  avgProgress: number;
  // share of marked classes attended; null until a teacher marks one
  attendancePct: number | null;
  classesMarked: number;
  lessonsCompleted: number;
  enrollments: Enrollment[];
};

type Stats = {
  students: number;
  avgProgress: number;
  attendancePct: number | null;
  completed: number;
};

type Status = "all" | "active" | "not-started" | "completed";
type SortKey = "name" | "attendance" | "progress";

// Where a student stands across their courses (null: not enrolled)
function statusOf(s: Student): Exclude<Status, "all"> | null {
  if (s.enrollments.length === 0) return null;
  if (s.enrollments.every((e) => e.progress >= 100)) return "completed";
  return s.avgProgress === 0 ? "not-started" : "active";
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function ProgressReports({ students, stats }: { students: Student[]; stats: Stats }) {
  const [query, setQuery] = React.useState("");
  const [course, setCourse] = React.useState("all");
  const [status, setStatus] = React.useState<Status>("all");
  const [sort, setSort] = React.useState<{ key: SortKey; desc: boolean }>({ key: "progress", desc: true });
  const [reportFor, setReportFor] = React.useState<string | null>(null);

  // The courses students are actually in, with how many of them
  const courseOptions = React.useMemo(() => {
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const s of students)
      for (const e of s.enrollments) {
        const o = map.get(e.courseId) ?? { value: e.courseId, label: e.courseName.trim(), count: 0 };
        o.count++;
        map.set(e.courseId, o);
      }
    // no count on "All…": the footer has it, and both pills fit side by side on a phone
    return [
      { value: "all", label: "All courses" },
      ...Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [students]);

  const statusOptions = React.useMemo(() => {
    const count = (st: Status) => students.filter((s) => statusOf(s) === st).length;
    return [
      { value: "all" as Status, label: "Any status" },
      { value: "active" as Status, label: "In progress", count: count("active") },
      { value: "not-started" as Status, label: "Not started", count: count("not-started") },
      { value: "completed" as Status, label: "Completed", count: count("completed") },
    ];
  }, [students]);

  const q = query.trim().toLowerCase();
  const filtered = students
    .filter(
      (s) =>
        (course === "all" || s.enrollments.some((e) => e.courseId === course)) &&
        (status === "all" || statusOf(s) === status) &&
        (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    )
    .sort((a, b) => {
      const cmp =
        sort.key === "name"
          ? a.name.localeCompare(b.name)
          : sort.key === "progress"
            ? a.avgProgress - b.avgProgress
            : (a.attendancePct ?? -1) - (b.attendancePct ?? -1);
      return (sort.desc ? -cmp : cmp) || a.name.localeCompare(b.name);
    });

  function exportCsv() {
    downloadCsv(
      `student-progress-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Student", "Email", "Courses", "Progress %", "Lessons completed", "Attendance %", "Classes marked"],
      filtered.map((s) => [
        s.name,
        s.email,
        s.enrollments.map((e) => `${e.courseName.trim()} (${e.progress}%)`).join("; "),
        s.avgProgress,
        s.lessonsCompleted,
        s.attendancePct ?? "",
        s.classesMarked,
      ])
    );
  }

  // A column heading that sorts by it; a second click flips the order
  const sortHeader = (key: SortKey, label: string, className = "") => {
    const active = sort.key === key;
    const Icon = !active ? ChevronsUpDown : sort.desc ? ArrowDown : ArrowUp;
    return (
      <th
        aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"}
        className={`px-[12px] py-[12px] font-semibold ${className}`}
      >
        <button
          onClick={() => setSort(active ? { key, desc: !sort.desc } : { key, desc: key !== "name" })}
          className={`inline-flex items-center gap-[4px] uppercase tracking-[0.06em] transition-colors hover:text-foreground ${active ? "text-foreground" : ""}`}
        >
          {label}
          <Icon className={`h-3 w-3 ${active ? "" : "opacity-[0.5]"}`} />
        </button>
      </th>
    );
  };

  // Name and email: opens the same report pop-up as the Report button (the
  // user didn't want it leaving Reports for the student's page)
  const identity = (s: Student) => (
    <button
      type="button"
      onClick={() => setReportFor(s.id)}
      title="Open the full report"
      className="group flex min-w-0 items-center gap-[12px] text-left"
    >
      <Avatar name={s.name} src={s.image} size={36} />
      <div className="min-w-0">
        {/* Sizes written out: Bootstrap's .text-sm/.text-xs have no line height */}
        <p className="truncate text-[14.5px] font-semibold leading-[21px] transition-colors group-hover:text-primary">
          {s.name}
        </p>
        <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">{s.email}</p>
      </div>
    </button>
  );

  // Each course as a chip with its teacher beside it
  const courseList = (s: Student) =>
    s.enrollments.length === 0 ? (
      <span className="text-[12.5px] italic leading-[18px] text-muted-foreground">Not enrolled</span>
    ) : (
      <div className="flex flex-col items-start gap-[6px]">
        {s.enrollments.map((e) => (
          <div key={e.id} className="flex min-w-0 max-w-full items-center gap-[8px]">
            <span className="shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-[10px] py-[2px] text-[11.5px] font-semibold leading-[18px] text-primary">
              {e.courseName.trim()}
            </span>
            <span className="truncate text-[12px] leading-[18px] text-muted-foreground">
              {e.teacherName ?? <span className="italic">No teacher</span>}
            </span>
          </div>
        ))}
      </div>
    );

  const attendance = (s: Student) =>
    s.attendancePct === null ? (
      <div>
        <p className="text-[14px] font-semibold leading-[20px] text-muted-foreground">—</p>
        <p className="whitespace-nowrap text-[11.5px] leading-[16px] text-muted-foreground">No classes marked</p>
      </div>
    ) : (
      <div>
        <p className="text-[14px] font-bold leading-[20px] tabular-nums">{s.attendancePct}%</p>
        <p className="whitespace-nowrap text-[11.5px] leading-[16px] text-muted-foreground">
          of {plural(s.classesMarked, "class")}
        </p>
      </div>
    );

  const progress = (s: Student) =>
    s.enrollments.length === 0 ? (
      <p className="text-[14px] font-semibold leading-[20px] text-muted-foreground">—</p>
    ) : (
      <div className="w-full min-w-[120px] max-w-[180px]">
        <div className="flex items-baseline justify-between gap-[8px]">
          <span className="text-[14px] font-bold leading-[20px] tabular-nums">{s.avgProgress}%</span>
          <span className="whitespace-nowrap text-[11.5px] leading-[16px] text-muted-foreground">
            {plural(s.lessonsCompleted, "lesson")}
          </span>
        </div>
        <div className="adm-track mt-[6px] h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${s.avgProgress}%` }} />
        </div>
      </div>
    );

  const reportButton = (s: Student, compact = false) => (
    <button
      onClick={() => setReportFor(s.id)}
      title="Open the full, printable report"
      aria-label={`Open ${s.name}'s full report`}
      className="inline-flex shrink-0 items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[12px] py-[6px] text-[12.5px] font-semibold leading-[17px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      <FileText className="h-3.5 w-3.5" />
      {!compact && "Report"}
    </button>
  );

  return (
    <div className="space-y-6">
      <StatTiles
        stats={[
          { icon: Users, label: "Students", value: String(stats.students) },
          { icon: TrendingUp, label: "Average progress", value: `${stats.avgProgress}%` },
          {
            icon: ClipboardCheck,
            label: "Attendance rate",
            value: stats.attendancePct === null ? "—" : `${stats.attendancePct}%`,
          },
          { icon: Trophy, label: "Courses completed", value: String(stats.completed) },
        ]}
      />

      {/* One card: the toolbar, the table, a footer with the count. No
          overflow-hidden: the filter menus open below the toolbar and can
          run past the card's bottom when there are few rows. */}
      <div className="adm-glass rounded-2xl border-[1px] border-border bg-card">
        <div className="relative z-[5] flex flex-wrap items-center gap-[12px] border-b border-border px-[16px] py-[14px] sm:px-[20px]">
          <div className="mr-auto min-w-0">
            <h2 className="text-[15px] font-bold leading-[20px]">Student progress</h2>
            <p className="text-[11.5px] leading-[16px] text-muted-foreground">
              Lessons completed and classes attended
            </p>
          </div>
          {/* Below lg: Export (an icon on phones) beside the title, the two
              filters side by side, the search full width under them. lg:
              everything on one row, Export last. */}
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            aria-label="Export CSV"
            title="Download this list as a spreadsheet (CSV)"
            className="inline-flex shrink-0 items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[11px] py-[9px] text-[13px] font-semibold leading-[18px] transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 sm:px-[14px] lg:order-last"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <div className="flex w-full flex-wrap items-center gap-[8px] lg:w-auto lg:flex-nowrap">
            <FilterSelect label="Course" value={course} onChange={setCourse} options={courseOptions} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
            <div className="relative order-last w-full lg:order-none lg:w-56">
              <Search className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
                className="w-full rounded-full border-[1px] border-border bg-background py-[8px] pl-[36px] pr-[16px] text-[13.5px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-[24px] py-[52px] text-center">
            <span className="adm-icon mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <p className="mt-[12px] text-[14px] font-semibold leading-[20px]">
              {students.length === 0 ? "No students yet" : "No students match your filters"}
            </p>
            <p className="mt-[2px] text-[12.5px] leading-[18px] text-muted-foreground">
              {students.length === 0
                ? "Reports show here once students are added."
                : "Try another course, status or name."}
            </p>
          </div>
        ) : (
          <>
            {/* Tablets and up: a table. `adm-rows` gives the rows a little more
                white than the glass card in light mode. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="whitespace-nowrap border-b border-border text-left text-[11px] text-muted-foreground">
                    {sortHeader("name", "Student", "pl-[20px]")}
                    <th className="px-[12px] py-[12px] font-semibold uppercase tracking-[0.06em]">Courses</th>
                    {sortHeader("attendance", "Attendance")}
                    {sortHeader("progress", "Progress")}
                    <th className="py-[12px] pl-[12px] pr-[20px]">
                      <span className="sr-only">Report</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="adm-rows divide-y divide-border">
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className="stagger-item align-middle transition-colors hover:bg-muted/30"
                      style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                    >
                      <td className="max-w-[260px] py-[14px] pl-[20px] pr-[12px]">{identity(s)}</td>
                      <td className="max-w-[280px] px-[12px] py-[14px]">{courseList(s)}</td>
                      <td className="px-[12px] py-[14px]">{attendance(s)}</td>
                      <td className="px-[12px] py-[14px]">{progress(s)}</td>
                      <td className="py-[14px] pl-[12px] pr-[20px] text-right">{reportButton(s)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phones: one block per student instead of a sideways-scrolling table */}
            <ul className="adm-rows divide-y divide-border md:hidden">
              {filtered.map((s) => (
                <li key={s.id} className="space-y-[12px] px-[16px] py-[14px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    {identity(s)}
                    {reportButton(s, true)}
                  </div>
                  {courseList(s)}
                  <div className="flex items-end gap-[20px]">
                    <div className="shrink-0">{attendance(s)}</div>
                    <div className="min-w-0 flex-1">{progress(s)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="border-t border-border px-[16px] py-[12px] text-[12px] leading-[17px] text-muted-foreground sm:px-[20px]">
          Showing {filtered.length} of {plural(students.length, "student")}
        </div>
      </div>

      {reportFor && <StudentReportModal studentId={reportFor} onClose={() => setReportFor(null)} />}
    </div>
  );
}
