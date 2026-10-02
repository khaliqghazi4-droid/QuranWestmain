﻿import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CoursesManager } from "./courses-manager";
import { MOCK_COURSES_LIST, MOCK_COURSES_TEACHERS } from "../_mock-data";

const getCachedCoursesData = unstable_cache(
  async () => {
    const [courses, teachers] = await Promise.all([
      prisma.course.findMany({
        include: {
          courseTeachers: {
            include: {
              teacher: { select: { id: true, name: true } },
            },
          },
          enrollments: {
            select: { id: true, teacherId: true },
          },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return { courses, teachers };
  },
  ["admin-courses"],
  { revalidate: 600 }
);

export const revalidate = 600;

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={<CoursesShell />}>
      <CoursesData />
    </Suspense>
  );
}

async function CoursesData() {
  const { courses, teachers } = await getCachedCoursesData();

  const isMock = courses.length === 0;

  if (isMock) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          Showing sample data · Add your first course and this banner will disappear automatically
        </div>
        <CoursesManager initialCourses={MOCK_COURSES_LIST} teachers={MOCK_COURSES_TEACHERS} />
      </div>
    );
  }

  return (
    <CoursesManager
      initialCourses={courses.map((c) => {
        const teachersList = c.courseTeachers.map((ct) => ({
          id: ct.teacher.id,
          name: ct.teacher.name,
          isPrimary: c.teacherId === ct.teacher.id,
          studentsCount: c.enrollments.filter((e) => e.teacherId === ct.teacher.id).length,
        }));
        return {
          id: c.id,
          name: c.name,
          description: c.description,
          level: c.level,
          duration: c.duration,
          classDuration: c.classDuration,
          price: c.price,
          image: c.image,
          isActive: c.isActive,
          teacherId: c.teacherId,
          teachers: teachersList,
          totalEnrollments: c._count.enrollments,
        };
      })}
      teachers={teachers}
    />
  );
}

function CoursesShell() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-32 bg-muted/20 border-b border-border" />
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium text-muted-foreground/40">—</div>
            <div className="text-xs text-muted-foreground/30">—</div>
            <div className="flex gap-2 pt-1">
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground/40">— students</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground/40">—</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
