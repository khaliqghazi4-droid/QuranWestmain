import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");

  if (session.user.role === "STUDENT") {
    const records = await prisma.attendance.findMany({
      where: { studentId: session.user.id },
      include: {
        class: {
          include: { course: { select: { name: true, teacher: { select: { name: true } } } } },
        },
      },
      orderBy: { markedAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ records });
  }

  if (classId) {
    const records = await prisma.attendance.findMany({
      where: { classId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ records });
  }

  if (studentId) {
    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: { class: { include: { course: { select: { name: true } } } } },
      orderBy: { markedAt: "desc" },
    });
    return NextResponse.json({ records });
  }

  return NextResponse.json({ records: [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      classId: string;
      marks: { studentId: string; status: AttendanceStatus }[];
    };

    if (!body.classId || !Array.isArray(body.marks)) {
      return NextResponse.json({ error: "classId and marks[] required" }, { status: 400 });
    }

    // Verify teacher owns the course
    const cls = await prisma.class.findUnique({
      where: { id: body.classId },
      include: { course: true },
    });
    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (session.user.role === "TEACHER" && cls.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upsert each attendance record
    const results = await Promise.all(
      body.marks.map((m) =>
        prisma.attendance.upsert({
          where: { classId_studentId: { classId: body.classId, studentId: m.studentId } },
          create: { classId: body.classId, studentId: m.studentId, status: m.status },
          update: { status: m.status, markedAt: new Date() },
        })
      )
    );

    return NextResponse.json({ count: results.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save attendance";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
