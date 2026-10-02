import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { LessonsManager } from "./lessons-manager";
import { getCourseLessonsData, getTeacherLessonCourses } from "../_caches";

export const revalidate = 30;

export default async function TeacherLessonsPage({
  searchParams,
}: {
  searchParams: { courseId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const courses = await getTeacherLessonCourses(session.user.id);

  const activeCourseId = searchParams.courseId ?? courses[0]?.id ?? null;

  const { lessons, enrolledStudents } = activeCourseId
    ? await getCourseLessonsData(activeCourseId)
    : { lessons: [], enrolledStudents: [] };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Plans"
        description="Create lessons and assign them to specific students"
      />
      <LessonsManager
        courses={courses}
        activeCourseId={activeCourseId}
        enrolledStudents={enrolledStudents}
        initialLessons={lessons}
      />
    </div>
  );
}
