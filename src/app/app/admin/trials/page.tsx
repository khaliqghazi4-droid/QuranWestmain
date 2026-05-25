import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import { courseMeetingLink } from "@/lib/meeting";
import { TrialsList, type TrialSession } from "./trials-list";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTrialsPage() {
  let trials: TrialSession[] = [];
  let error: string | null = null;

  try {
    const [enrollments, courses] = await Promise.all([
      getWebsiteEnrollments(),
      prisma.course.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          meetingUrl: true,
          teacher: { select: { id: true, name: true, gender: true } },
        },
      }),
    ]);

    const byName = new Map(courses.map((c) => [c.name.trim().toLowerCase(), c]));

    trials = enrollments.map((e) => {
      const course = byName.get(e.course.trim().toLowerCase()) ?? null;
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
        teacherName: course?.teacher?.name ?? null,
        teacherGender: (course?.teacher?.gender as "MALE" | "FEMALE" | null) ?? null,
        meetingLink: course ? courseMeetingLink(course) : null,
      };
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load trial sessions";
  }

  const upcoming = trials.filter(
    (t) => t.trialTime && new Date(t.trialTime).getTime() >= Date.now()
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Free Trial Sessions"
        description={
          error
            ? "Trial classes requested from the academy website"
            : `${trials.length} trial requests · ${upcoming} upcoming`
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
