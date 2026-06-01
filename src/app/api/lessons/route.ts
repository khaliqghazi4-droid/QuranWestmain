import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Students: only see lessons explicitly assigned to them
  if (session.user.role === "STUDENT") {
    const enrolled = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
    });
    if (!enrolled) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

    const lessons = await prisma.lesson.findMany({
      where: {
        courseId,
        isPublished: true,
        assignments: { some: { studentId: session.user.id } },
      },
      orderBy: { order: "asc" },
      include: {
        completions: { where: { studentId: session.user.id }, select: { id: true } },
      },
    });
    return NextResponse.json({ lessons });
  }

  // Teacher: only their courses
  if (session.user.role === "TEACHER") {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      completions: { select: { id: true } },
      assignments: { include: { student: { select: { id: true, name: true } } } },
    },
  });
  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      courseId,
      title,
      description,
      content,
      videoUrl,
      audioUrl,
      fileUrl,
      duration,
      studentIds,
    } = body as {
      courseId?: string;
      title?: string;
      description?: string;
      content?: string;
      videoUrl?: string;
      audioUrl?: string;
      fileUrl?: string;
      duration?: number;
      studentIds?: string[];
    };

    if (!courseId || !title) {
      return NextResponse.json({ error: "courseId and title are required" }, { status: 400 });
    }
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Assign at least one student to this lesson" },
        { status: 400 }
      );
    }

    // Teacher can only add lessons to their own courses
    if (session.user.role === "TEACHER") {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json({ error: "Not your course" }, { status: 403 });
      }
    }

    // Verify the chosen students are actually enrolled in this course
    const validEnrollments = await prisma.enrollment.findMany({
      where: { courseId, studentId: { in: studentIds } },
      select: { studentId: true },
    });
    const validIds = new Set(validEnrollments.map((e) => e.studentId));
    const filteredStudentIds = studentIds.filter((id) => validIds.has(id));
    if (filteredStudentIds.length === 0) {
      return NextResponse.json(
        { error: "None of the chosen students are enrolled in this course" },
        { status: 400 }
      );
    }

    const last = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        description: description || null,
        content: content || null,
        videoUrl: videoUrl || null,
        audioUrl: audioUrl || null,
        fileUrl: fileUrl || null,
        duration: duration || null,
        order: nextOrder,
        assignments: {
          createMany: {
            data: filteredStudentIds.map((studentId) => ({ studentId })),
          },
        },
      },
      include: {
        assignments: { include: { student: { select: { id: true, name: true } } } },
      },
    });

    revalidatePath("/app/teacher/lessons");
    revalidatePath("/app/student/courses");
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
