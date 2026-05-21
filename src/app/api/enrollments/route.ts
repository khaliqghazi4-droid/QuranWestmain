import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        include: { teacher: { select: { id: true, name: true } } },
      },
    },
    orderBy: { startedAt: "desc" },
  });
  return NextResponse.json({ enrollments });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can enroll" }, { status: 401 });
  }

  try {
    const { courseId } = (await req.json()) as { courseId?: string };
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: session.user.id, courseId },
      include: { course: true },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Enrollment failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
