import { cn } from "@/lib/utils";

type AvatarStyle = "micah" | "avataaars" | "personas" | "notionists" | "lorelei";

export function Avatar({
  name,
  size = 40,
  style = "micah",
  className,
}: {
  name: string;
  size?: number;
  style?: AvatarStyle;
  className?: string;
}) {
  const seed = encodeURIComponent(name);
  const src = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=0F766E,134E4A,d4a747,b8901a&backgroundType=gradientLinear&radius=50`;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn(
        "rounded-full border-2 border-card shadow-sm shrink-0",
        className
      )}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}

export function AvatarInitial({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold shrink-0",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size / 3) }}
    >
      {initials}
    </div>
  );
}
