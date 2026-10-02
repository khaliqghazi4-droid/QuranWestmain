import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProgressReports } from "./progress-reports";
import { MOCK_REPORTS_STUDENTS, MOCK_REPORTS_STATS, MOCK_REPORTS_COURSES } from "../_mock-data";

const getCachedReportsData = unstable_cache(
  async () => {
    const [students, courses, lessonCompletions] = await Promise.all([
      prisma.user.findMany({
        where: { role: "STUDENT" },
        include: {
          studentEnrollments: {
            include: {
              course: { select: { id: true, name: true, duration: true } },
              teacher: { select: { id: true, name: true } },
            },
            orderBy: { startedAt: "desc" },
          },
          attendanceRecords: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.lessonCompletion.groupBy({
        by: ["studentId"],
        _count: { id: true },
      }),
    ]);
    return { students, courses, lessonCompletions };
  },
  ["admin-reports"],
  { revalidate: 30 }
);

export const revalidate = 30;

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Student Progress Reports" description="Track student learning outcomes" />
      <Suspense fallback={<ReportsShell />}>
        <ReportsData />
      </Suspense>
    </div>
  );
}

async function ReportsData() {
  const { students, courses, lessonCompletions } = await getCachedReportsData();

  const allEnrollments = students.flatMap((s) => s.studentEnrollments);
  const totalEnrollments = allEnrollments.length;
  const avgProgress =
    totalEnrollments === 0
      ? 0
      : Math.round(allEnrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments);
  const completedCount = allEnrollments.filter((e) => e.progress >= 100).length;

  const allAttendance = students.flatMap((s) => s.attendanceRecords);
  const presentCount = allAttendance.filter((a) => a.status === "PRESENT").length;
  const avgAttendance =
    allAttendance.length === 0 ? 0 : Math.round((presentCount / allAttendance.length) * 100);

  const completionsByStudent = new Map(
    lessonCompletions.map((lc) => [lc.studentId, lc._count.id])
  );

  const isMock = students.length === 0;

  if (isMock) {
    return (
      <>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          Showing sample data · Add real students and this banner will disappear automatically
        </div>
        <ProgressReports students={MOCK_REPORTS_STUDENTS} courses={MOCK_REPORTS_COURSES} stats={MOCK_REPORTS_STATS} />
      </>
    );
  }

  return (
    <ProgressReports
      students={students.map((s) => {
        const att = s.attendanceRecords;
        const studentAttendancePct =
          att.length === 0
            ? null
            : Math.round((att.filter((a) => a.status === "PRESENT").length / att.length) * 100);
        const studentAvgProgress =
          s.studentEnrollments.length === 0
            ? 0
            : Math.round(
                s.studentEnrollments.reduce((sum, e) => sum + e.progress, 0) /
                  s.studentEnrollments.length
              );
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          country: s.country,
          createdAt: new Date(s.createdAt).toISOString(),
          avgProgress: studentAvgProgress,
          attendancePct: studentAttendancePct,
          classesAttended: att.length,
          lessonsCompleted: completionsByStudent.get(s.id) ?? 0,
          enrollments: s.studentEnrollments.map((e) => ({
            id: e.id,
            courseId: e.course.id,
            courseName: e.course.name,
            duration: e.course.duration,
            teacherName: e.teacher?.name ?? null,
            progress: e.progress,
            status: e.status,
            startedAt: new Date(e.startedAt).toISOString(),
          })),
        };
      })}
      courses={courses}
      stats={{
        totalStudents: students.length,
        totalEnrollments,
        avgProgress,
        completedCount,
        avgAttendance,
      }}
    />
  );
}

function ReportsShell() {
  const stats = ["Total Students", "Avg Progress", "Completed", "Attendance"];
  const cols = ["Student", "Course", "Progress", "Attendance", "Status"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((label) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-base font-bold text-muted-foreground/40">—</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex gap-3 px-4 py-3 border-b border-border bg-muted/20">
          {cols.map((h) => (
            <span key={h} className="text-xs font-medium text-muted-foreground flex-1">{h}</span>
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b border-border last:border-0">
            {cols.map((h) => (
              <span key={h} className="text-xs text-muted-foreground/40 flex-1">—</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
