import { prisma } from "@/lib/prisma";
import { CoursesManager } from "./courses-manager";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const [courses, teachers] = await Promise.all([
    prisma.course.findMany({
      include: {
        teacher: { select: { id: true, name: true } },
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

  return <CoursesManager initialCourses={courses} teachers={teachers} />;
}
