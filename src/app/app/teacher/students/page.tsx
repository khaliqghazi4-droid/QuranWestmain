import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsManager } from "./students-manager";

export const dynamic = "force-dynamic";

export default async function TeacherStudents() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: session.user.id } },
    include: {
      student: {
        select: { id: true, name: true, email: true, country: true, createdAt: true },
      },
      course: { select: { id: true, name: true, level: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  // Deduplicate students (one student may be in multiple of teacher's courses)
  const studentMap = new Map<string, {
    student: typeof enrollments[number]["student"];
    enrollments: { id: string; courseName: string; level: string; progress: number }[];
  }>();

  for (const e of enrollments) {
    const sid = e.student.id;
    const existing = studentMap.get(sid);
    const enrollEntry = {
      id: e.id,
      courseName: e.course.name,
      level: e.course.level,
      progress: e.progress,
    };
    if (existing) {
      existing.enrollments.push(enrollEntry);
    } else {
      studentMap.set(sid, { student: e.student, enrollments: [enrollEntry] });
    }
  }

  const students = Array.from(studentMap.values()).map((v) => ({
    id: v.student.id,
    name: v.student.name,
    email: v.student.email,
    country: v.student.country,
    createdAt: v.student.createdAt.toISOString(),
    enrollments: v.enrollments,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        description={`${students.length} ${students.length === 1 ? "student" : "students"} enrolled in your courses`}
      />
      <StudentsManager initialStudents={students} />
    </div>
  );
}
