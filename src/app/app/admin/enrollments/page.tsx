﻿import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import type { WebsiteEnrollment } from "@/lib/enroll-source";
import { EnrollmentsList } from "./enrollments-list";
import { AlertCircle } from "lucide-react";
import { getCachedEnrollments } from "../_caches";

export const revalidate = 600;

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Enrollments" description="Student enrollment requests" />
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

function EnrollmentsShell() {
  const cols = ["Status", "Name", "Email", "Course", "Date"];
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
