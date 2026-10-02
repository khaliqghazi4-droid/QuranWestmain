﻿import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { TeachersGrid } from "./teachers-grid";
import { MOCK_TEACHERS_GRID, MOCK_TEACHERS_ALL_COURSES } from "../_mock-data";

const getCachedTeachersData = unstable_cache(
  async () => {
    const [teachers, allCourses] = await Promise.all([
      prisma.user.findMany({
        where: { role: "TEACHER" },
        include: {
          teacherCourses: {
            include: { _count: { select: { enrollments: true } } },
          },
          courseTeacherships: {
            include: {
              course: {
                include: { _count: { select: { enrollments: true } } },
              },
            },
          },
          availability: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
          teacherBookings: {
            include: {
              enrollment: {
                include: {
                  student: { select: { name: true } },
                  course: { select: { name: true } },
                },
              },
            },
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          level: true,
          teacherId: true,
          teacher: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);
    return { teachers, allCourses };
  },
  ["admin-teachers"],
  { revalidate: 600 }
);

export const revalidate = 600;

export default function AdminTeachersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Teachers Management" description="Manage all teacher accounts" />
      <Suspense fallback={<TeachersShell />}>
        <TeachersData />
      </Suspense>
    </div>
  );
}

async function TeachersData() {
  const { teachers, allCourses } = await getCachedTeachersData();

  const isMock = teachers.length === 0;

  const mappedTeachers = teachers.map((t) => {
    const courseMap = new Map<string, { id: string; name: string; students: number }>();
    for (const c of t.teacherCourses) {
      courseMap.set(c.id, { id: c.id, name: c.name, students: c._count.enrollments });
    }
    for (const ct of t.courseTeacherships) {
      if (!courseMap.has(ct.course.id)) {
        courseMap.set(ct.course.id, { id: ct.course.id, name: ct.course.name, students: ct.course._count.enrollments });
      }
    }
    return {
      id: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone ?? null,
      loginPassword: t.loginPassword ?? null,
      country: t.country,
      bio: t.bio,
      createdAt: new Date(t.createdAt).toISOString(),
      timezone: t.timezone ?? "UTC",
      shift: t.shift,
      gender: t.gender,
      courses: Array.from(courseMap.values()),
      availability: t.availability.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime })),
      bookings: t.teacherBookings.map((b) => ({ id: b.id, dayOfWeek: b.dayOfWeek, startTime: b.startTime, student: b.enrollment.student.name, course: b.enrollment.course.name })),
    };
  });

  const displayTeachers = isMock
    ? MOCK_TEACHERS_GRID.map((t) => ({ ...t, phone: null, loginPassword: null }))
    : mappedTeachers;
  const displayCourses = isMock
    ? MOCK_TEACHERS_ALL_COURSES
    : allCourses.map((c) => ({ id: c.id, name: c.name, level: c.level, assignedTeacherId: c.teacherId, assignedTeacherName: c.teacher?.name ?? null }));

  return (
    <>
      {isMock && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          Showing sample data · Add your first teacher and this banner will disappear automatically
        </div>
      )}
      <TeachersGrid initialTeachers={displayTeachers} allCourses={displayCourses} />
    </>
  );
}

function TeachersShell() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted/30 border border-border" />
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium text-muted-foreground/40">—</div>
              <div className="text-xs text-muted-foreground/30">—</div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground/40">— courses</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground/40">— students</span>
          </div>
        </div>
      ))}
    </div>
  );
}
