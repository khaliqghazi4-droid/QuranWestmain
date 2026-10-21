import { ArrowLeft } from "lucide-react";
import { Bone, SkeletonCard } from "@/components/dashboard/skeleton";

// A student's page while it loads (without this the students list's
// skeleton would show), laid out as the page: back pill and Print; the
// header card (banner, photo, name and tags, buttons, the four counts strip)
// beside About; Course progress beside Weekly classes; then Attendance
export default function StudentLoading() {
  return (
    <div className="space-y-[20px]">
      <div className="flex items-center justify-between gap-[12px]">
        <span className="adm-glass inline-flex items-center gap-[8px] rounded-full border-[1px] border-border bg-card px-[14px] py-[7px] text-[13px] font-semibold leading-[18px]">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </span>
        <Bone className="h-[34px] w-24 rounded-full sm:w-44" />
      </div>

      <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <SkeletonCard className="flex flex-col overflow-hidden">
          <div className="adm-cover relative h-[112px] bg-gradient-to-br from-primary via-accent to-primary" />
          <div className="flex flex-wrap items-start justify-between gap-[16px] px-[20px] pb-[20px] sm:px-[28px]">
            <div className="flex flex-wrap items-start gap-x-[20px] gap-y-[8px]">
              <div className="relative z-[1] -mt-[56px] h-[112px] w-[112px] rounded-full border-4 border-card bg-muted" />
              <div className="space-y-[10px] pt-[16px]">
                <Bone className="h-7 w-48 max-w-full" />
                <div className="flex gap-[8px]">
                  <Bone className="h-6 w-20 rounded-full" />
                  <Bone className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-[8px] sm:pt-[24px]">
              <Bone className="h-9 w-24 rounded-full" />
              <Bone className="h-9 w-28 rounded-full" />
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 border-t border-border sm:grid-cols-4">
            {["Courses", "Avg progress", "Lessons done", "Attendance"].map((l, i) => (
              <div
                key={l}
                className={`flex items-center gap-[10px] px-[20px] py-[16px] sm:px-[18px] ${
                  i % 2 === 1 ? "border-l border-border" : ""
                } ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}
              >
                <Bone className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="space-y-[6px]">
                  <Bone className="h-5 w-8" />
                  <div className="text-[12px] leading-[16px] text-muted-foreground">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="px-[20px] pb-[20px]">
          <h2 className="py-[16px] text-[16px] font-bold leading-[22px]">About</h2>
          <Bone className="h-3.5 w-full" />
          <Bone className="mt-[8px] h-3.5 w-3/4" />
          <div className="mt-[14px] divide-y divide-border border-t border-border">
            {["Email", "Phone", "Country", "Time zone"].map((l) => (
              <div key={l} className="flex items-center gap-[10px] py-[10px]">
                <Bone className="h-7 w-7 shrink-0 rounded-lg" />
                <span className="text-[12.5px] leading-[18px] text-muted-foreground">{l}</span>
                <Bone className="ml-auto h-3.5 w-28" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <SkeletonCard className="overflow-hidden">
          <h2 className="px-[20px] py-[16px] text-[16px] font-bold leading-[22px]">Course progress</h2>
          <div className="divide-y divide-border">
            {[0, 1].map((r) => (
              <div key={r} className="px-[20px] py-[16px]">
                <div className="flex items-center gap-[12px]">
                  <Bone className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-[6px]">
                    <Bone className="h-3.5 w-2/5" />
                    <Bone className="h-3 w-1/4" />
                  </div>
                  <Bone className="h-6 w-12" />
                </div>
                <Bone className="mt-[12px] h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="overflow-hidden">
          <h2 className="px-[20px] py-[16px] text-[16px] font-bold leading-[22px]">Weekly classes</h2>
          <div className="divide-y divide-border">
            {[0, 1].map((r) => (
              <div key={r} className="flex items-center gap-[14px] px-[20px] py-[14px]">
                <Bone className="h-10 w-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-[6px]">
                  <Bone className="h-3.5 w-1/2" />
                  <Bone className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard className="overflow-hidden">
        <h2 className="px-[20px] py-[16px] text-[16px] font-bold leading-[22px]">Attendance</h2>
        <div className="grid gap-[16px] px-[20px] pb-[20px] md:grid-cols-[280px_minmax(0,1fr)]">
          <Bone className="h-[180px] rounded-xl" />
          <div className="space-y-[8px]">
            {[0, 1, 2].map((r) => (
              <Bone key={r} className="h-[56px] rounded-xl" />
            ))}
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
}
