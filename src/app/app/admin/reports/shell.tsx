import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard } from "@/components/dashboard/skeleton";
import { StatTilesSkeleton } from "@/components/admin/stat-tiles";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function ReportsHeader() {
  return <PageHeader title="Student Progress Reports" description="Track student learning outcomes" />;
}

// Four stat tiles, then the Student progress card: toolbar, one row per
// student (avatar and name, courses, attendance, progress bar, Report)
export function ReportsShell() {
  return (
    <div className="space-y-6">
      <StatTilesSkeleton labels={["Students", "Average progress", "Attendance rate", "Courses completed"]} />
      <SkeletonCard>
        <div className="flex flex-wrap items-center gap-[12px] border-b border-border px-[16px] py-[14px] sm:px-[20px]">
          <div className="mr-auto">
            <h2 className="text-[15px] font-bold leading-[20px]">Student progress</h2>
            <Bone className="mt-[6px] h-3 w-44" />
          </div>
          <Bone className="h-9 w-9 rounded-full sm:w-32 lg:order-last" />
          <div className="flex w-full flex-wrap items-center gap-[8px] lg:w-auto lg:flex-nowrap">
            <Bone className="h-9 w-36 rounded-full" />
            <Bone className="h-9 w-32 rounded-full" />
            <Bone className="order-last h-9 w-full rounded-full lg:order-none lg:w-56" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-[16px] border-b border-border px-[20px] py-[14px]">
            <SkeletonAvatar size={36} />
            <div className="min-w-0 flex-1 space-y-[6px]">
              <Bone className="h-3.5 w-32 max-w-full" />
              <Bone className="h-3 w-44 max-w-full" />
            </div>
            <Bone className="hidden h-5 w-28 rounded-full md:block" />
            <Bone className="hidden h-4 w-12 md:block" />
            <div className="hidden w-[140px] space-y-[6px] md:block">
              <Bone className="h-3 w-10" />
              <Bone className="h-1.5 w-full rounded-full" />
            </div>
            <Bone className="h-7 w-20 rounded-full" />
          </div>
        ))}
        <div className="px-[20px] py-[12px]">
          <Bone className="h-3 w-36" />
        </div>
      </SkeletonCard>
    </div>
  );
}
