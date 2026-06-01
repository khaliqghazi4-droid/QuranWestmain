import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Normalize a date string (YYYY-MM-DD) to UTC midnight Date
function dayMidnightUTC(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  return new Date(`${dateStr}T00:00:00.000Z`);
}

// POST /api/booking-attendance — teacher marks attendance for a booking on a date
// body: { bookingSlotId, date: "YYYY-MM-DD", status: "PRESENT" | "ABSENT" | "LATE" }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingSlotId, date, status } = (await req.json()) as {
      bookingSlotId?: string;
      date?: string;
      status?: "PRESENT" | "ABSENT" | "LATE";
    };

    if (!bookingSlotId || !date || !status) {
      return NextResponse.json(
        { error: "bookingSlotId, date and status are required" },
        { status: 400 }
      );
    }
    if (!["PRESENT", "ABSENT", "LATE"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const dateUTC = dayMidnightUTC(date);
    if (!dateUTC) {
      return NextResponse.json({ error: "Invalid date (use YYYY-MM-DD)" }, { status: 400 });
    }

    const booking = await prisma.bookingSlot.findUnique({
      where: { id: bookingSlotId },
      include: { enrollment: { select: { studentId: true } } },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (session.user.role === "TEACHER" && booking.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your booking" }, { status: 403 });
    }

    const record = await prisma.bookingAttendance.upsert({
      where: { bookingSlotId_date: { bookingSlotId, date: dateUTC } },
      update: { status, markedAt: new Date() },
      create: {
        bookingSlotId,
        date: dateUTC,
        studentId: booking.enrollment.studentId,
        status,
      },
    });

    revalidatePath("/app/teacher/attendance");
    return NextResponse.json({ attendance: record }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/booking-attendance?bookingSlotId=...&date=YYYY-MM-DD — unmark
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const bookingSlotId = searchParams.get("bookingSlotId");
  const date = searchParams.get("date");
  if (!bookingSlotId || !date) {
    return NextResponse.json({ error: "bookingSlotId and date required" }, { status: 400 });
  }
  const dateUTC = dayMidnightUTC(date);
  if (!dateUTC) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // Teacher can only delete on their own bookings
  if (session.user.role === "TEACHER") {
    const booking = await prisma.bookingSlot.findUnique({
      where: { id: bookingSlotId },
      select: { teacherId: true },
    });
    if (!booking || booking.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your booking" }, { status: 403 });
    }
  }

  await prisma.bookingAttendance.deleteMany({
    where: { bookingSlotId, date: dateUTC },
  });
  revalidatePath("/app/teacher/attendance");
  return NextResponse.json({ ok: true });
}
