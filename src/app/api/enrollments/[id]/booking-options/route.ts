import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateShiftSlots,
  slotInWindows,
  slotMatchesStudent,
  type AvailWindow,
  type Shift,
} from "@/lib/shifts";

// Every half-hour start time of a day, "00:00" ... "23:30"
const DAY_SLOTS = Array.from({ length: 48 }, (_, i) =>
  `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`
);

// GET /api/enrollments/[id]/booking-options
// Returns the course's teachers, each teacher's 30-min slots (from their own
// available hours, else their shift) with status: available / booked /
// matches-student-availability
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
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
  const teacherSelect = {
    id: true,
    name: true,
    shift: true,
    country: true,
    timezone: true,
    availability: { select: { dayOfWeek: true, startTime: true, endTime: true } },
  } as const;
  const [primary, coTeachers] = await Promise.all([
    prisma.course.findUnique({
      where: { id: enrollment.courseId },
      select: { teacher: { select: teacherSelect } },
    }),
    prisma.courseTeacher.findMany({
      where: { courseId: enrollment.courseId },
      include: { teacher: { select: teacherSelect } },
    }),
  ]);

  const teacherMap = new Map<
    string,
    {
      id: string;
      name: string;
      shift: Shift | null;
      country: string | null;
      timezone: string;
      windows: AvailWindow[];
    }
  >();
  for (const t of [primary?.teacher, ...coTeachers.map((ct) => ct.teacher)]) {
    if (!t) continue;
    teacherMap.set(t.id, {
      id: t.id,
      name: t.name,
      shift: t.shift as Shift | null,
      country: t.country,
      // Same default the Teachers page availability editor uses
      timezone: t.timezone ?? "UTC",
      windows: t.availability,
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

  const teachers = Array.from(teacherMap.values()).map(({ windows, ...t }) => {
    // The teacher's own available hours win; without them fall back to the shift
    const source: "availability" | "shift" | "none" =
      windows.length > 0 ? "availability" : t.shift ? "shift" : "none";
    const shiftSlots = source === "shift" && t.shift ? generateShiftSlots(t.shift) : [];
    const isAvailable = (day: number, time: string) =>
      source === "availability"
        ? slotInWindows(day, time, windows, t.timezone)
        : shiftSlots.includes(time);

    // Rows: every time available on some day, plus already-booked times so
    // existing bookings stay visible
    const bookedTimes = bookings.filter((b) => b.teacherId === t.id).map((b) => b.startTime);
    const baseTimes =
      source === "availability"
        ? DAY_SLOTS.filter((time) => [0, 1, 2, 3, 4, 5, 6].some((d) => isAvailable(d, time)))
        : shiftSlots;
    const extraTimes = bookedTimes.filter((time) => !baseTimes.includes(time));
    const slotTimes = [...baseTimes, ...Array.from(new Set(extraTimes)).sort()];
    if (source === "availability") slotTimes.sort();

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
          available: isAvailable(day, time),
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
    return { ...t, source, days };
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
