import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonCard, SkeletonLabel } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function TeachersHeader() {
  return <PageHeader title="Teachers Management" description="Manage all teacher accounts" />;
}

// Search with the All / Male / Female chips and Invite, then a shift heading
// over three columns of teacher cards: the banner with the photo across its
// edge and the action pills, name and details, the counts strip, the shift
// and category switches and the two buttons
export function TeachersShell() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div className="flex flex-1 items-center gap-[12px]">
          <Bone className="h-9 w-full max-w-sm rounded-full" />
          <Bone className="h-8 w-44 shrink-0 rounded-full" />
        </div>
        <Bone className="h-9 w-36 rounded-full" />
      </div>
      <div className="space-y-[14px]">
        <div className="flex items-center gap-[12px]">
          <Bone className="h-[38px] w-44 rounded-full" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="overflow-hidden">
              <div className="adm-cover relative h-[76px] bg-gradient-to-br from-primary via-accent to-primary" />
              <div className="px-[20px] pb-[20px]">
                <div className="flex items-end justify-between gap-[12px]">
                  <div className="relative z-[1] -mt-[34px] h-[68px] w-[68px] rounded-full border-4 border-card bg-muted" />
                  <Bone className="h-[36px] w-[104px] rounded-full" />
                </div>
                <Bone className="mt-[14px] h-4 w-40" />
                <Bone className="mt-[10px] h-3 w-48 max-w-full" />
                <Bone className="mt-[8px] h-3 w-20" />
                <Bone className="mt-[16px] h-[64px] rounded-xl" />
                <Bone className="mt-[12px] h-3 w-full" />
                <Bone className="mt-[8px] h-3 w-2/3" />
                {["Shift", "Category"].map((l) => (
                  <div key={l} className="mt-[12px]">
                    <SkeletonLabel className="mb-[6px]">{l}</SkeletonLabel>
                    <Bone className="h-[36px] rounded-full" />
                  </div>
                ))}
                <div className="mt-[18px] grid grid-cols-2 gap-[8px]">
                  <Bone className="h-[36px] rounded-full" />
                  <Bone className="h-[36px] rounded-full" />
                </div>
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
}
