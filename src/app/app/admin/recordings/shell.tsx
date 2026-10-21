import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function RecordingsHeader() {
  return <PageHeader title="Class Recordings" description="Recorded lectures library" />;
}

// The two "By teacher / By student" cards, the search bar, then the people's
// cards: photo, name, two lines, the arrow
export function RecordingsShell() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-[12px]">
        {["By teacher", "By student"].map((label) => (
          <SkeletonCard key={label} className="flex items-center gap-[12px] px-[14px] py-[14px] sm:px-[18px]">
            <Bone className="h-[40px] w-[40px] shrink-0 rounded-xl sm:h-[44px] sm:w-[44px]" />
            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-[20px]">{label}</div>
              <Bone className="mt-[6px] h-3 w-28 max-w-full" />
            </div>
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard className="flex flex-wrap items-center gap-[12px] px-[16px] py-[12px] sm:px-[20px]">
        <div className="mr-auto space-y-[6px]">
          <Bone className="h-4 w-28" />
          <Bone className="h-3 w-44" />
        </div>
        <Bone className="h-9 w-full rounded-full sm:w-64" />
      </SkeletonCard>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-[12px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="flex items-center gap-[14px] p-[16px]">
            <SkeletonAvatar size={48} />
            <div className="min-w-0 flex-1 space-y-[8px]">
              <Bone className="h-3.5 w-28 max-w-full" />
              <Bone className="h-3 w-36 max-w-full" />
            </div>
            <Bone className="h-8 w-8 rounded-full" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
