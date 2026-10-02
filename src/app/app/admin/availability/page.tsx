import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { SchedulingBoard } from "./scheduling-board";

const getCachedAvailability = unstable_cache(
  () => prisma.enrollment.findMany({
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
  }),
  ["admin-availability"],
  { revalidate: 600 }
);

export const revalidate = 600;

export default function AdminAvailabilityPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Scheduling & Availability" description="Manage student schedules and teacher bookings" />
      <Suspense fallback={<AvailabilityShell />}>
        <AvailabilityData />
      </Suspense>
    </div>
  );
}

async function AvailabilityData() {
  const enrollments = await getCachedAvailability();

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

  return <SchedulingBoard enrollments={data} />;
}

function AvailabilityShell() {
  const cols = ["Student", "Course", "Teacher", "Schedule", "Bookings"];
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex gap-3 px-4 py-3 border-b border-border bg-muted/20">
        {cols.map((h) => (
          <span key={h} className="text-xs font-medium text-muted-foreground flex-1">{h}</span>
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b border-border last:border-0">
          {cols.map((h) => (
            <span key={h} className="text-xs text-muted-foreground/40 flex-1">—</span>
          ))}
        </div>
      ))}
    </div>
  );
}
