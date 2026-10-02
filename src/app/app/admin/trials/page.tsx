import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { trialMeetingLink } from "@/lib/meeting";
import { checkTeacherFree } from "@/lib/trial-availability";
import { TrialsList, type TrialSession, type TeacherChoice } from "./trials-list";
import { AlertCircle } from "lucide-react";
import { getCachedTrialsRaw } from "../_caches";

export const revalidate = 600;

export default function AdminTrialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Free Trial Sessions" description="Enrollment requests scheduled for a free trial" />
      <Suspense fallback={<TrialsShell />}>
        <TrialsData />
      </Suspense>
    </div>
  );
}

async function TrialsData() {
  let trials: TrialSession[] = [];
  let error: string | null = null;

  try {
    const { enrollments, courses, allBookings, allAssignments, studentEmails, trialAccounts } =
      await getCachedTrialsRaw();

    const studentEmailSet = new Set(studentEmails);
    const trialAccountByEmail = new Map(trialAccounts.map((a) => [a.email, a]));
    const courseByName = new Map(courses.map((c) => [c.name.trim().toLowerCase(), c]));
    const assignByMongo = new Map(allAssignments.map((a) => [a.mongoEnrollmentId, a]));

    const bookingsByTeacher = new Map<string, { dayOfWeek: number; startTime: string; duration: number }[]>();
    for (const b of allBookings) {
      const arr = bookingsByTeacher.get(b.teacherId) ?? [];
      arr.push({ dayOfWeek: b.dayOfWeek, startTime: b.startTime, duration: b.duration });
      bookingsByTeacher.set(b.teacherId, arr);
    }
    const assignmentsByTeacher = new Map<string, { trialTime: Date; mongoEnrollmentId: string }[]>();
    for (const a of allAssignments) {
      const arr = assignmentsByTeacher.get(a.teacherId) ?? [];
      arr.push({ trialTime: new Date(a.trialTime), mongoEnrollmentId: a.mongoEnrollmentId });
      assignmentsByTeacher.set(a.teacherId, arr);
    }

    trials = enrollments.map((e) => {
      const course = courseByName.get(e.course.trim().toLowerCase()) ?? null;

      const teacherMap = new Map<string, { id: string; name: string; gender: "MALE" | "FEMALE" | null; shift: "DAY" | "NIGHT" | null }>();
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
        meetingLink: trialMeetingLink(e.id),
        isStudent: studentEmailSet.has(e.email.toLowerCase()),
        account: (() => {
          const a = trialAccountByEmail.get(e.email.toLowerCase());
          return a
            ? {
                id: a.id,
                phone: a.phone,
                loginPassword: a.loginPassword,
                accessExpiresAt: a.accessExpiresAt,
                suspendedAt: a.suspendedAt,
              }
            : null;
        })(),
      };
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load trial sessions";
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Could not load trial sessions</p>
          <p className="text-muted-foreground mt-1 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return <TrialsList trials={trials} />;
}

function TrialsShell() {
  const cols = ["Name", "Course", "Trial Time", "Country", "Status"];
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex gap-3 px-4 py-3 border-b border-border bg-muted/20">
        {cols.map((h) => (
          <span key={h} className="text-xs font-medium text-muted-foreground flex-1">{h}</span>
        ))}
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b border-border last:border-0">
          {cols.map((h) => (
            <span key={h} className="text-xs text-muted-foreground/40 flex-1">—</span>
          ))}
        </div>
      ))}
    </div>
  );
}
