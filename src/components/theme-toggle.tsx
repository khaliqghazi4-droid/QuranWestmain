"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = (mounted ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-10 w-[72px] items-center rounded-full",
        "border border-border bg-muted/60 backdrop-blur-md",
        "transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        "ring-focus"
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 grid h-8 w-8 place-items-center rounded-full",
          "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md",
          "transition-transform duration-500 ease-out",
          isDark && "translate-x-8"
        )}
      >
        <Sun
          className={cn(
            "h-4 w-4 transition-all duration-300 absolute",
            isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 transition-all duration-300 absolute",
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          )}
        />
      </span>
      <Sun
        className={cn(
          "ml-2 h-4 w-4 text-muted-foreground transition-opacity",
          isDark ? "opacity-40" : "opacity-0"
        )}
      />
      <Moon
        className={cn(
          "ml-auto mr-2 h-4 w-4 text-muted-foreground transition-opacity",
          isDark ? "opacity-0" : "opacity-40"
        )}
      />
    </button>
  );
}
