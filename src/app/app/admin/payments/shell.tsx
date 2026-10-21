import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard } from "@/components/dashboard/skeleton";
import { StatTilesSkeleton } from "@/components/admin/stat-tiles";

// The page's header, and its placeholder for page.tsx's Suspense and for
// loading.tsx while navigating here

export function PaymentsHeader() {
  return <PageHeader title="Payments" description="Monthly fees due from active enrollments" />;
}

const STATS = ["Monthly fees due", "Paying students", "Average per student", "Enrollments with no fee"];

// Four stat tiles, then the Student fees table beside the Fees by course card
export function PaymentsShell() {
  return (
    <>
      <StatTilesSkeleton labels={STATS} />
      <div className="flex flex-wrap items-start gap-[16px]">
        <SkeletonCard className="min-w-0 flex-[3_1_560px]">
          <div className="flex flex-wrap items-center gap-[12px] border-b border-border px-[16px] py-[14px] sm:px-[20px]">
            <div className="mr-auto">
              <h2 className="text-[15px] font-bold leading-[20px]">Student fees</h2>
              <Bone className="mt-[6px] h-3 w-32" />
            </div>
            <div className="flex w-full flex-wrap items-center gap-[8px] sm:w-auto sm:flex-nowrap">
              <Bone className="h-9 w-36 rounded-full" />
              <Bone className="order-last h-9 w-full rounded-full sm:order-none sm:w-56" />
              <Bone className="ml-auto h-9 w-9 rounded-full sm:ml-0 sm:w-32" />
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
              <Bone className="h-4 w-14" />
            </div>
          ))}
          <div className="px-[20px] py-[12px]">
            <Bone className="h-3 w-40" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="min-w-0 flex-[1_1_280px]">
          <div className="border-b border-border px-[20px] py-[14px]">
            <h2 className="text-[15px] font-bold leading-[20px]">Fees by course</h2>
            <Bone className="mt-[6px] h-3 w-40" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b border-border px-[20px] py-[14px] last:border-b-0">
              <div className="flex justify-between">
                <Bone className="h-3.5 w-28" />
                <Bone className="h-3.5 w-10" />
              </div>
              <Bone className="mt-[10px] h-1.5 w-full rounded-full" />
            </div>
          ))}
        </SkeletonCard>
      </div>
    </>
  );
}
