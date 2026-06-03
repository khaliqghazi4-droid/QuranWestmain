import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { bookingTiming } from "@/lib/shifts";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import {
  ClassesFilterableList,
  type FilterableClass,
} from "@/components/teacher/classes-filterable-list";

export const revalidate = 30;

type TrialItem = {
  id: string;
  student: string;
  courseName: string;
  trialTime: string;
  classHref: string;
};

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;

  const [bookings, myAssignments] = await Promise.all([
    prisma.bookingSlot.findMany({
      where: { teacherId },
      include: {
        enrollment: {
          include: {
            student: { select: { name: true, country: true } },
            course: { select: { id: true, name: true, slug: true, level: true } },
          },
        },
      },
    }),
    prisma.trialAssignment.findMany({
      where: {
        teacherId,
        trialTime: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      },
      orderBy: { trialTime: "asc" },
    }),
  ]);

  // Resolve trial sessions the admin has explicitly assigned to this teacher
  let trials: TrialItem[] = [];
  if (myAssignments.length > 0) {
    try {
      const enrollments = await getWebsiteEnrollments();
      const enrollById = new Map(enrollments.map((e) => [e.id, e]));
      trials = myAssignments
        .map((a) => {
          const e = enrollById.get(a.mongoEnrollmentId);
          if (!e) return null;
          return {
            id: a.id,
            student: e.fullName,
            courseName: e.course,
            trialTime: a.trialTime.toISOString(),
            classHref: `/app/teacher/class/trial-${a.id}`,
          };
        })
        .filter((x): x is TrialItem => x !== null);
    } catch {
      trials = [];
    }
  }

  // Compute next occurrence for each booking and sort soonest-first.
  const classes = bookings
    .map((b) => {
      const timing = bookingTiming(b.dayOfWeek, b.startTime, b.duration);
      return {
        id: b.id,
        dayOfWeek: b.dayOfWeek,
        startTime: b.startTime,
        duration: b.duration,
        student: b.enrollment.student.name,
        country: b.enrollment.student.country,
        courseName: b.enrollment.course.name,
        level: b.enrollment.course.level,
        classHref: `/app/teacher/class/booking-${b.id}`,
        ...timing,
      };
    })
    .sort((a, b) => a.startUTC - b.startUTC);

  const liveNow = classes.filter((c) => c.isLive);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="Classes the admin has booked into your schedule"
      />

      {/* Free trial sessions */}
      {trials.length > 0 && (
        <div className="rounded-2xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.06)] p-6">
          <h2 className="text-lg font-bold mb-1 inline-flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-[hsl(var(--gold))]" /> Free Trial Sessions
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Trial classes for your courses, requested from the website. Click Start Class at the
            scheduled time.
          </p>
          <div className="space-y-3">
            {trials.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-amber-500 text-white shadow-md shrink-0">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> {t.student}
                    <span className="rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--gold))]">
                      TRIAL
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {t.courseName}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t.trialTime
                      ? new Date(t.trialTime).toLocaleString("en-US", {
                          timeZone: "Asia/Karachi",
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }) + " PKT"
                      : "Time not set"}
                  </p>
                </div>
                <Link
                  href={t.classHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-amber-500 px-5 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all shrink-0"
                >
                  <Video className="h-4 w-4" /> Start Class
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All booked classes — client-side filterable (search + day chips) */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold inline-flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> My Classes
          </h2>
          <span className="text-xs text-muted-foreground">
            {classes.length} weekly {classes.length === 1 ? "class" : "classes"} · all times PKT
          </span>
        </div>

        <ClassesFilterableList classes={classes as FilterableClass[]} />
      </div>
    </div>
  );
}
