import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const scope = searchParams.get("scope"); // "upcoming" | "all"
  const upcomingFilter = scope === "upcoming" ? { startTime: { gte: new Date() } } : {};

  let where: Record<string, unknown> = upcomingFilter;
  if (courseId) where = { ...where, courseId };

  if (session.user.role === "STUDENT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      select: { courseId: true },
    });
    where = { ...where, courseId: { in: enrollments.map((e) => e.courseId) } };
  } else if (session.user.role === "TEACHER") {
    where = { ...where, course: { teacherId: session.user.id } };
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      course: { select: { id: true, name: true, level: true, teacher: { select: { name: true } } } },
      _count: { select: { attendance: true } },
    },
    orderBy: { startTime: "asc" },
    take: 100,
  });

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, title, description, startTime, duration, meetingUrl } = body as {
      courseId?: string;
      title?: string;
      description?: string;
      startTime?: string;
      duration?: number;
      meetingUrl?: string;
    };

    if (!courseId || !title || !startTime || !duration) {
      return NextResponse.json({ error: "courseId, title, startTime and duration are required" }, { status: 400 });
    }

    // Teachers can only create classes for their own courses
    if (session.user.role === "TEACHER") {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json({ error: "You can only schedule classes for your assigned courses" }, { status: 403 });
      }
    }

    const cls = await prisma.class.create({
      data: {
        courseId,
        title,
        description,
        startTime: new Date(startTime),
        duration,
        meetingUrl,
      },
      include: { course: { select: { id: true, name: true, level: true } } },
    });

    return NextResponse.json({ class: cls }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create class";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
