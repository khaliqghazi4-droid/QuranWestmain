import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "./students-table";

export const revalidate = 30;

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const [students, courseRows] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        studentEnrollments: {
          include: {
            course: { select: { id: true, name: true, duration: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        teacher: { select: { id: true, name: true, gender: true } },
        courseTeachers: {
          select: {
            teacher: { select: { id: true, name: true, gender: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Flatten course teachers (primary + co-teachers, deduped)
  const allCourses = courseRows.map((c) => {
    const map = new Map<
      string,
      { id: string; name: string; gender: "MALE" | "FEMALE" | null }
    >();
    if (c.teacher) {
      map.set(c.teacher.id, {
        id: c.teacher.id,
        name: c.teacher.name,
        gender: (c.teacher.gender as "MALE" | "FEMALE" | null) ?? null,
      });
    }
    for (const ct of c.courseTeachers) {
      map.set(ct.teacher.id, {
        id: ct.teacher.id,
        name: ct.teacher.name,
        gender: (ct.teacher.gender as "MALE" | "FEMALE" | null) ?? null,
      });
    }
    return { id: c.id, name: c.name, teachers: Array.from(map.values()) };
  });

  // Pre-fill from "Add as Student" link in Enroll Requests
  const addCourseName = str(searchParams.addCourse);
  const matchedCourse = addCourseName
    ? allCourses.find(
        (c) => c.name.trim().toLowerCase() === addCourseName.trim().toLowerCase()
      ) ?? null
    : null;

  const prefill =
    str(searchParams.addName) ||
    str(searchParams.addEmail) ||
    str(searchParams.addPhone) ||
    addCourseName
      ? {
          name: str(searchParams.addName) ?? "",
          email: str(searchParams.addEmail) ?? "",
          phone: str(searchParams.addPhone) ?? "",
          country: str(searchParams.addCountry) ?? "",
          courseId: matchedCourse?.id ?? "",
        }
      : null;

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
          loginPassword: s.loginPassword,
          createdAt: s.createdAt.toISOString(),
          courses: s.studentEnrollments.map((e) => ({
            id: e.course.id,
            name: e.course.name,
            duration: e.course.duration,
            teacherName: e.teacher?.name ?? null,
          })),
        }))}
        allCourses={allCourses}
        prefill={prefill}
      />
    </div>
  );
}
