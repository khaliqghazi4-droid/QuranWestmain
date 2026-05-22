import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShiftSlots, slotMatchesStudent, type Shift } from "@/lib/shifts";

// GET /api/enrollments/[id]/booking-options
// Returns the course's teachers (with shift), each teacher's 30-min slots
// with status: booked / free / matches-student-availability
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, name: true, timezone: true } },
      course: { select: { id: true, name: true, classDuration: true } },
      availability: { select: { dayOfWeek: true, startTime: true, endTime: true } },
    },
  });
  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // All teachers for this course (primary + co-teachers)
  const [primary, coTeachers] = await Promise.all([
    prisma.course.findUnique({
      where: { id: enrollment.courseId },
      select: { teacher: { select: { id: true, name: true, shift: true, country: true } } },
    }),
    prisma.courseTeacher.findMany({
      where: { courseId: enrollment.courseId },
      include: { teacher: { select: { id: true, name: true, shift: true, country: true } } },
    }),
  ]);

  const teacherMap = new Map<
    string,
    { id: string; name: string; shift: Shift | null; country: string | null }
  >();
  if (primary?.teacher) {
    teacherMap.set(primary.teacher.id, {
      id: primary.teacher.id,
      name: primary.teacher.name,
      shift: primary.teacher.shift as Shift | null,
      country: primary.teacher.country,
    });
  }
  for (const ct of coTeachers) {
    teacherMap.set(ct.teacher.id, {
      id: ct.teacher.id,
      name: ct.teacher.name,
      shift: ct.teacher.shift as Shift | null,
      country: ct.teacher.country,
    });
  }

  const teacherIds = Array.from(teacherMap.keys());

  // All bookings for these teachers (to know what's booked)
  const bookings = await prisma.bookingSlot.findMany({
    where: { teacherId: { in: teacherIds } },
    include: {
      enrollment: {
        include: {
          student: { select: { name: true } },
          course: { select: { name: true } },
        },
      },
    },
  });

  const studentTz = enrollment.student.timezone ?? "Asia/Karachi";
  const studentWindows = enrollment.availability;

  const teachers = Array.from(teacherMap.values()).map((t) => {
    const slotTimes = t.shift ? generateShiftSlots(t.shift) : [];
    // For each weekday (0-6) x slot time, build slot status
    const days = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const slots = slotTimes.map((time) => {
        const booking = bookings.find(
          (b) => b.teacherId === t.id && b.dayOfWeek === day && b.startTime === time
        );
        const matches =
          studentWindows.length > 0 &&
          slotMatchesStudent(day, time, studentWindows, studentTz);
        return {
          time,
          booked: !!booking,
          bookedBy: booking
            ? {
                student: booking.enrollment.student.name,
                course: booking.enrollment.course.name,
                isThisStudent: booking.enrollmentId === enrollment.id,
              }
            : null,
          matchesStudent: matches,
        };
      });
      return { day, slots };
    });
    return { ...t, days };
  });

  // This student's existing bookings for this enrollment
  const myBookings = bookings
    .filter((b) => b.enrollmentId === enrollment.id)
    .map((b) => ({
      id: b.id,
      teacherId: b.teacherId,
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
    }));

  return NextResponse.json({
    enrollment: {
      id: enrollment.id,
      studentName: enrollment.student.name,
      studentTimezone: studentTz,
      courseName: enrollment.course.name,
      classDuration: enrollment.course.classDuration,
      hasAvailability: studentWindows.length > 0,
    },
    teachers,
    myBookings,
  });
}
