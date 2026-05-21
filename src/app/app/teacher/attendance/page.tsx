import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ClipboardCheck, Calendar, Video } from "lucide-react";
import { AttendanceForm } from "./attendance-form";

export const dynamic = "force-dynamic";

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: { classId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const classId = searchParams.classId;

  if (classId) {
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: {
          include: {
            enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
          },
        },
        attendance: true,
      },
    });

    if (!cls || cls.course.teacherId !== session.user.id) {
      return (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Class not found or access denied</p>
          <Link href="/app/teacher/attendance" className="mt-4 inline-flex text-sm text-primary font-semibold">
            ← Back
          </Link>
        </div>
      );
    }

    const existingMarks = new Map(cls.attendance.map((a) => [a.studentId, a.status]));
    const roster = cls.course.enrollments.map((e) => ({
      studentId: e.student.id,
      name: e.student.name,
      email: e.student.email,
      currentStatus: existingMarks.get(e.student.id) ?? null,
    }));

    return (
      <div className="space-y-6">
        <Link
          href="/app/teacher/attendance"
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          ← Back to classes
        </Link>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-xl">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-foreground/20 backdrop-blur-md">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{cls.title}</h1>
              <p className="text-sm text-primary-foreground/80 mt-1">{cls.course.name}</p>
              <p className="text-xs text-primary-foreground/70 mt-1 inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {cls.startTime.toLocaleString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                  hour: "numeric", minute: "2-digit", hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>

        <AttendanceForm classId={classId} roster={roster} />
      </div>
    );
  }

  // No classId — show list of classes to mark attendance for
  const classes = await prisma.class.findMany({
    where: { course: { teacherId: session.user.id } },
    include: {
      course: { select: { name: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Select a class to mark attendance"
      />

      {classes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-bold">No classes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule a class first to mark attendance
          </p>
          <Link
            href="/app/teacher/classes"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md"
          >
            Schedule a Class
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {classes.map((c, i) => (
              <Link
                key={c.id}
                href={`/app/teacher/attendance?classId=${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors stagger-item"
                style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0">
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.course.name} ·{" "}
                    {c.startTime.toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
                    })}
                  </p>
                </div>
                {c._count.attendance > 0 ? (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    {c._count.attendance} marked
                  </span>
                ) : (
                  <span className="rounded-full bg-[hsl(var(--gold)/0.1)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--gold))]">
                    Pending
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
