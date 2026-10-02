import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsManager } from "./students-manager";
import { getTeacherStudents } from "../_caches";

export const revalidate = 30;

export default async function TeacherStudents() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const students = await getTeacherStudents(session.user.id);

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
