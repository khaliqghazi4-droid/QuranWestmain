import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { AttendanceBoard, type AttendanceRow } from "./attendance-board";

export const dynamic = "force-dynamic";

// PKT (Asia/Karachi, fixed UTC+5) calendar day for a UTC instant.
function pktDayParts(d: Date) {
  const shifted = new Date(d.getTime() + 5 * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

function todayPktYmd(): string {
  const p = pktDayParts(new Date());
  return `${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const dateStr = searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
    ? searchParams.date
    : todayPktYmd();

  // dayOfWeek for the requested PKT date
  const dateUtcMidnight = new Date(`${dateStr}T00:00:00.000Z`);
  const dow = pktDayParts(dateUtcMidnight).dayOfWeek;

  // Teacher's recurring bookings on that day-of-week
  const bookings = await prisma.bookingSlot.findMany({
    where: { teacherId: session.user.id, dayOfWeek: dow },
    include: {
      enrollment: {
        include: {
          student: { select: { id: true, name: true } },
          course: { select: { id: true, name: true } },
        },
      },
      attendance: { where: { date: dateUtcMidnight } },
    },
    orderBy: { startTime: "asc" },
  });

  const rows: AttendanceRow[] = bookings.map((b) => ({
    bookingSlotId: b.id,
    studentId: b.enrollment.student.id,
    studentName: b.enrollment.student.name,
    courseName: b.enrollment.course.name,
    startTime: b.startTime,
    status: b.attendance[0]?.status ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark Present / Absent / Late for each booked class"
      />
      <AttendanceBoard date={dateStr} rows={rows} />
    </div>
  );
}
