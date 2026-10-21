import { prisma } from "@/lib/prisma";
import { bookingTiming } from "@/lib/shifts";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import type { AdminClass } from "./class-format";
import { WEEKS_AHEAD } from "./shell";

// Trials have no stored length; the class room treats them as 30 minutes
const TRIAL_MINUTES = 30;

// Every upcoming class: weekly bookings expanded into their real dates over
// the next few weeks, plus free trials still in the trial list. Live classes
// (started, not yet over) are included. `studentKey` narrows it to one
// student: a user id, or "trial-<request id>" for someone still on a trial.
export async function loadUpcomingClasses(now: number, studentKey?: string): Promise<AdminClass[]> {
  const until = now + WEEKS_AHEAD * 7 * 24 * 60 * 60_000;
  const trialRequestId = studentKey?.startsWith("trial-") ? studentKey.slice("trial-".length) : null;
  const studentId = studentKey && !trialRequestId ? studentKey : null;

  const [bookings, trials, trialRequests] = await Promise.all([
    trialRequestId
      ? []
      : prisma.bookingSlot.findMany({
          where: studentId ? { enrollment: { studentId } } : undefined,
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            duration: true,
            teacher: { select: { name: true } },
            enrollment: {
              select: {
                student: { select: { id: true, name: true, image: true } },
                course: { select: { name: true } },
              },
            },
          },
        }),
    studentId
      ? []
      : prisma.trialAssignment.findMany({
          where: {
            trialTime: { gte: new Date(now - TRIAL_MINUTES * 60_000), lte: new Date(until) },
            ...(trialRequestId ? { mongoEnrollmentId: trialRequestId } : {}),
          },
          select: {
            id: true,
            mongoEnrollmentId: true,
            trialTime: true,
            teacher: { select: { name: true } },
          },
        }),
    // Requests still in Free Trials (not yet added as students)
    studentId ? [] : getWebsiteEnrollments({ inTrials: true }),
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
        studentImage: b.enrollment.student.image,
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
      studentImage: null,
      courseName: request.course,
      teacherName: a.teacher.name,
    });
  }

  return classes.sort((x, y) => x.startUTC - y.startUTC);
}
