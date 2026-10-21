﻿import { Suspense } from "react";
import type { WebsiteEnrollment } from "@/lib/enroll-source";
import { EnrollmentsList } from "./enrollments-list";
import { AlertCircle } from "lucide-react";
import { getCachedEnrollments } from "../_caches";
import { EnrollmentsHeader, EnrollmentsShell } from "./shell";

// Rendered per request, not at build time (the build has no database);
// the data itself stays cached for 10 minutes by its unstable_cache (../_caches).
export const dynamic = "force-dynamic";

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-6">
      <EnrollmentsHeader />
      <Suspense fallback={<EnrollmentsShell />}>
        <EnrollmentsData />
      </Suspense>
    </div>
  );
}

async function EnrollmentsData() {
  let enrollments: WebsiteEnrollment[] = [];
  let error: string | null = null;

  try {
    enrollments = await getCachedEnrollments();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load enrollment requests";
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Could not load enrollments</p>
          <p className="text-muted-foreground mt-1 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return <EnrollmentsList enrollments={enrollments} />;
}
