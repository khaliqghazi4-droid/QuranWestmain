import { cn } from "@/lib/utils";

type AvatarStyle = "micah" | "avataaars" | "personas" | "notionists" | "lorelei";

// A person's picture: their own uploaded photo when `src` is given, otherwise
// their initials on the brand gradient. The made-up cartoon faces
// (CartoonAvatar below) were dropped at the user's request; to bring them
// back, return <CartoonAvatar …/> here instead of the initials. `style` only
// matters to the cartoons and is kept so call sites need no change either way.
export function Avatar({
  name,
  size = 40,
  src,
  className,
}: {
  name: string;
  size?: number;
  src?: string | null;
  style?: AvatarStyle;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full border-2 border-card object-cover shadow-sm shrink-0", className)}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  // adm-badge: in the light admin, the navy gradient of its icon squares
  return (
    <AvatarInitial
      name={name}
      size={size}
      className={cn("adm-badge border-2 border-card shadow-sm", className)}
    />
  );
}

// No longer used: DiceBear cartoon faces generated from the name (see Avatar)
export function CartoonAvatar({
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
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <div
      role="img"
      aria-label={name}
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
