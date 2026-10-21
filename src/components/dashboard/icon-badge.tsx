import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// A small icon in a round badge, for the little icons beside details (email,
// country, course, teacher, dates…): the user wants these in the gradient
// too, never bare grey. `adm-icon` makes it the admin's navy gradient with a
// white icon in light mode (globals.css), the same as the icon squares;
// elsewhere it is a soft primary tint. `size` in px, the icon at 60%.
export function IconBadge({
  icon: Icon,
  size = 20,
  className,
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "adm-icon inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-accent/15 text-primary",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Icon strokeWidth={2.25} style={{ width: Math.round(size * 0.6), height: Math.round(size * 0.6) }} />
    </span>
  );
}
