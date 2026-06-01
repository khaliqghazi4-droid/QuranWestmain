import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function canManage(id: string, userId: string, role: string) {
  if (role === "ADMIN") return true;
  if (role !== "TEACHER") return false;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { course: true },
  });
  return lesson?.course.teacherId === userId;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canManage(params.id, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const allowed: Record<string, unknown> = {};
    const fields = ["title", "description", "content", "videoUrl", "audioUrl", "fileUrl", "duration", "order", "isPublished"];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }

    // Optional: replace the lesson's student assignments
    let assignmentsTouched = false;
    if (Array.isArray(body.studentIds)) {
      const existing = await prisma.lesson.findUnique({
        where: { id: params.id },
        select: { courseId: true },
      });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const validEnrollments = await prisma.enrollment.findMany({
        where: { courseId: existing.courseId, studentId: { in: body.studentIds } },
        select: { studentId: true },
      });
      const validIds = validEnrollments.map((e) => e.studentId);
      if (validIds.length === 0) {
        return NextResponse.json(
          { error: "Assign at least one enrolled student" },
          { status: 400 }
        );
      }
      await prisma.$transaction([
        prisma.lessonAssignment.deleteMany({ where: { lessonId: params.id } }),
        prisma.lessonAssignment.createMany({
          data: validIds.map((studentId) => ({ lessonId: params.id, studentId })),
        }),
      ]);
      assignmentsTouched = true;
    }

    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: allowed,
      include: assignmentsTouched
        ? {
            assignments: { include: { student: { select: { id: true, name: true } } } },
          }
        : undefined,
    });

    revalidatePath("/app/teacher/lessons");
    revalidatePath("/app/student/courses");
    return NextResponse.json({ lesson });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canManage(params.id, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.lesson.delete({ where: { id: params.id } });
  revalidatePath("/app/teacher/lessons");
  revalidatePath("/app/student/courses");
  return NextResponse.json({ ok: true });
}
