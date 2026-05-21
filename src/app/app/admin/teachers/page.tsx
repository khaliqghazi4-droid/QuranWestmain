import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { TeachersGrid } from "./teachers-grid";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: {
      teacherCourses: {
        include: { _count: { select: { enrollments: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
          courses: t.teacherCourses.map((c) => ({
            name: c.name,
            students: c._count.enrollments,
          })),
        }))}
      />
    </div>
  );
}
