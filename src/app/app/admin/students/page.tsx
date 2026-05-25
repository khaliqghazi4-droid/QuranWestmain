import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "./students-table";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const prefill =
    str(searchParams.addName) || str(searchParams.addEmail) || str(searchParams.addPhone)
      ? {
          name: str(searchParams.addName) ?? "",
          email: str(searchParams.addEmail) ?? "",
          phone: str(searchParams.addPhone) ?? "",
          country: str(searchParams.addCountry) ?? "",
        }
      : null;

  const [students, allCourses] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        studentEnrollments: {
          include: { course: { select: { id: true, name: true, duration: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
          courses: s.studentEnrollments.map((e) => ({
            id: e.course.id,
            name: e.course.name,
            duration: e.course.duration,
          })),
        }))}
        allCourses={allCourses}
        prefill={prefill}
      />
    </div>
  );
}
