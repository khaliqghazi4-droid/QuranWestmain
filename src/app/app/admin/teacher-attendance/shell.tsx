import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard, SkeletonLines } from "@/components/dashboard/skeleton";

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function AttendanceHeader() {
  return (
    <PageHeader
      title="Teacher Attendance"
      description="Daily sign-in / sign-out, by week, month, year or any dates (Pakistan time)"
    />
  );
}

// The counts strip, then the period card: one row per teacher with the name,
// the days (shown here as a week of tiles) and the totals. The period picker
// sits above it on the page, so only loading.tsx draws a placeholder for it.
export function AttendanceShell() {
  return (
    <>
      <SkeletonCard className="grid grid-cols-2 overflow-hidden sm:grid-cols-4">
        {["Teachers", "Signed in today", "Hours worked", "Attendance"].map((l, i) => (
          <div
            key={l}
            className={`flex items-center gap-[10px] px-[14px] py-[16px] sm:gap-[12px] sm:px-[20px] sm:py-[18px] ${
              i % 2 === 1 ? "border-l border-border" : ""
            } ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}
          >
            <Bone className="h-9 w-9 shrink-0 rounded-xl sm:h-11 sm:w-11" />
            <div className="space-y-[6px]">
              <Bone className="h-5 w-8" />
              <div className="text-[12.5px] leading-[17px] text-muted-foreground">{l}</div>
            </div>
          </div>
        ))}
      </SkeletonCard>

      <SkeletonCard className="overflow-hidden">
        <div className="px-[20px] py-[16px]">
          <Bone className="h-5 w-40" />
          <Bone className="mt-[8px] h-3 w-28" />
        </div>
        <div className="divide-y divide-border border-t border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-x-[24px] gap-y-[14px] px-[20px] py-[18px] xl:grid-cols-[250px_minmax(0,1fr)_160px] xl:items-center"
            >
              <div className="flex items-center gap-[12px]">
                <SkeletonAvatar size={44} />
                <SkeletonLines wide="w-32" narrow="w-44" />
              </div>
              <div className="grid grid-cols-7 gap-[6px] sm:gap-[8px]">
                {Array.from({ length: 7 }).map((_, d) => (
                  <div
                    key={d}
                    className="flex flex-col items-center gap-[6px] rounded-xl border-[1px] border-border px-[2px] py-[8px]"
                  >
                    <Bone className="h-2.5 w-6" />
                    <Bone className="h-4 w-5" />
                    <Bone className="h-5 w-10 max-w-full rounded-full" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-[16px] xl:block xl:space-y-[10px]">
                <Bone className="h-9 w-24" />
                <Bone className="h-6 w-32" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </>
  );
}

// The period picker: the four choices, then the arrows and the date
export function PeriodPickerShell() {
  return (
    <SkeletonCard className="flex flex-wrap items-center gap-[12px] p-[12px] sm:px-[16px]">
      <Bone className="h-[38px] w-[290px] max-w-full rounded-full" />
      <div className="hidden flex-1 sm:block" />
      <div className="flex items-center gap-[8px]">
        <Bone className="h-9 w-9 rounded-full" />
        <Bone className="h-5 w-40" />
        <Bone className="h-9 w-9 rounded-full" />
      </div>
    </SkeletonCard>
  );
}
