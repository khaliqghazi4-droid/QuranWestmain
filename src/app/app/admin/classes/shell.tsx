import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonAvatar, SkeletonCard, SkeletonLines } from "@/components/dashboard/skeleton";

// How far ahead the page lists classes; the header says it too
export const WEEKS_AHEAD = 4;

// The page's header and its placeholder while the data loads: page.tsx shows
// them inside its Suspense, loading.tsx while navigating here

export function ClassesHeader() {
  return (
    <PageHeader
      title="Classes"
      description={`Students with classes in the next ${WEEKS_AHEAD} weeks, A–Z. Open a student to see their schedule (Pakistan time, PKT)`}
    />
  );
}

// The title and count with search and the Course pill, then the grid of
// student cards: photo and name, the next-class tile, weekly time chips, the
// footer
export function ClassesShell() {
  return (
    <div className="space-y-5">
      <SkeletonCard className="flex flex-wrap items-center gap-[12px] px-[16px] py-[14px] sm:px-[20px]">
        <div className="mr-auto">
          <h2 className="text-[15px] font-bold leading-[22px]">Students</h2>
          <Bone className="mt-[4px] h-3 w-52" />
        </div>
        <div className="flex w-full items-center gap-[8px] sm:w-auto">
          <Bone className="h-[38px] min-w-0 flex-1 rounded-full sm:w-64 sm:flex-none" />
          <Bone className="h-[38px] w-36 rounded-full" />
        </div>
      </SkeletonCard>
      <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="p-[20px]">
            <div className="flex items-start gap-[12px]">
              <SkeletonAvatar size={48} />
              <SkeletonLines wide="w-36" narrow="w-28" />
            </div>
            <div className="adm-tile mt-[16px] space-y-[8px] rounded-xl border-[1px] border-border px-[14px] py-[12px]">
              <div className="flex justify-between">
                <Bone className="h-2.5 w-16" />
                <Bone className="h-2.5 w-14" />
              </div>
              <Bone className="h-4 w-48 max-w-full" />
            </div>
            <Bone className="mt-[14px] h-2.5 w-20" />
            <div className="mt-[8px] flex gap-[6px]">
              <Bone className="h-[22px] w-24 rounded-full" />
              <Bone className="h-[22px] w-24 rounded-full" />
            </div>
            <div className="mt-[16px] flex justify-between border-t border-border pt-[14px]">
              <Bone className="h-3 w-32" />
              <Bone className="h-3 w-24" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

// A student's schedule (classes/[student], ClassesBoard): the title and
// count with the Day filter pill, then classes grouped by day, a day heading
// over a card of rows (time, course and teacher, Join)
export function ScheduleShell() {
  return (
    <div className="space-y-5">
      <SkeletonCard className="flex flex-wrap items-center gap-[12px] px-[16px] py-[14px] sm:px-[20px]">
        <div className="mr-auto">
          <h2 className="text-[15px] font-bold leading-[22px]">Upcoming classes</h2>
          <Bone className="mt-[4px] h-3 w-40" />
        </div>
        <Bone className="h-[38px] w-36 rounded-full" />
      </SkeletonCard>
      {[3, 2].map((rows, g) => (
        <section key={g}>
          <div className="flex items-center gap-[8px]">
            <Bone className="h-4 w-4 rounded-[4px]" />
            <Bone className="h-4 w-52" />
            <Bone className="h-4 w-8 rounded-full" />
          </div>
          <SkeletonCard className="mt-[8px] divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[12px] p-[16px] sm:flex-row sm:items-center">
                <div className="shrink-0 space-y-[6px] sm:w-40">
                  <Bone className="h-3.5 w-32" />
                  <Bone className="h-3 w-20" />
                </div>
                <SkeletonLines wide="w-40" narrow="w-56" />
                <div className="flex shrink-0 items-center gap-[12px]">
                  <Bone className="h-3 w-14" />
                  <Bone className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </SkeletonCard>
        </section>
      ))}
    </div>
  );
}
