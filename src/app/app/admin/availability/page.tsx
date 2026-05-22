import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { SchedulingBoard } from "./scheduling-board";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { select: { id: true, name: true, email: true, country: true, timezone: true } },
      course: { select: { id: true, name: true, level: true, classDuration: true } },
      teacher: { select: { id: true, name: true } },
      availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      bookings: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: { teacher: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ student: { name: "asc" } }, { startedAt: "desc" }],
  });

  const data = enrollments.map((e) => ({
    id: e.id,
    student: {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      country: e.student.country,
      timezone: e.student.timezone ?? "UTC",
    },
    course: {
      id: e.course.id,
      name: e.course.name,
      level: e.course.level,
      classDuration: e.course.classDuration,
    },
    teacherName: e.teacher?.name ?? null,
    availability: e.availability.map((a) => ({
      id: a.id,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
    bookings: e.bookings.map((b) => ({
      id: b.id,
      teacherId: b.teacherId,
      teacherName: b.teacher.name,
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
    })),
  }));

  const totalBooked = data.reduce((sum, e) => sum + e.bookings.length, 0);
  const needsAvailability = data.filter((e) => e.availability.length === 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduling & Availability"
        description={`${data.length} enrollments · ${totalBooked} classes booked · ${needsAvailability} awaiting student times`}
      />
      <SchedulingBoard enrollments={data} />
    </div>
  );
}
