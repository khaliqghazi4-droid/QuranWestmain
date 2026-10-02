import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Toggle completion: if not complete → mark complete; if complete → un-complete
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can complete lessons" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, courseId: true },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // Must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: session.user.id, courseId: lesson.courseId },
    },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  // Toggle
  const existing = await prisma.lessonCompletion.findUnique({
    where: { lessonId_studentId: { lessonId: params.id, studentId: session.user.id } },
  });

  if (existing) {
    await prisma.lessonCompletion.delete({ where: { id: existing.id } });
  } else {
    await prisma.lessonCompletion.create({
      data: { lessonId: params.id, studentId: session.user.id },
    });
  }

  // Recalculate course progress
  const totalLessons = await prisma.lesson.count({
    where: { courseId: lesson.courseId, isPublished: true },
  });
  const completedLessons = await prisma.lessonCompletion.count({
    where: {
      studentId: session.user.id,
      lesson: { courseId: lesson.courseId, isPublished: true },
    },
  });
  const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress, status: progress >= 100 ? "completed" : "active" },
  });

  // Teacher's Students / Dashboard / Lessons show progress + completion counts
  revalidatePath("/app/teacher", "layout");
  return NextResponse.json({
    completed: !existing,
    progress,
    completedLessons,
    totalLessons,
  });
}
