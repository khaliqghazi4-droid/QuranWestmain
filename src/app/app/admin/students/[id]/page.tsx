import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
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
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function StudentReportPage({
  params,
}: {
  params: { id: string };
}) {
  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      studentEnrollments: {
        include: {
          course: { select: { id: true, name: true, duration: true, level: true } },
          teacher: { select: { id: true, name: true } },
        },
        orderBy: { startedAt: "desc" },
      },
      attendanceRecords: {
        include: {
          class: {
            include: {
              course: { select: { name: true } },
            },
          },
        },
        orderBy: { class: { startTime: "desc" } },
        take: 50,
      },
    },
  });

  if (!student || student.role !== "STUDENT") notFound();

  // Lessons completed
  const lessonCompletions = await prisma.lessonCompletion.findMany({
    where: { studentId: student.id },
    include: {
      lesson: {
        include: { course: { select: { id: true, name: true } } },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  // Stats
  const totalEnrollments = student.studentEnrollments.length;
  const avgProgress =
    totalEnrollments === 0
      ? 0
      : Math.round(
          student.studentEnrollments.reduce((sum, e) => sum + e.progress, 0) /
            totalEnrollments
        );
  const completedCourses = student.studentEnrollments.filter((e) => e.progress >= 100).length;
  const totalAttendance = student.attendanceRecords.length;
  const presentCount = student.attendanceRecords.filter((a) => a.status === "PRESENT").length;
  const lateCount = student.attendanceRecords.filter((a) => a.status === "LATE").length;
  const absentCount = student.attendanceRecords.filter((a) => a.status === "ABSENT").length;
  const attendancePct =
    totalAttendance === 0 ? 0 : Math.round((presentCount / totalAttendance) * 100);

  // Lessons per course
  const lessonsPerCourse = new Map<string, number>();
  for (const lc of lessonCompletions) {
    const cId = lc.lesson.course.id;
    lessonsPerCourse.set(cId, (lessonsPerCourse.get(cId) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      {/* Non-print toolbar */}
      <div className="print:hidden flex items-center justify-between">
        <Link
          href="/app/admin/students"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        <PrintButton />
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block border-b-2 border-foreground pb-4 mb-4">
        <h1 className="text-2xl font-bold">Online Quran Academy</h1>
        <p className="text-sm text-muted-foreground">Student Progress Report</p>
        <p className="text-xs text-muted-foreground mt-1">
          Generated on {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Student header */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden print:border-foreground print:rounded-none">
        <div className="h-24 bg-gradient-to-br from-primary via-accent to-primary relative print:hidden">
          <div className="absolute -bottom-12 left-6">
            <Avatar
              name={student.name}
              size={96}
              style="micah"
              className="rounded-2xl border-4 border-card shadow-xl"
            />
          </div>
        </div>

        <div className="pt-16 pb-6 px-6 print:pt-6 print:px-4">
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              {student.createdAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {student.bio && (
            <p className="mt-3 text-sm text-foreground">{student.bio}</p>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:grid-cols-5">
        <StatCard icon={BookOpen} label="Courses" value={totalEnrollments} color="from-primary to-accent" />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${avgProgress}%`} color="from-[hsl(var(--gold))] to-amber-500" />
        <StatCard icon={Trophy} label="Completed" value={completedCourses} color="from-emerald-500 to-teal-500" />
        <StatCard icon={GraduationCap} label="Lessons Done" value={lessonCompletions.length} color="from-fuchsia-500 to-purple-500" />
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${attendancePct}%`} color="from-blue-500 to-cyan-500" />
      </div>

      {/* Attendance breakdown */}
      {totalAttendance > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 print:border-foreground print:rounded-none">
          <h3 className="text-lg font-bold mb-4">Attendance Breakdown</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                <p className="text-xs text-muted-foreground">Present ({Math.round((presentCount / totalAttendance) * 100)}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[hsl(var(--gold)/0.1)] p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[hsl(var(--gold))] text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--gold))]">{lateCount}</p>
                <p className="text-xs text-muted-foreground">Late ({Math.round((lateCount / totalAttendance) * 100)}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-destructive text-white">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                <p className="text-xs text-muted-foreground">Absent ({Math.round((absentCount / totalAttendance) * 100)}%)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course progress */}
      <div className="rounded-2xl border border-border bg-card p-6 print:border-foreground print:rounded-none">
        <h3 className="text-lg font-bold mb-4">Course Progress</h3>
        {student.studentEnrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No courses enrolled</p>
        ) : (
          <div className="space-y-4">
            {student.studentEnrollments.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-border bg-background p-4 print:break-inside-avoid"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold">{e.course.name}</p>
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
                        {e.startedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {lessonsPerCourse.get(e.course.id) && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {lessonsPerCourse.get(e.course.id)} lessons done
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-3xl font-bold shrink-0 ${
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
                <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden print:border print:border-foreground">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
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

      {/* Recent attendance */}
      {student.attendanceRecords.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden print:border-foreground print:rounded-none">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold">Recent Attendance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last {student.attendanceRecords.length} class records
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 print:bg-foreground/10">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Class</th>
                  <th className="px-6 py-3 font-semibold">Course</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student.attendanceRecords.slice(0, 20).map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-3 text-muted-foreground">
                      {r.class.startTime.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 font-medium">{r.class.title}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {r.class.course.name}
                    </td>
                    <td className="px-6 py-3">
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

      {/* Footer */}
      <div className="hidden print:block text-center text-xs text-muted-foreground border-t border-foreground pt-4 mt-8">
        Online Quran Academy · Confidential Student Progress Report
      </div>
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
    <div className="rounded-2xl border border-border bg-card p-4 print:border-foreground print:rounded-none">
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-primary-foreground shadow-md print:bg-foreground print:shadow-none`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
