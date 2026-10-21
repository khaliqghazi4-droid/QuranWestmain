import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Bone, SkeletonAvatar, SkeletonCard, SkeletonLabel, SkeletonLines } from "@/components/dashboard/skeleton";
import { ScheduleShell } from "../shell";

// A student's schedule page: the way back to the Classes cards, and its
// placeholder while the data loads (page.tsx's Suspense and loading.tsx)

export function BackToClasses() {
  // A glass pill: it sits straight on the background video
  return (
    <Link
      href="/app/admin/classes"
      className="adm-glass inline-flex items-center gap-[8px] rounded-full border-[1px] border-border bg-card px-[14px] py-[7px] text-[13px] font-semibold leading-[18px] text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Classes
    </Link>
  );
}

// The student card (photo, name, weekly timetable), then the schedule
export function StudentClassesShell() {
  return (
    <div className="space-y-6">
      <SkeletonCard className="p-[20px] sm:p-[24px]">
        <div className="flex flex-wrap items-center gap-[16px]">
          <SkeletonAvatar size={64} />
          <SkeletonLines wide="w-48" narrow="w-60" />
          <Bone className="h-9 w-32 rounded-full" />
        </div>
        <SkeletonLabel className="mt-[20px]">Weekly timetable · PKT</SkeletonLabel>
        <div className="mt-[10px] grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => (
            <div key={i} className="adm-tile flex items-center gap-[12px] rounded-xl border-[1px] border-border p-[12px]">
              <Bone className="h-11 w-11 rounded-lg" />
              <SkeletonLines wide="w-32" narrow="w-40" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <ScheduleShell />
    </div>
  );
}
