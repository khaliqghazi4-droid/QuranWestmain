"use client";

import * as React from "react";
import {
  X,
  Printer,
  Loader2,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  BookOpen,
  ClipboardCheck,
  Trophy,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/avatar";

type ReportData = {
  student: {
    id: string;
    name: string;
    email: string;
    country: string | null;
    bio: string | null;
    createdAt: string;
  };
  enrollments: Array<{
    id: string;
    progress: number;
    status: string;
    startedAt: string;
    course: { id: string; name: string; duration: string | null; level: string };
    teacher: { id: string; name: string } | null;
    lessonsCompleted: number;
  }>;
  attendance: Array<{
    id: string;
    status: "PRESENT" | "ABSENT" | "LATE";
    classTitle: string;
    courseName: string;
    classTime: string;
  }>;
  totalLessonsCompleted: number;
};

export function StudentReportModal({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [data, setData] = React.useState<ReportData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/students/${studentId}/report`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load report"));
  }, [studentId]);

  // Note: we don't lock body scroll because the overlay itself scrolls.

  // Add print-only class to body when this modal mounts
  React.useEffect(() => {
    document.body.classList.add("print-modal-open");
    return () => {
      document.body.classList.remove("print-modal-open");
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in print:overflow-visible print:bg-white print:backdrop-blur-none"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4 print:p-0 print:items-start">
      <div
        onClick={(e) => e.stopPropagation()}
        className="student-report-modal w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl print:max-w-full print:rounded-none print:border-0 print:shadow-none my-auto"
      >
        {/* Toolbar (not printed) */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card print:hidden">
          <h2 className="text-base font-bold">Student Progress Report</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={!data}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Print header (only when printing) */}
        <div className="hidden print:block border-b-2 border-foreground pb-4 mb-4 px-6 pt-6">
          <h1 className="text-2xl font-bold">Online Quran Academy</h1>
          <p className="text-sm text-muted-foreground">Student Progress Report</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {error ? (
          <div className="p-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-4 text-sm text-destructive">{error}</p>
          </div>
        ) : !data ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading report...</p>
          </div>
        ) : (
          <ReportContent data={data} />
        )}

        {/* Print footer */}
        {data && (
          <div className="hidden print:block text-center text-xs text-muted-foreground border-t border-foreground pt-4 mt-8 px-6 pb-6">
            Online Quran Academy · Confidential Student Progress Report
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function ReportContent({ data }: { data: ReportData }) {
  const { student, enrollments, attendance, totalLessonsCompleted } = data;

  const totalEnrollments = enrollments.length;
  const avgProgress =
    totalEnrollments === 0
      ? 0
      : Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments);
  const completedCourses = enrollments.filter((e) => e.progress >= 100).length;
  const totalAttendance = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const attendancePct =
    totalAttendance === 0 ? 0 : Math.round((presentCount / totalAttendance) * 100);

  return (
    <div className="p-6 space-y-5">
      {/* Student header */}
      <div className="flex items-start gap-4">
        <Avatar
          name={student.name}
          size={80}
          style="micah"
          className="rounded-2xl border-4 border-card shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {student.email}
            </span>
            {student.country && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {student.country}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Joined{" "}
              {new Date(student.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {student.bio && (
            <p className="mt-2 text-sm text-foreground">{student.bio}</p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={BookOpen} label="Courses" value={totalEnrollments} color="from-primary to-accent" />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${avgProgress}%`} color="from-[hsl(var(--gold))] to-amber-500" />
        <StatCard icon={Trophy} label="Completed" value={completedCourses} color="from-emerald-500 to-teal-500" />
        <StatCard icon={GraduationCap} label="Lessons" value={totalLessonsCompleted} color="from-fuchsia-500 to-purple-500" />
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${attendancePct}%`} color="from-blue-500 to-cyan-500" />
      </div>

      {/* Attendance breakdown */}
      {totalAttendance > 0 && (
        <div className="rounded-2xl border border-border bg-background p-5 print:border-foreground print:rounded-none">
          <h3 className="text-base font-bold mb-3">Attendance Breakdown</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <AttendanceCell label="Present" count={presentCount} total={totalAttendance} color="emerald" icon={CheckCircle2} />
            <AttendanceCell label="Late" count={lateCount} total={totalAttendance} color="gold" icon={Clock} />
            <AttendanceCell label="Absent" count={absentCount} total={totalAttendance} color="destructive" icon={XCircle} />
          </div>
        </div>
      )}

      {/* Course progress */}
      <div className="rounded-2xl border border-border bg-background p-5 print:border-foreground print:rounded-none">
        <h3 className="text-base font-bold mb-3">Course Progress</h3>
        {enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Not enrolled in any courses</p>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-border bg-card p-4 print:break-inside-avoid"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{e.course.name}</p>
                      {e.progress >= 100 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Completed
                        </span>
                      )}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {e.course.level}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                      {e.teacher && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {e.teacher.name}
                        </span>
                      )}
                      {e.course.duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {e.course.duration}
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
                      {e.lessonsCompleted > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" /> {e.lessonsCompleted} lessons
                        </span>
                      )}
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
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden print:border print:border-foreground">
                  <div
                    className={`h-full rounded-full transition-all ${
                      e.progress >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 print:bg-foreground"
                        : "bg-gradient-to-r from-primary to-accent print:bg-foreground"
                    }`}
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent attendance table */}
      {attendance.length > 0 && (
        <div className="rounded-2xl border border-border bg-background overflow-hidden print:border-foreground print:rounded-none">
          <div className="p-5 border-b border-border">
            <h3 className="text-base font-bold">Recent Attendance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last {Math.min(attendance.length, 20)} class records
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 print:bg-foreground/10">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-5 py-3 font-semibold">Course</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendance.slice(0, 20).map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-2.5 text-muted-foreground">
                      {new Date(r.classTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-2.5 font-medium">{r.classTitle}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{r.courseName}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.status === "PRESENT"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : r.status === "LATE"
                            ? "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))]"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {r.status === "PRESENT" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : r.status === "LATE" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
    <div className="rounded-2xl border border-border bg-background p-3 print:border-foreground print:rounded-none">
      <div
        className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-primary-foreground shadow-sm print:bg-foreground print:shadow-none`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function AttendanceCell({
  label,
  count,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  total: number;
  color: "emerald" | "gold" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pct = Math.round((count / total) * 100);
  const styles = {
    emerald: { bg: "bg-emerald-500/10", iconBg: "bg-emerald-500", text: "text-emerald-600" },
    gold: { bg: "bg-[hsl(var(--gold)/0.1)]", iconBg: "bg-[hsl(var(--gold))]", text: "text-[hsl(var(--gold))]" },
    destructive: { bg: "bg-destructive/10", iconBg: "bg-destructive", text: "text-destructive" },
  }[color];

  return (
    <div className={`flex items-center gap-3 rounded-xl ${styles.bg} p-3`}>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${styles.iconBg} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={`text-xl font-bold ${styles.text}`}>{count}</p>
        <p className="text-[11px] text-muted-foreground">
          {label} ({pct}%)
        </p>
      </div>
    </div>
  );
}
