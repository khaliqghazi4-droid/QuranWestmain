import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Students: only enrolled courses
  if (session.user.role === "STUDENT") {
    const enrolled = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
    });
    if (!enrolled) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  // Teachers: only their courses
  if (session.user.role === "TEACHER") {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseId, ...(session.user.role === "STUDENT" ? { isPublished: true } : {}) },
    orderBy: { order: "asc" },
    include: {
      completions:
        session.user.role === "STUDENT"
          ? { where: { studentId: session.user.id }, select: { id: true } }
          : { select: { id: true } },
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
    const { courseId, title, description, content, videoUrl, audioUrl, fileUrl, duration } = body as {
      courseId?: string;
      title?: string;
      description?: string;
      content?: string;
      videoUrl?: string;
      audioUrl?: string;
      fileUrl?: string;
      duration?: number;
    };

    if (!courseId || !title) {
      return NextResponse.json({ error: "courseId and title are required" }, { status: 400 });
    }

    // Teacher can only add lessons to their own courses
    if (session.user.role === "TEACHER") {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json({ error: "Not your course" }, { status: 403 });
      }
    }

    // Auto-increment order
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
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
