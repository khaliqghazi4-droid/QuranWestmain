import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SchedulingBoard } from "./scheduling-board";
import { AvailabilityHeader, AvailabilityShell } from "./shell";

const getCachedAvailability = unstable_cache(
  () => prisma.enrollment.findMany({
    include: {
      student: { select: { id: true, name: true, email: true, country: true, timezone: true, image: true } },
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

// Rendered per request, not at build time (the build has no database);
// the data itself stays cached for 10 minutes by unstable_cache above.
export const dynamic = "force-dynamic";

export default function AdminAvailabilityPage() {
  return (
    // adm-night: the black-and-gold dark mode (globals.css), page by page
    <div className="adm-night space-y-6">
      <AvailabilityHeader />
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
      image: e.student.image ?? null,
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
