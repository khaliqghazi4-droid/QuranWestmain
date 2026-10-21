import { prisma } from "@/lib/prisma";
import type { StudentReportData } from "@/components/admin/student-report";

const RECENT_MARKS = 10;

// Everything a student's report shows (the admin's student page and the
// Reports page's pop-up, via /api/students/[id]/report), or null when the id
// isn't a student. Attendance is what teachers mark against each booked class
// (BookingAttendance); the older per-class Attendance table is no longer
// written to.
export async function loadStudentReport(id: string): Promise<StudentReportData | null> {
  const student = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      timezone: true,
      bio: true,
      image: true,
      createdAt: true,
      suspendedAt: true,
      accessExpiresAt: true,
      studentEnrollments: {
        select: {
          id: true,
          progress: true,
          status: true,
          startedAt: true,
          course: { select: { id: true, name: true, duration: true, level: true } },
          teacher: { select: { name: true } },
          bookings: {
            select: { id: true, dayOfWeek: true, startTime: true, duration: true, teacher: { select: { name: true } } },
          },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });
  if (!student || student.role !== "STUDENT") return null;

  const [lessonCompletions, marksByStatus, recent] = await Promise.all([
    prisma.lessonCompletion.findMany({
      where: { studentId: id },
      select: { lesson: { select: { courseId: true } } },
    }),
    prisma.bookingAttendance.groupBy({
      by: ["status"],
      where: { studentId: id },
      _count: { _all: true },
    }),
    prisma.bookingAttendance.findMany({
      where: { studentId: id },
      orderBy: { date: "desc" },
      take: RECENT_MARKS,
      select: {
        id: true,
        status: true,
        date: true,
        bookingSlot: {
          select: {
            startTime: true,
            teacher: { select: { name: true } },
            enrollment: { select: { course: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  const lessonsPerCourse = new Map<string, number>();
  for (const lc of lessonCompletions) {
    lessonsPerCourse.set(lc.lesson.courseId, (lessonsPerCourse.get(lc.lesson.courseId) ?? 0) + 1);
  }
  const marks = (status: string) => marksByStatus.find((g) => g.status === status)?._count._all ?? 0;

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      country: student.country,
      timezone: student.timezone,
      bio: student.bio,
      image: student.image,
      createdAt: student.createdAt.toISOString(),
      suspended: !!student.suspendedAt,
      accessExpiresAt: student.accessExpiresAt?.toISOString() ?? null,
    },
    enrollments: student.studentEnrollments.map((e) => ({
      id: e.id,
      progress: e.progress,
      status: e.status,
      startedAt: e.startedAt.toISOString(),
      course: e.course,
      teacherName: e.teacher?.name ?? null,
      lessonsCompleted: lessonsPerCourse.get(e.course.id) ?? 0,
    })),
    bookings: student.studentEnrollments.flatMap((e) =>
      e.bookings.map((b) => ({
        id: b.id,
        dayOfWeek: b.dayOfWeek,
        startTime: b.startTime,
        duration: b.duration,
        courseName: e.course.name,
        teacherName: b.teacher.name,
      }))
    ),
    attendance: {
      present: marks("PRESENT"),
      late: marks("LATE"),
      absent: marks("ABSENT"),
      recent: recent.map((m) => ({
        id: m.id,
        status: m.status,
        date: m.date.toISOString(),
        startTime: m.bookingSlot.startTime,
        courseName: m.bookingSlot.enrollment.course.name,
        teacherName: m.bookingSlot.teacher.name,
      })),
    },
    lessonsCompleted: lessonCompletions.length,
  };
}
