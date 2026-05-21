"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  Trophy,
  ClipboardCheck,
  BookOpen,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { StudentReportModal } from "@/components/admin/student-report-modal";

type Enrollment = {
  id: string;
  courseId: string;
  courseName: string;
  duration: string | null;
  teacherName: string | null;
  progress: number;
  status: string;
  startedAt: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  createdAt: string;
  avgProgress: number;
  attendancePct: number | null;
  classesAttended: number;
  lessonsCompleted: number;
  enrollments: Enrollment[];
};

type Course = { id: string; name: string };

type Stats = {
  totalStudents: number;
  totalEnrollments: number;
  avgProgress: number;
  completedCount: number;
  avgAttendance: number;
};

type SortBy = "name" | "progress" | "joined" | "courses";

export function ProgressReports({
  students,
  courses,
  stats,
}: {
  students: Student[];
  courses: Course[];
  stats: Stats;
}) {
  const [query, setQuery] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "completed" | "active" | "no-progress">("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("joined");
  const [sortDesc, setSortDesc] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [reportModalId, setReportModalId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let list = students.filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.country?.toLowerCase().includes(q) ?? false);

      const matchesCourse =
        courseFilter === "all" ||
        s.enrollments.some((e) => e.courseId === courseFilter);

      const hasAny = s.enrollments.length > 0;
      const allCompleted = hasAny && s.enrollments.every((e) => e.progress >= 100);
      const someActive = hasAny && s.enrollments.some((e) => e.progress > 0 && e.progress < 100);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && allCompleted) ||
        (statusFilter === "active" && someActive) ||
        (statusFilter === "no-progress" && hasAny && s.avgProgress === 0);

      return matchesQuery && matchesCourse && matchesStatus;
    });

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "progress":
          cmp = a.avgProgress - b.avgProgress;
          break;
        case "joined":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "courses":
          cmp = a.enrollments.length - b.enrollments.length;
          break;
      }
      return sortDesc ? -cmp : cmp;
    });

    return list;
  }, [students, query, courseFilter, statusFilter, sortBy, sortDesc]);

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Country", "Joined", "Courses", "Avg Progress %", "Attendance %", "Lessons Completed", "Classes Attended"],
      ...filtered.map((s) => [
        s.name,
        s.email,
        s.country ?? "",
        new Date(s.createdAt).toLocaleDateString(),
        s.enrollments.map((e) => `${e.courseName} (${e.progress}%)`).join("; "),
        s.avgProgress,
        s.attendancePct ?? "",
        s.lessonsCompleted,
        s.classesAttended,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `student-progress-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Students" value={stats.totalStudents} color="from-primary to-accent" />
        <StatCard icon={BookOpen} label="Total Enrollments" value={stats.totalEnrollments} color="from-emerald-500 to-teal-500" />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${stats.avgProgress}%`} color="from-[hsl(var(--gold))] to-amber-500" />
        <StatCard icon={Trophy} label="Completed" value={stats.completedCount} color="from-fuchsia-500 to-purple-500" />
        <StatCard icon={ClipboardCheck} label="Avg Attendance" value={`${stats.avgAttendance}%`} color="from-blue-500 to-cyan-500" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0">
            <Filter className="h-4 w-4" />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed All</option>
            <option value="active">In Progress</option>
            <option value="no-progress">Not Started</option>
          </select>

          <div className="flex items-center gap-1 rounded-full border border-border bg-background px-1">
            <span className="px-3 text-xs text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-transparent text-sm focus:outline-none px-2 py-2"
            >
              <option value="joined">Joined Date</option>
              <option value="name">Name</option>
              <option value="progress">Progress</option>
              <option value="courses">Courses Count</option>
            </select>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
              title={sortDesc ? "Descending" : "Ascending"}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full sm:w-56 rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg"
            title="Export as CSV"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {students.length} students
        </p>
      </div>

      {/* Student cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">No students match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => {
            const isOpen = expandedId === s.id;
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all stagger-item"
                style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
              >
                <button
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/20 transition-colors"
                >
                  <Avatar name={s.name} size={48} style="micah" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{s.name}</p>
                      <span className="text-[11px] text-muted-foreground">{s.email}</span>
                      {s.country && (
                        <span className="text-[11px] text-muted-foreground">· {s.country}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 flex-wrap text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {s.enrollments.length}{" "}
                        {s.enrollments.length === 1 ? "course" : "courses"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> {s.lessonsCompleted} lessons done
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {s.classesAttended} classes
                      </span>
                      {s.attendancePct !== null && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <ClipboardCheck className="h-3 w-3" /> {s.attendancePct}% attendance
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:block w-40 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={`font-bold ${
                        s.avgProgress >= 100
                          ? "text-emerald-600"
                          : s.avgProgress === 0
                          ? "text-muted-foreground"
                          : "text-primary"
                      }`}>
                        {s.avgProgress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          s.avgProgress >= 100
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : "bg-gradient-to-r from-primary to-accent"
                        }`}
                        style={{ width: `${s.avgProgress}%` }}
                      />
                    </div>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-background/40 p-5 space-y-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setReportModalId(s.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" /> View Full Report (Printable)
                      </button>
                    </div>
                    {s.enrollments.length === 0 ? (
                      <div className="text-center py-6">
                        <XCircle className="mx-auto h-10 w-10 text-muted-foreground/30" />
                        <p className="mt-3 text-sm text-muted-foreground">
                          Not enrolled in any courses
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] uppercase font-semibold text-muted-foreground">
                          Courses & Progress
                        </p>
                        {s.enrollments.map((e) => (
                          <div
                            key={e.id}
                            className="rounded-xl border border-border bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-bold">{e.courseName}</p>
                                  {e.progress >= 100 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                      <CheckCircle2 className="h-2.5 w-2.5" /> Completed
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                                  {e.teacherName && (
                                    <span className="inline-flex items-center gap-1">
                                      <Users className="h-3 w-3" /> {e.teacherName}
                                    </span>
                                  )}
                                  {e.duration && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {e.duration}
                                    </span>
                                  )}
                                  <span>
                                    Started{" "}
                                    {new Date(e.startedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={`text-2xl font-bold shrink-0 ${
                                  e.progress >= 100
                                    ? "text-emerald-600"
                                    : e.progress === 0
                                    ? "text-muted-foreground"
                                    : "text-primary"
                                }`}
                              >
                                {e.progress}%
                              </p>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  e.progress >= 100
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                    : "bg-gradient-to-r from-primary to-accent"
                                }`}
                                style={{ width: `${e.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reportModalId && (
        <StudentReportModal
          studentId={reportModalId}
          onClose={() => setReportModalId(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${color} text-primary-foreground shadow-md`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
