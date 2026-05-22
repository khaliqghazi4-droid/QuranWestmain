import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/bookings - admin assigns a student (enrollment) to a teacher slot
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { enrollmentId, teacherId, dayOfWeek, startTime } = (await req.json()) as {
      enrollmentId?: string;
      teacherId?: string;
      dayOfWeek?: number;
      startTime?: string;
    };

    if (!enrollmentId || !teacherId || dayOfWeek === undefined || !startTime) {
      return NextResponse.json(
        { error: "enrollmentId, teacherId, dayOfWeek, startTime required" },
        { status: 400 }
      );
    }

    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { id: true } } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Verify teacher teaches this course
    const teaches = await prisma.courseTeacher.findFirst({
      where: { courseId: enrollment.courseId, teacherId },
    });
    const isPrimary = enrollment.course.id && (await prisma.course.findFirst({
      where: { id: enrollment.courseId, teacherId },
    }));
    if (!teaches && !isPrimary) {
      return NextResponse.json(
        { error: "This teacher does not teach this course" },
        { status: 400 }
      );
    }

    // Check teacher not already booked at this slot
    const conflict = await prisma.bookingSlot.findUnique({
      where: { teacherId_dayOfWeek_startTime: { teacherId, dayOfWeek, startTime } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Teacher is already booked at this time" }, { status: 409 });
    }

    const booking = await prisma.bookingSlot.create({
      data: { enrollmentId, teacherId, dayOfWeek, startTime },
    });

    // Also set this teacher as the enrollment's teacher (if not set)
    if (!enrollment.teacherId) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { teacherId },
      });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
