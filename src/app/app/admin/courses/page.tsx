import { prisma } from "@/lib/prisma";
import { CoursesManager } from "./courses-manager";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
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

  return (
    <CoursesManager
      initialCourses={courses.map((c) => {
        // Build teachers list with student counts
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
