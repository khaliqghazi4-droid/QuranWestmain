import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard, SkeletonToolbar } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function AvailabilityHeader() {
  return <PageHeader title="Scheduling & Availability" description="Manage student schedules and teacher bookings" />;
}

// Toolbar, then two columns of enrollment cards: student with the status tag,
// the course line, two status tiles, and the Set Times / Book Class buttons
export function AvailabilityShell() {
  return (
    <div className="space-y-4">
      <SkeletonToolbar />
      <div className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="p-[16px]">
            <div className="flex items-start gap-[12px]">
              <SkeletonAvatar size={38} />
              <div className="min-w-0 flex-1 space-y-[8px] pt-[2px]">
                <Bone className="h-3.5 w-36" />
                <Bone className="h-3 w-48 max-w-full" />
              </div>
              <Bone className="h-6 w-20 shrink-0 rounded-full" />
            </div>
            <div className="mt-[12px] flex gap-[12px]">
              <Bone className="h-6 w-28 rounded-full" />
              <Bone className="h-4 w-16" />
              <Bone className="h-4 w-20" />
            </div>
            <div className="mt-[16px] grid grid-cols-2 gap-[10px]">
              {[0, 1].map((b) => (
                <div key={b} className="flex items-center gap-[10px] rounded-xl border-[1px] border-border p-[10px]">
                  <Bone className="h-8 w-8 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-[6px]">
                    <Bone className="h-3 w-3/4" />
                    <Bone className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[16px] grid grid-cols-2 gap-[8px]">
              <Bone className="h-9 rounded-full" />
              <Bone className="h-9 rounded-full" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
