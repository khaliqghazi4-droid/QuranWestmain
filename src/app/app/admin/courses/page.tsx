﻿import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CoursesManager } from "./courses-manager";
import { MOCK_COURSES_LIST, MOCK_COURSES_TEACHERS } from "../_mock-data";
import { CoursesShell } from "./shell";

const getCachedCoursesData = unstable_cache(
  async () => {
    const [courses, teachers] = await Promise.all([
      prisma.course.findMany({
        include: {
          courseTeachers: {
            include: {
              teacher: { select: { id: true, name: true, image: true } },
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
        select: { id: true, name: true, image: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return { courses, teachers };
  },
  ["admin-courses"],
  { revalidate: 600 }
);

// Rendered per request, not at build time (the build has no database);
// the data itself stays cached for 10 minutes by unstable_cache above.
export const dynamic = "force-dynamic";

export default function AdminCoursesPage() {
  return (
    // adm-night: the black-and-gold dark mode (globals.css), page by page
    <div className="adm-night">
      <Suspense fallback={<CoursesShell />}>
        <CoursesData />
      </Suspense>
    </div>
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
          image: ct.teacher.image,
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
