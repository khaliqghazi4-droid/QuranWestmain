import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/teachers
// Returns all teachers of a course with their student counts
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      courseTeachers: {
        include: { teacher: { select: { id: true, name: true, email: true, country: true } } },
      },
      enrollments: {
        select: {
          id: true,
          teacherId: true,
          progress: true,
          startedAt: true,
          student: { select: { id: true, name: true, email: true, country: true } },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build teachers list with student counts
  const teachersMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      country: string | null;
      isPrimary: boolean;
      students: typeof course.enrollments;
    }
  >();

  for (const ct of course.courseTeachers) {
    teachersMap.set(ct.teacher.id, {
      id: ct.teacher.id,
      name: ct.teacher.name,
      email: ct.teacher.email,
      country: ct.teacher.country,
      isPrimary: course.teacherId === ct.teacher.id,
      students: course.enrollments.filter((e) => e.teacherId === ct.teacher.id),
    });
  }

  // Include primary teacher even if not in courseTeachers (legacy)
  if (course.teacherId && !teachersMap.has(course.teacherId)) {
    const primary = await prisma.user.findUnique({
      where: { id: course.teacherId },
      select: { id: true, name: true, email: true, country: true },
    });
    if (primary) {
      teachersMap.set(primary.id, {
        ...primary,
        isPrimary: true,
        students: course.enrollments.filter((e) => e.teacherId === primary.id),
      });
    }
  }

  // Unassigned students (no teacher)
  const unassignedStudents = course.enrollments.filter((e) => !e.teacherId);

  return NextResponse.json({
    teachers: Array.from(teachersMap.values()).sort((a, b) =>
      a.isPrimary ? -1 : b.isPrimary ? 1 : 0
    ),
    unassignedStudents,
    totalEnrollments: course.enrollments.length,
  });
}
