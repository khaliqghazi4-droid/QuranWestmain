import type { LucideIcon } from "lucide-react";
import { Bone, SkeletonCard } from "@/components/dashboard/skeleton";

export type StatTile = { icon: LucideIcon; label: string; value: string };

// The row of stat tiles that opens the Courses, Payments and Reports pages:
// icon square, then the number over its label. In light mode the first is
// navy with a gold number (adm-hero), as on the dashboard. The hero's number
// rule (`.adm-hero > p:first-of-type`) needs icon, number and label as direct
// children, hence a grid rather than nested boxes. Sizes are written out
// because the website's Bootstrap sheet overrides .gap-3, .border and friends.
export function StatTiles({ stats }: { stats: StatTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`${i === 0 ? "adm-hero" : "adm-glass"} grid grid-cols-[auto_1fr] items-center gap-x-[12px] rounded-2xl border-[1px] border-border bg-card px-[14px] py-[14px] stagger-item sm:px-[18px]`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="adm-icon row-span-2 grid h-[40px] w-[40px] place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary sm:h-[44px] sm:w-[44px]">
            <s.icon className="h-5 w-5" />
          </span>
          <p className="self-end text-[22px] font-bold leading-[26px] tabular-nums">{s.value}</p>
          <p className="self-start text-[12px] leading-[16px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// Their placeholder while the page loads: the real labels, bars for the numbers
export function StatTilesSkeleton({ labels }: { labels: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
      {labels.map((label) => (
        <SkeletonCard key={label} className="flex items-center gap-[12px] px-[14px] py-[14px] sm:px-[18px]">
          <Bone className="h-[40px] w-[40px] shrink-0 rounded-xl sm:h-[44px] sm:w-[44px]" />
          <div className="min-w-0">
            <Bone className="h-[22px] w-12" />
            <div className="mt-[6px] text-[12px] leading-[16px] text-muted-foreground">{label}</div>
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
