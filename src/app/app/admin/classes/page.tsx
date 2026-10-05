import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { AlertCircle } from "lucide-react";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingTiming } from "@/lib/shifts";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import { PageHeader } from "@/components/dashboard/page-header";
import { ClassesBoard, type AdminClass } from "./classes-board";

// Times are relative to "now", so this page is never cached
export const dynamic = "force-dynamic";

// How far ahead the list goes
const WEEKS_AHEAD = 4;
// Trials have no stored length; the class room treats them as 30 minutes
const TRIAL_MINUTES = 30;

// Every upcoming class: weekly bookings expanded into their real dates over
// the next few weeks, plus free trials still in the trial list. Live classes
// (started, not yet over) are included.
async function loadUpcomingClasses(now: number): Promise<AdminClass[]> {
  const until = now + WEEKS_AHEAD * 7 * 24 * 60 * 60_000;

  const [bookings, trials, trialRequests] = await Promise.all([
    prisma.bookingSlot.findMany({
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        duration: true,
        teacher: { select: { name: true } },
        enrollment: {
          select: {
            student: { select: { id: true, name: true } },
            course: { select: { name: true } },
          },
        },
      },
    }),
    prisma.trialAssignment.findMany({
      where: {
        trialTime: { gte: new Date(now - TRIAL_MINUTES * 60_000), lte: new Date(until) },
      },
      select: {
        id: true,
        mongoEnrollmentId: true,
        trialTime: true,
        teacher: { select: { name: true } },
      },
    }),
    // Requests still in Free Trials (not yet added as students)
    getWebsiteEnrollments({ inTrials: true }),
  ]);

  const classes: AdminClass[] = [];

  for (const b of bookings) {
    let cursor = now;
    for (;;) {
      const t = bookingTiming(b.dayOfWeek, b.startTime, b.duration, cursor);
      if (t.startUTC > until) break;
      classes.push({
        key: `booking-${b.id}-${t.startUTC}`,
        roomId: `booking-${b.id}`,
        kind: "booking",
        startUTC: t.startUTC,
        durationMin: b.duration,
        studentKey: b.enrollment.student.id,
        studentName: b.enrollment.student.name,
        courseName: b.enrollment.course.name,
        teacherName: b.teacher.name,
      });
      // Just past this one's end, so the next call returns the following week
      cursor = t.startUTC + b.duration * 60_000 + 60_000;
    }
  }

  const requestById = new Map(trialRequests.map((r) => [r.id, r]));
  for (const a of trials) {
    const request = requestById.get(a.mongoEnrollmentId);
    if (!request) continue;
    classes.push({
      key: `trial-${a.id}`,
      roomId: `trial-${a.id}`,
      kind: "trial",
      startUTC: a.trialTime.getTime(),
      durationMin: TRIAL_MINUTES,
      studentKey: `trial-${request.id}`,
      studentName: request.fullName,
      courseName: request.course,
      teacherName: a.teacher.name,
    });
  }

  return classes.sort((x, y) => x.startUTC - y.startUTC);
}

export default function AdminClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description={`Every upcoming class for the next ${WEEKS_AHEAD} weeks, in Pakistan time (PKT)`}
      />
      <Suspense fallback={<ClassesShell />}>
        <ClassesData />
      </Suspense>
    </div>
  );
}

async function ClassesData() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Admin access required
      </div>
    );
  }

  const now = Date.now();
  try {
    const classes = await loadUpcomingClasses(now);
    return <ClassesBoard classes={classes} generatedAt={now} weeksAhead={WEEKS_AHEAD} />;
  } catch (e) {
    console.error("[admin/classes] load failed", e);
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Couldn&apos;t load classes</p>
          <p className="mt-0.5 text-xs opacity-80">Refresh the page in a moment.</p>
        </div>
      </div>
    );
  }
}

function ClassesShell() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-16 rounded-2xl border border-border bg-card" />
      {[0, 1].map((g) => (
        <div key={g} className="space-y-2">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-40 rounded-2xl border border-border bg-card" />
        </div>
      ))}
    </div>
  );
}
