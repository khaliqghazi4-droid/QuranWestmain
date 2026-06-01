import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import { courseMeetingLink } from "@/lib/meeting";
import { checkTeacherFree } from "@/lib/trial-availability";
import { TrialsList, type TrialSession, type TeacherChoice } from "./trials-list";
import { AlertCircle } from "lucide-react";

export const revalidate = 30;

export default async function AdminTrialsPage() {
  let trials: TrialSession[] = [];
  let error: string | null = null;

  try {
    const [enrollments, courses, allBookings, allAssignments] = await Promise.all([
      getWebsiteEnrollments(),
      prisma.course.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          meetingUrl: true,
          teacher: { select: { id: true, name: true, gender: true, shift: true } },
          courseTeachers: {
            select: {
              teacher: { select: { id: true, name: true, gender: true, shift: true } },
            },
          },
        },
      }),
      prisma.bookingSlot.findMany({
        select: { teacherId: true, dayOfWeek: true, startTime: true, duration: true },
      }),
      prisma.trialAssignment.findMany({
        select: { mongoEnrollmentId: true, teacherId: true, trialTime: true },
      }),
    ]);

    const courseByName = new Map(courses.map((c) => [c.name.trim().toLowerCase(), c]));
    const assignByMongo = new Map(allAssignments.map((a) => [a.mongoEnrollmentId, a]));

    const bookingsByTeacher = new Map<
      string,
      { dayOfWeek: number; startTime: string; duration: number }[]
    >();
    for (const b of allBookings) {
      const arr = bookingsByTeacher.get(b.teacherId) ?? [];
      arr.push({ dayOfWeek: b.dayOfWeek, startTime: b.startTime, duration: b.duration });
      bookingsByTeacher.set(b.teacherId, arr);
    }
    const assignmentsByTeacher = new Map<
      string,
      { trialTime: Date; mongoEnrollmentId: string }[]
    >();
    for (const a of allAssignments) {
      const arr = assignmentsByTeacher.get(a.teacherId) ?? [];
      arr.push({ trialTime: a.trialTime, mongoEnrollmentId: a.mongoEnrollmentId });
      assignmentsByTeacher.set(a.teacherId, arr);
    }

    trials = enrollments.map((e) => {
      const course = courseByName.get(e.course.trim().toLowerCase()) ?? null;

      // Combine primary + co-teachers, deduped
      const teacherMap = new Map<
        string,
        { id: string; name: string; gender: "MALE" | "FEMALE" | null; shift: "DAY" | "NIGHT" | null }
      >();
      if (course?.teacher) {
        teacherMap.set(course.teacher.id, {
          id: course.teacher.id,
          name: course.teacher.name,
          gender: (course.teacher.gender as "MALE" | "FEMALE" | null) ?? null,
          shift: (course.teacher.shift as "DAY" | "NIGHT" | null) ?? null,
        });
      }
      for (const ct of course?.courseTeachers ?? []) {
        teacherMap.set(ct.teacher.id, {
          id: ct.teacher.id,
          name: ct.teacher.name,
          gender: (ct.teacher.gender as "MALE" | "FEMALE" | null) ?? null,
          shift: (ct.teacher.shift as "DAY" | "NIGHT" | null) ?? null,
        });
      }

      const teacherChoices: TeacherChoice[] = Array.from(teacherMap.values()).map((t) => {
        if (!e.trialTime) return { ...t, free: true, reason: null };
        const { free, reason } = checkTeacherFree({
          trialTime: e.trialTime,
          ignoreMongoId: e.id,
          teacherBookings: bookingsByTeacher.get(t.id) ?? [],
          otherAssignments: assignmentsByTeacher.get(t.id) ?? [],
        });
        return { ...t, free, reason };
      });

      const assignment = assignByMongo.get(e.id) ?? null;
      const assignedTeacher = assignment
        ? teacherChoices.find((t) => t.id === assignment.teacherId) ?? null
        : null;

      return {
        id: e.id,
        fullName: e.fullName,
        email: e.email,
        whatsapp: e.whatsapp,
        country: e.country,
        city: e.city,
        courseFor: e.courseFor,
        course: e.course,
        tutorGender: e.tutorGender,
        trialTime: e.trialTime,
        children: e.children,
        createdAt: e.createdAt,
        courseMatched: !!course,
        teacherChoices,
        assignedTeacherId: assignment?.teacherId ?? null,
        assignedTeacherName: assignedTeacher?.name ?? null,
        meetingLink: course ? courseMeetingLink(course) : null,
      };
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load trial sessions";
  }

  const upcoming = trials.filter(
    (t) => t.trialTime && new Date(t.trialTime).getTime() >= Date.now()
  ).length;
  const assigned = trials.filter((t) => t.assignedTeacherId).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Free Trial Sessions"
        description={
          error
            ? "Trial classes requested from the academy website"
            : `${trials.length} trial requests · ${upcoming} upcoming · ${assigned} assigned`
        }
      />

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">Could not reach the website database</p>
            <p className="text-muted-foreground mt-1 text-xs">{error}</p>
          </div>
        </div>
      ) : (
        <TrialsList trials={trials} />
      )}
    </div>
  );
}
