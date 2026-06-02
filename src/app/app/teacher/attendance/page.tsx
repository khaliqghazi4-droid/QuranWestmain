import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { AttendanceBoard, type AttendanceRow } from "./attendance-board";
import { StudentHistoryView, type StudentHistoryRow } from "./student-history";

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
  searchParams: { date?: string; student?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;

  // Load the teacher's full student roster (unique across bookings)
  const allBookings = await prisma.bookingSlot.findMany({
    where: { teacherId },
    include: {
      enrollment: {
        include: {
          student: { select: { id: true, name: true } },
          course: { select: { id: true, name: true } },
        },
      },
    },
  });
  const studentMap = new Map<string, { id: string; name: string }>();
  for (const b of allBookings) {
    studentMap.set(b.enrollment.student.id, {
      id: b.enrollment.student.id,
      name: b.enrollment.student.name,
    });
  }
  const allStudents = Array.from(studentMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // --- View 2: Student history (when ?student=<id>) ---
  const studentId = searchParams.student;
  if (studentId && studentMap.has(studentId)) {
    const studentBookings = allBookings.filter(
      (b) => b.enrollment.student.id === studentId
    );
    const bookingIds = studentBookings.map((b) => b.id);
    const records = bookingIds.length
      ? await prisma.bookingAttendance.findMany({
          where: { bookingSlotId: { in: bookingIds } },
          orderBy: { date: "desc" },
        })
      : [];
    const bById = new Map(studentBookings.map((b) => [b.id, b]));
    const historyRows: StudentHistoryRow[] = records.map((r) => {
      const b = bById.get(r.bookingSlotId)!;
      return {
        id: r.id,
        date: r.date.toISOString(),
        startTime: b.startTime,
        courseName: b.enrollment.course.name,
        status: r.status,
        markedAt: r.markedAt.toISOString(),
      };
    });

    return (
      <div className="space-y-6">
        <PageHeader
          title="Attendance"
          description={`Full attendance history for ${studentMap.get(studentId)!.name}`}
        />
        <StudentHistoryView
          students={allStudents}
          selectedStudentId={studentId}
          studentName={studentMap.get(studentId)!.name}
          rows={historyRows}
        />
      </div>
    );
  }

  // --- View 1: Daily mark view ---
  const dateStr =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : todayPktYmd();
  const dateUtcMidnight = new Date(`${dateStr}T00:00:00.000Z`);
  const dow = pktDayParts(dateUtcMidnight).dayOfWeek;

  const dayBookings = await prisma.bookingSlot.findMany({
    where: { teacherId, dayOfWeek: dow },
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

  const rows: AttendanceRow[] = dayBookings.map((b) => ({
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
        description="Mark Present / Absent / Late, or pick a student to see their full history"
      />
      <AttendanceBoard date={dateStr} rows={rows} students={allStudents} />
    </div>
  );
}
