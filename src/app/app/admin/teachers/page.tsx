import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { TeachersGrid } from "./teachers-grid";

export const revalidate = 30;

export default async function AdminTeachersPage() {
  const [teachers, allCourses] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER" },
      include: {
        teacherCourses: {
          include: { _count: { select: { enrollments: true } } },
        },
        availability: {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers Management"
        description={`${teachers.length} active teachers in your academy`}
      />
      <TeachersGrid
        initialTeachers={teachers.map((t) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          country: t.country,
          bio: t.bio,
          createdAt: t.createdAt.toISOString(),
          timezone: t.timezone ?? "UTC",
          shift: t.shift,
          gender: t.gender,
          courses: t.teacherCourses.map((c) => ({
            id: c.id,
            name: c.name,
            students: c._count.enrollments,
          })),
          availability: t.availability.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        }))}
        allCourses={allCourses.map((c) => ({
          id: c.id,
          name: c.name,
          level: c.level,
          assignedTeacherId: c.teacherId,
          assignedTeacherName: c.teacher?.name ?? null,
        }))}
      />
    </div>
  );
}
