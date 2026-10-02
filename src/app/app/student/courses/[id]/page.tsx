import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getStudentViewer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen, Clock, GraduationCap, User } from "lucide-react";
import { LessonsList } from "./lessons-list";

export const dynamic = "force-dynamic";

export default async function StudentCourseDetail({
  params,
}: {
  params: { id: string };
}) {
  const viewer = await getStudentViewer();
  if (!viewer) return null;

  const [enrollment, lessons] = await Promise.all([
    prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: viewer.id, courseId: params.id },
      },
      include: {
        course: {
          include: {
            teacher: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.lesson.findMany({
      where: { courseId: params.id, isPublished: true },
      orderBy: { order: "asc" },
      include: {
        completions: {
          where: { studentId: viewer.id },
          select: { id: true },
        },
      },
    }),
  ]);

  if (!enrollment) notFound();

  const course = enrollment.course;
  const totalDuration = lessons.reduce((s, l) => s + (l.duration ?? 0), 0);

  return (
    <div className="space-y-6">
      <Link
        href="/app/student/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Courses
      </Link>

      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr]">
          {course.image && (
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
              <Image
                src={course.image}
                alt={course.name}
                fill
                sizes="(min-width: 768px) 300px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              {course.level}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{course.name}</h1>
            {course.description && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {course.teacher && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {course.teacher.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {lessons.length} lessons
              </span>
              {totalDuration > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {totalDuration} min
                </span>
              )}
              {course.duration && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> {course.duration}
                </span>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-muted-foreground">Your Progress</span>
                <span className="font-bold">{enrollment.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <LessonsList
        lessons={lessons.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          content: l.content,
          videoUrl: l.videoUrl,
          audioUrl: l.audioUrl,
          fileUrl: l.fileUrl,
          duration: l.duration,
          order: l.order,
          completed: l.completions.length > 0,
        }))}
      />
    </div>
  );
}
