import { PageHeader } from "@/components/dashboard/page-header";
import { SkeletonTable, SkeletonToolbar } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function EnrollmentsHeader() {
  return <PageHeader title="Enrollments" description="Student enrollment requests" />;
}

// The toolbar, then the requests table with its real columns
export function EnrollmentsShell() {
  return (
    <div className="space-y-4">
      <SkeletonToolbar />
      <SkeletonTable
        first="person"
        columns={["Applicant", "For", "Course", "Tutor", "Contact", "Location", "Trial Time", "Submitted", "Actions"]}
      />
    </div>
  );
}
