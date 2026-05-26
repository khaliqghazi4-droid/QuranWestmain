import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProgressReports } from "./progress-reports";

export const revalidate = 30;

export default async function AdminReportsPage() {
  const [students, courses] = await Promise.all([
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
  ]);

  // Aggregate stats
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

  // Lesson completions per student (for "active learners")
  const lessonCompletions = await prisma.lessonCompletion.groupBy({
    by: ["studentId"],
    _count: { id: true },
  });
  const completionsByStudent = new Map(
    lessonCompletions.map((lc) => [lc.studentId, lc._count.id])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Progress Reports"
        description={`${students.length} students · ${totalEnrollments} enrollments · ${completedCount} completed courses`}
      />
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
            createdAt: s.createdAt.toISOString(),
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
              startedAt: e.startedAt.toISOString(),
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
    </div>
  );
}
