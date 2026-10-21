import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { AlertCircle } from "lucide-react";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassesBoard } from "../classes-board";
import { loadUpcomingClasses } from "../load-classes";
import { WEEKS_AHEAD } from "../shell";
import { BackToClasses, StudentClassesShell } from "./shell";
import { StudentCard } from "./student-card";

// Times are relative to "now", so this page is never cached
export const dynamic = "force-dynamic";

// One student's classes, opened from their card on the Classes page. The id
// is the student's user id, or "trial-<request id>" for someone still on a
// free trial.
export default function StudentClassesPage({ params }: { params: { student: string } }) {
  return (
    <div className="space-y-6">
      <BackToClasses />
      <Suspense fallback={<StudentClassesShell />}>
        <StudentClassesData studentKey={params.student} />
      </Suspense>
    </div>
  );
}

// Name, contact and photo: from the account, or from the trial request
async function findStudent(studentKey: string) {
  if (studentKey.startsWith("trial-")) {
    const request = await prisma.enrollmentRequest.findUnique({
      where: { id: studentKey.slice("trial-".length) },
      select: { fullName: true, email: true, country: true },
    });
    return request && { name: request.fullName, email: request.email, country: request.country, image: null, trial: true };
  }
  const user = await prisma.user.findUnique({
    where: { id: studentKey },
    select: { name: true, email: true, country: true, image: true, role: true },
  });
  return user?.role === "STUDENT" ? { ...user, trial: false } : null;
}

async function StudentClassesData({ studentKey }: { studentKey: string }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Admin access required
      </div>
    );
  }

  const now = Date.now();
  let student: Awaited<ReturnType<typeof findStudent>>;
  let classes: Awaited<ReturnType<typeof loadUpcomingClasses>>;
  try {
    [student, classes] = await Promise.all([findStudent(studentKey), loadUpcomingClasses(now, studentKey)]);
  } catch (e) {
    console.error("[admin/classes/student] load failed", e);
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Couldn&apos;t load this student&apos;s classes</p>
          <p className="mt-0.5 text-xs opacity-80">Refresh the page in a moment.</p>
        </div>
      </div>
    );
  }
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <StudentCard studentKey={studentKey} student={student} classes={classes} />

      <ClassesBoard classes={classes} generatedAt={now} weeksAhead={WEEKS_AHEAD} oneStudent />
    </div>
  );
}
