import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { BookOpen, Filter } from "lucide-react";
import { CoursesList } from "./courses-list";

export const dynamic = "force-dynamic";

export default async function StudentCourses() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        include: { teacher: { select: { id: true, name: true } } },
      },
      availability: {
        select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description={
          enrollments.length === 0
            ? "Browse the catalog and enroll in your first course"
            : `${enrollments.length} enrolled · Set your available times for each course`
        }
        action={
          <Link
            href="/app/student/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md"
          >
            <Filter className="h-4 w-4" /> Browse Catalog
          </Link>
        }
      />

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore our course catalog and enroll to start learning
          </p>
          <Link
            href="/app/student/catalog"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <CoursesList
          userTimezone={me?.timezone ?? "UTC"}
          enrollments={enrollments.map((e) => ({
            id: e.id,
            progress: e.progress,
            course: {
              id: e.course.id,
              name: e.course.name,
              image: e.course.image,
              level: e.course.level,
              duration: e.course.duration,
              classDuration: e.course.classDuration,
              teacherName: e.course.teacher?.name ?? null,
            },
            availability: e.availability,
          }))}
        />
      )}
    </div>
  );
}
