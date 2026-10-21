import { cn } from "@/lib/utils";

// Building blocks for the dashboards' loading skeletons. Each admin page's
// shell.tsx puts these together in that page's own layout (its toolbar, stat
// cards, table columns or card grid), so what shows while a page loads is the
// page itself, just without its data. Cards carry `adm-glass`, which makes
// them the admin's glass cards in light mode (globals.css) and does nothing
// elsewhere. Sizes and gaps are written out ([12px]…) because the website's
// Bootstrap sheet overrides .gap-3, .border, .text-xs and friends.

// A soft placeholder bar standing in for a word, a number or an icon. A tint
// of the text colour, so it shows on the light glass and on the dark cards
// alike (the cream --muted all but vanished on the glass).
const BONE = "bg-foreground/[0.09]";

export function Bone({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md", BONE, className)} />;
}

export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("adm-glass rounded-2xl border border-border bg-card", className)}>{children}</div>;
}

// A round placeholder for an avatar, `size` in px
export function SkeletonAvatar({ size = 40, square = false }: { size?: number; square?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn("shrink-0 animate-pulse", BONE, square ? "rounded-2xl" : "rounded-full")}
      style={{ width: size, height: size }}
    />
  );
}

// A name over a shorter second line, as beside an avatar
export function SkeletonLines({ className, wide = "w-32", narrow = "w-44" }: { className?: string; wide?: string; narrow?: string }) {
  return (
    <div className={cn("min-w-0 flex-1 space-y-[8px]", className)}>
      <Bone className={cn("h-3.5 max-w-full", wide)} />
      <Bone className={cn("h-3 max-w-full", narrow)} />
    </div>
  );
}

// The toolbar card most list pages open with: the filter tile, `selects`
// pill dropdowns, then the search box on the right
export function SkeletonToolbar({ selects = 1, children }: { selects?: number; children?: React.ReactNode }) {
  return (
    <SkeletonCard className="flex flex-wrap items-center gap-[12px] p-[16px]">
      <Bone className="h-9 w-9 rounded-xl" />
      {Array.from({ length: selects }).map((_, i) => (
        <Bone key={i} className="h-9 w-36 rounded-full" />
      ))}
      {children}
      <div className="hidden flex-1 sm:block" />
      <Bone className="h-9 w-full rounded-full sm:w-72" />
    </SkeletonCard>
  );
}

// The profile hero of the student/teacher pages and Settings: the brand
// gradient banner with the 96px photo across its bottom edge, then the name
// and a row of details. `button` adds the pill on the right (Edit Profile).
export function SkeletonHero({ tall = false, chips = false, button = false }: { tall?: boolean; chips?: boolean; button?: boolean }) {
  return (
    <SkeletonCard className="overflow-hidden">
      <div className={cn("relative bg-gradient-to-br from-primary via-accent to-primary", tall ? "h-32" : "h-24")}>
        <div className="absolute -bottom-12 left-[24px] sm:left-[32px]">
          <div className="h-24 w-24 rounded-2xl border-4 border-card bg-muted shadow-xl" />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-[16px] px-[24px] pb-[24px] pt-[64px] sm:px-[32px]">
        <div className="space-y-[12px]">
          <Bone className="h-6 w-56 max-w-full" />
          {chips && (
            <div className="flex gap-[8px]">
              <Bone className="h-5 w-20 rounded-full" />
              <Bone className="h-5 w-16 rounded-full" />
            </div>
          )}
          <div className="flex flex-wrap gap-[16px]">
            <Bone className="h-3.5 w-44" />
            <Bone className="h-3.5 w-24" />
            <Bone className="h-3.5 w-32" />
          </div>
        </div>
        {button && <Bone className="h-9 w-32 rounded-full" />}
      </div>
    </SkeletonCard>
  );
}

// A small uppercase label, written out as on the page. A div, not a p: the
// glass cards turn an uppercase p into an eyebrow with a line before it.
export function SkeletonLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[10px] font-bold uppercase tracking-wider text-muted-foreground", className)}>{children}</div>
  );
}

// A row of stat cards: icon tile, number, then the real label
export function SkeletonStats({
  labels,
  className = "grid grid-cols-2 gap-[12px] sm:grid-cols-4",
  large = false,
}: {
  labels: string[];
  className?: string;
  // the reports' bigger cards: p-5 with an h-11 tile
  large?: boolean;
}) {
  return (
    <div className={className}>
      {labels.map((label) => (
        <SkeletonCard key={label} className={large ? "p-[20px]" : "p-[16px]"}>
          <Bone className={large ? "h-11 w-11 rounded-xl" : "h-10 w-10 rounded-lg"} />
          <Bone className="mt-[12px] h-7 w-14" />
          <p className="mt-[4px] text-xs text-muted-foreground">{label}</p>
        </SkeletonCard>
      ))}
    </div>
  );
}

// A card with an optional title/toolbar, the table's real column heads and
// rows of placeholder bars. `first` is how the first column looks: an avatar
// with two lines (a person), or one line.
export function SkeletonTable({
  columns,
  rows = 6,
  title,
  toolbar = false,
  first = "line",
}: {
  columns: string[];
  rows?: number;
  title?: string;
  toolbar?: boolean;
  first?: "person" | "line";
}) {
  return (
    <SkeletonCard>
      {(title || toolbar) && (
        <div className="flex flex-wrap items-center gap-[12px] border-b border-border px-[16px] py-[14px] sm:px-[20px]">
          {title ? (
            <div className="mr-auto">
              <h2 className="text-sm font-bold">{title}</h2>
              <Bone className="mt-[6px] h-3 w-20" />
            </div>
          ) : (
            <div className="mr-auto" />
          )}
          {toolbar && (
            <div className="flex w-full items-center gap-[8px] sm:w-auto">
              <Bone className="h-9 w-24 rounded-full" />
              <Bone className="h-9 flex-1 rounded-full sm:w-64 sm:flex-none" />
              <Bone className="h-9 w-9 rounded-full sm:w-32" />
            </div>
          )}
        </div>
      )}
      <div className="overflow-hidden">
        <div className="flex gap-[16px] border-b border-border px-[20px] py-[12px]">
          {columns.map((c, i) => (
            <span
              key={c}
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
                i === 0 ? "flex-[1.6]" : "flex-1",
                // phones: only the first two columns
                i > 1 && "hidden md:block"
              )}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="adm-rows divide-y divide-border">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-[16px] px-[20px] py-[16px]">
              {columns.map((c, i) =>
                i === 0 ? (
                  <div key={c} className="flex min-w-0 flex-[1.6] items-center gap-[12px]">
                    {first === "person" && <Bone className="h-9 w-9 shrink-0 rounded-full" />}
                    <div className="flex-1 space-y-[6px]">
                      <Bone className="h-3.5 w-3/5" />
                      {first === "person" && <Bone className="h-3 w-4/5" />}
                    </div>
                  </div>
                ) : (
                  <div key={c} className={cn("flex-1", i > 1 && "hidden md:block")}>
                    <Bone className={cn("h-3.5", (r + i) % 3 === 0 ? "w-3/5" : (r + i) % 3 === 1 ? "w-4/5" : "w-2/5")} />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-[16px] py-[12px] sm:px-[20px]">
        <Bone className="h-3 w-32" />
      </div>
    </SkeletonCard>
  );
}
