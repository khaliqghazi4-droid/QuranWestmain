import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard, SkeletonLabel, SkeletonLines, SkeletonToolbar } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function TrialsHeader() {
  return <PageHeader title="Free Trial Sessions" description="Enrollment requests scheduled for a free trial" />;
}

// The toolbar, then two columns of trial cards: the person, the trial's
// details, the teacher box, share buttons and Add Student
export function TrialsShell() {
  return (
    <div className="space-y-4">
      <SkeletonToolbar />
      <div className="grid gap-[12px] lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="p-[20px]">
            <div className="flex items-start gap-[12px]">
              <SkeletonAvatar size={44} />
              <SkeletonLines wide="w-36" narrow="w-48" />
              <Bone className="h-6 w-28 shrink-0 rounded-full" />
            </div>
            <div className="mt-[16px] space-y-[10px]">
              <Bone className="h-3 w-40" />
              <Bone className="h-3 w-56 max-w-full" />
              <Bone className="h-3 w-32" />
            </div>
            <div className="mt-[12px] space-y-[8px] rounded-xl border-[1px] border-border p-[12px]">
              <SkeletonLabel>Assign teacher</SkeletonLabel>
              <Bone className="h-8 rounded-lg" />
              <Bone className="h-8 rounded-lg" />
            </div>
            <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
              <Bone className="h-8 rounded-full" />
              <Bone className="h-8 rounded-full" />
              <Bone className="h-8 rounded-full" />
            </div>
            <Bone className="mt-[8px] h-8 w-full rounded-full" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
