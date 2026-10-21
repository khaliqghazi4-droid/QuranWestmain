import { ArrowLeft } from "lucide-react";
import { Bone, SkeletonCard, SkeletonHero, SkeletonStats } from "@/components/dashboard/skeleton";

// A student's page while it loads (without this the students list's
// skeleton would show): back link and Print, the profile hero, five stat
// cards and the Course Progress card
export default function StudentLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </span>
        <Bone className="h-9 w-40 rounded-full" />
      </div>
      <SkeletonHero />
      <SkeletonStats
        labels={["Courses", "Avg Progress", "Completed", "Lessons Done", "Attendance"]}
        className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 lg:grid-cols-5"
      />
      <SkeletonCard className="p-[24px]">
        <h3 className="mb-[16px] text-lg font-bold">Course Progress</h3>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border-[1px] border-border p-[16px]">
              <div className="flex items-start justify-between gap-[16px]">
                <div className="flex-1 space-y-[10px]">
                  <Bone className="h-4 w-40" />
                  <Bone className="h-3 w-56 max-w-full" />
                </div>
                <Bone className="h-8 w-14" />
              </div>
              <Bone className="mt-[12px] h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
