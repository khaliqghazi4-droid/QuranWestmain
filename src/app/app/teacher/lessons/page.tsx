import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { LessonsManager } from "./lessons-manager";

export const revalidate = 30;

export default async function TeacherLessonsPage({
  searchParams,
}: {
  searchParams: { courseId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true, level: true, _count: { select: { lessons: true } } },
    orderBy: { name: "asc" },
  });

  const activeCourseId = searchParams.courseId ?? courses[0]?.id ?? null;

  const [lessons, enrolled] = await Promise.all([
    activeCourseId
      ? prisma.lesson.findMany({
          where: { courseId: activeCourseId },
          orderBy: { order: "asc" },
          include: {
            _count: { select: { completions: true } },
            assignments: {
              include: { student: { select: { id: true, name: true } } },
            },
          },
        })
      : Promise.resolve([]),
    activeCourseId
      ? prisma.enrollment.findMany({
          where: { courseId: activeCourseId },
          include: { student: { select: { id: true, name: true, email: true } } },
          orderBy: { startedAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Plans"
        description="Create lessons and assign them to specific students"
      />
      <LessonsManager
        courses={courses.map((c) => ({
          id: c.id,
          name: c.name,
          level: c.level,
          lessonCount: c._count.lessons,
        }))}
        activeCourseId={activeCourseId}
        enrolledStudents={enrolled.map((e) => ({
          id: e.student.id,
          name: e.student.name,
          email: e.student.email,
        }))}
        initialLessons={lessons.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          content: l.content,
          videoUrl: l.videoUrl,
          audioUrl: l.audioUrl,
          fileUrl: l.fileUrl,
          duration: l.duration,
          order: l.order,
          isPublished: l.isPublished,
          completionsCount: l._count.completions,
          assignedTo: l.assignments.map((a) => ({
            id: a.student.id,
            name: a.student.name,
          })),
        }))}
      />
    </div>
  );
}
