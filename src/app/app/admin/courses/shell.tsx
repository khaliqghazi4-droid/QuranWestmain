import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard, SkeletonLabel } from "@/components/dashboard/skeleton";
import { StatTilesSkeleton } from "@/components/admin/stat-tiles";

// The page's placeholder while the data loads, header included (the real
// header lives in courses-manager.tsx, with the course count and the Add
// Course button): page.tsx shows it inside its Suspense, loading.tsx while
// navigating here

const STATS = ["Courses offered", "Total enrollments", "Average monthly fee", "Need a teacher"];

// The four stat tiles, then the course cards: gradient banner with the level
// chip and edit/delete, icon square and fee, name and description, the
// teacher row, and the three figures at the foot
export function CoursesShell() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Management"
        description="Manage academy offerings"
        action={<Bone className="h-[38px] w-[130px] rounded-full" />}
      />
      <StatTilesSkeleton labels={STATS} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-[16px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="overflow-hidden">
            <div className="flex h-[88px] items-start justify-between bg-gradient-to-br from-primary via-accent to-primary p-[12px]">
              <div className="h-[22px] w-[86px] rounded-full bg-white/15" />
              <div className="h-[34px] w-[72px] rounded-full bg-white/15" />
            </div>
            <div className="px-[20px] pb-[20px]">
              <div className="flex items-end justify-between">
                <div className="-mt-[28px] h-[56px] w-[56px] rounded-2xl border-[3px] !border-card bg-muted" />
                <Bone className="h-[24px] w-[90px]" />
              </div>
              <Bone className="mt-[18px] h-[18px] w-40" />
              <Bone className="mt-[10px] h-3 w-full" />
              <Bone className="mt-[8px] h-3 w-3/5" />
              <SkeletonLabel className="mt-[20px]">Teacher</SkeletonLabel>
              <div className="mt-[8px] flex items-center gap-[10px] rounded-xl border-[1px] border-border px-[10px] py-[8px]">
                <SkeletonAvatar size={32} />
                <div className="space-y-[6px]">
                  <Bone className="h-3 w-28" />
                  <Bone className="h-2.5 w-16" />
                </div>
              </div>
              <div className="mt-[16px] grid grid-cols-3 divide-x divide-border rounded-xl border-[1px] border-border">
                {["Students", "Per class", "Length"].map((l) => (
                  <div key={l} className="flex flex-col items-center px-[6px] py-[10px]">
                    <Bone className="h-[16px] w-10" />
                    <div className="mt-[6px] text-[11px] leading-[16px] text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
