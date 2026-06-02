import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingTiming, SLOT_MINUTES } from "@/lib/shifts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type NextClass = {
  id: string;
  type: "booking" | "trial";
  studentName: string;
  courseName: string;
  startUTC: number;
  durationMin: number;
  minutesUntil: number;
  classHref: string;
};

// GET /api/teacher/next-class — closest upcoming or live class within next 60 min
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const teacherId = session.user.id;
  const now = Date.now();
  const LOOKAHEAD_MS = 60 * 60 * 1000;

  const [bookings, trialAssignments] = await Promise.all([
    prisma.bookingSlot.findMany({
      where: { teacherId },
      include: {
        enrollment: {
          include: {
            student: { select: { name: true } },
            course: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.trialAssignment.findMany({
      where: {
        teacherId,
        trialTime: { gte: new Date(now - SLOT_MINUTES * 60_000), lte: new Date(now + LOOKAHEAD_MS) },
      },
    }),
  ]);

  const items: NextClass[] = [];

  for (const b of bookings) {
    const t = bookingTiming(b.dayOfWeek, b.startTime, b.duration, now);
    // We care about classes happening or starting soon (within next hour)
    const minsUntil = Math.round((t.startUTC - now) / 60_000);
    if (minsUntil > 60) continue;
    if (minsUntil < -b.duration) continue; // already ended
    items.push({
      id: `booking-${b.id}`,
      type: "booking",
      studentName: b.enrollment.student.name,
      courseName: b.enrollment.course.name,
      startUTC: t.startUTC,
      durationMin: b.duration,
      minutesUntil: minsUntil,
      classHref: `/app/teacher/class/booking-${b.id}`,
    });
  }

  // Trial assignments — we need course + student lookup from MongoDB.
  // For speed we just include the trial assignment metadata; the teacher's
  // Classes page already enriches trial details, so the reminder is fine
  // with bookings as the primary signal. Skip trials here to avoid the
  // (slower) MongoDB roundtrip on every poll.
  for (const a of trialAssignments) {
    const startUTC = a.trialTime.getTime();
    const minsUntil = Math.round((startUTC - now) / 60_000);
    if (minsUntil > 60 || minsUntil < -SLOT_MINUTES) continue;
    items.push({
      id: `trial-${a.id}`,
      type: "trial",
      studentName: "Trial student",
      courseName: "Free trial class",
      startUTC,
      durationMin: SLOT_MINUTES,
      minutesUntil: minsUntil,
      classHref: `/app/teacher/class/trial-${a.id}`,
    });
  }

  // Closest first: prefer the one that is currently live, then nearest upcoming
  items.sort((x, y) => x.startUTC - y.startUTC);
  const next = items[0] ?? null;

  return NextResponse.json({ next });
}
