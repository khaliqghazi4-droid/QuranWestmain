"use client";

import * as React from "react";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  onMenuClick,
  user = { name: "Muhammad Ali", initials: "MA" },
}: {
  onMenuClick: () => void;
  user?: { name: string; initials: string };
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-muted"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative max-w-md flex-1 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses, lessons, students..."
              className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[hsl(var(--gold))] ring-2 ring-background" />
          </button>

          <div className="flex items-center gap-2 pl-2">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-[11px] text-muted-foreground">Premium Member</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm shadow-md shadow-primary/20">
              {user.initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
