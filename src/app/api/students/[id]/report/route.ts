import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/students/[id]/report
// Returns comprehensive progress report data for a single student
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      country: true,
      bio: true,
      createdAt: true,
      role: true,
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

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lessonCompletions = await prisma.lessonCompletion.findMany({
    where: { studentId: student.id },
    include: { lesson: { select: { courseId: true } } },
  });

  const lessonsPerCourse: Record<string, number> = {};
  for (const lc of lessonCompletions) {
    lessonsPerCourse[lc.lesson.courseId] =
      (lessonsPerCourse[lc.lesson.courseId] ?? 0) + 1;
  }

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      country: student.country,
      bio: student.bio,
      createdAt: student.createdAt.toISOString(),
    },
    enrollments: student.studentEnrollments.map((e) => ({
      id: e.id,
      progress: e.progress,
      status: e.status,
      startedAt: e.startedAt.toISOString(),
      course: e.course,
      teacher: e.teacher,
      lessonsCompleted: lessonsPerCourse[e.course.id] ?? 0,
    })),
    attendance: student.attendanceRecords.map((r) => ({
      id: r.id,
      status: r.status,
      classTitle: r.class.title,
      courseName: r.class.course.name,
      classTime: r.class.startTime.toISOString(),
    })),
    totalLessonsCompleted: lessonCompletions.length,
  });
}
