import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "./students-table";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentEnrollments: {
        include: { course: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students Management"
        description={`${students.length} total students · Manage all student accounts`}
      />
      <StudentsTable
        initialStudents={students.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          country: s.country,
          createdAt: s.createdAt.toISOString(),
          courses: s.studentEnrollments.map((e) => e.course.name),
        }))}
      />
    </div>
  );
}
