import { cn } from "@/lib/utils";

export function IslamicPattern({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={cn("absolute inset-0 -z-10 h-full w-full opacity-[0.07]", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="islamic-stars"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M40 5 L50 25 L72 28 L56 44 L60 66 L40 55 L20 66 L24 44 L8 28 L30 25 Z" />
            <circle cx="40" cy="40" r="14" />
            <path d="M40 26 L48 40 L40 54 L32 40 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-stars)" />
    </svg>
  );
}

export function MoroccanArchSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arch-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M50 500 L50 200 Q50 50 200 50 Q350 50 350 200 L350 500 Z"
        fill="url(#arch-grad)"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      <path
        d="M100 500 L100 220 Q100 100 200 100 Q300 100 300 220 L300 500 Z"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
    </svg>
  );
}
