import { PageHeader } from "@/components/dashboard/page-header";
import { SkeletonTable } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function StudentsHeader() {
  return <PageHeader title="Students Management" description="Manage all student accounts" />;
}

// The students card: title, toolbar (Filter, search, Add) and the table
export function StudentsShell() {
  return (
    <SkeletonTable
      title="All students"
      toolbar
      first="person"
      columns={["Student", "Courses", "Country", "Joined", "Actions"]}
    />
  );
}
