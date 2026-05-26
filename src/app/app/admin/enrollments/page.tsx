import { PageHeader } from "@/components/dashboard/page-header";
import { getWebsiteEnrollments, type WebsiteEnrollment } from "@/lib/enroll-source";
import { EnrollmentsList } from "./enrollments-list";
import { AlertCircle } from "lucide-react";

export const revalidate = 30;

export default async function AdminEnrollmentsPage() {
  let enrollments: WebsiteEnrollment[] = [];
  let error: string | null = null;

  try {
    enrollments = await getWebsiteEnrollments();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load enrollment requests";
  }

  const adults = enrollments.filter((e) => e.courseFor === "adult").length;
  const kids = enrollments.filter((e) => e.courseFor === "kid").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Requests"
        description={
          error
            ? "Requests submitted from the academy website"
            : `${enrollments.length} total · ${adults} adult · ${kids} kids`
        }
      />

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">Could not reach the website database</p>
            <p className="text-muted-foreground mt-1 text-xs">{error}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              Make sure <span className="font-mono font-semibold">ENROLL_MONGO_URI</span> is set in
              the environment (Vercel → Settings → Environment Variables).
            </p>
          </div>
        </div>
      ) : (
        <EnrollmentsList enrollments={enrollments} />
      )}
    </div>
  );
}
