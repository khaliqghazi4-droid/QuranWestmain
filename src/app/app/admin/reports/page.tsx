import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STUDENT } from "@/lib/auth";
import { ProgressReports } from "./progress-reports";
import { ReportsHeader, ReportsShell } from "./shell";

// The same students as the Students page (ACTIVE_STUDENT). Attendance is what
// teachers mark against each booked class (BookingAttendance); the older
// per-class Attendance table is no longer written to.
const getCachedReportsData = unstable_cache(
  async () => {
    const [students, lessonCompletions] = await Promise.all([
      prisma.user.findMany({
        where: ACTIVE_STUDENT,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          studentEnrollments: {
            select: {
              id: true,
              progress: true,
              course: { select: { id: true, name: true } },
              teacher: { select: { name: true } },
            },
            orderBy: { startedAt: "asc" },
          },
          bookingAttendance: { select: { status: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.lessonCompletion.groupBy({
        by: ["studentId"],
        _count: { id: true },
      }),
    ]);
    return { students, lessonCompletions };
  },
  ["admin-reports-v2"],
  { revalidate: 30 }
);

// Rendered per request, not at build time (the build has no database);
// the data itself stays cached for 30 seconds by unstable_cache above.
export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <ReportsHeader />
      <Suspense fallback={<ReportsShell />}>
        <ReportsData />
      </Suspense>
    </div>
  );
}

// A late student still came to class
const attended = (status: string) => status === "PRESENT" || status === "LATE";

async function ReportsData() {
  const { students, lessonCompletions } = await getCachedReportsData();
  const completionsByStudent = new Map(lessonCompletions.map((lc) => [lc.studentId, lc._count.id]));

  const enrollments = students.flatMap((s) => s.studentEnrollments);
  const marks = students.flatMap((s) => s.bookingAttendance);
  const percent = (part: number, whole: number) => Math.round((part / whole) * 100);

  return (
    <ProgressReports
      students={students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        image: s.image,
        avgProgress: s.studentEnrollments.length
          ? Math.round(s.studentEnrollments.reduce((sum, e) => sum + e.progress, 0) / s.studentEnrollments.length)
          : 0,
        attendancePct: s.bookingAttendance.length
          ? percent(s.bookingAttendance.filter((a) => attended(a.status)).length, s.bookingAttendance.length)
          : null,
        classesMarked: s.bookingAttendance.length,
        lessonsCompleted: completionsByStudent.get(s.id) ?? 0,
        enrollments: s.studentEnrollments.map((e) => ({
          id: e.id,
          courseId: e.course.id,
          courseName: e.course.name,
          teacherName: e.teacher?.name ?? null,
          progress: e.progress,
        })),
      }))}
      stats={{
        students: students.length,
        avgProgress: enrollments.length
          ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
          : 0,
        attendancePct: marks.length ? percent(marks.filter((a) => attended(a.status)).length, marks.length) : null,
        completed: enrollments.filter((e) => e.progress >= 100).length,
      }}
    />
  );
}
