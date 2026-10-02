import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  // The student's full set of courses after the edit; courses left out are un-enrolled.
  enrollments?: { courseId: string; teacherId?: string | null }[];
};

// PATCH /api/admin/students/:id — admin edits a student's details and course enrollments
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim().slice(0, 120);
  const email = body.email?.trim().toLowerCase().slice(0, 200);
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  });
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id: student.id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json({ error: "Another account already uses this email" }, { status: 409 });
  }

  // Keep only real courses, and a teacher only if they actually teach that course
  let enrollments: { courseId: string; teacherId: string | null }[] | null = null;
  if (Array.isArray(body.enrollments)) {
    const wanted = new Map(
      body.enrollments
        .filter((e) => e && typeof e.courseId === "string")
        .map((e) => [e.courseId, e.teacherId || null] as const)
    );
    const courses = await prisma.course.findMany({
      where: { id: { in: Array.from(wanted.keys()) } },
      select: { id: true, teacherId: true, courseTeachers: { select: { teacherId: true } } },
    });
    enrollments = courses.map((c) => {
      const teacherId = wanted.get(c.id) ?? null;
      const teaches =
        !!teacherId &&
        (c.teacherId === teacherId || c.courseTeachers.some((ct) => ct.teacherId === teacherId));
      return { courseId: c.id, teacherId: teaches ? teacherId : null };
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.id },
        data: {
          name,
          email,
          phone: body.phone?.trim().slice(0, 40) || null,
          country: body.country?.trim().slice(0, 100) || null,
        },
      });
      if (enrollments) {
        // Removing a course also removes its schedule (bookings) and their attendance
        await tx.enrollment.deleteMany({
          where: { studentId: student.id, courseId: { notIn: enrollments.map((e) => e.courseId) } },
        });
        for (const e of enrollments) {
          await tx.enrollment.upsert({
            where: { studentId_courseId: { studentId: student.id, courseId: e.courseId } },
            update: { teacherId: e.teacherId },
            create: { studentId: student.id, courseId: e.courseId, teacherId: e.teacherId },
          });
        }
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const updated = await prisma.user.findUniqueOrThrow({
    where: { id: student.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      loginPassword: true,
      suspendedAt: true,
      createdAt: true,
      studentEnrollments: {
        select: {
          course: { select: { id: true, name: true, duration: true } },
          teacher: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Names, emails and enrollments show on admin, teacher and student pages alike
  revalidatePath("/app", "layout");

  return NextResponse.json({
    student: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      country: updated.country,
      loginPassword: updated.loginPassword,
      suspended: !!updated.suspendedAt,
      createdAt: updated.createdAt.toISOString(),
      courses: updated.studentEnrollments.map((e) => ({
        id: e.course.id,
        name: e.course.name,
        duration: e.course.duration,
        teacherId: e.teacher?.id ?? null,
        teacherName: e.teacher?.name ?? null,
      })),
    },
  });
}
