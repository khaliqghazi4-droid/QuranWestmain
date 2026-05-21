import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ClassesManager } from "./classes-manager";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [classes, courses] = await Promise.all([
    prisma.class.findMany({
      where: { course: { teacherId: session.user.id } },
      include: {
        course: { select: { id: true, name: true, level: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.course.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Schedule"
        description="Schedule and manage your live classes"
      />
      <ClassesManager
        initialClasses={classes.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          startTime: c.startTime.toISOString(),
          duration: c.duration,
          meetingUrl: c.meetingUrl,
          course: c.course,
          attendanceCount: c._count.attendance,
        }))}
        courses={courses}
      />
    </div>
  );
}
