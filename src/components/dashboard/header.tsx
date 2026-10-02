"use client";

import * as React from "react";
import { Bell, Menu, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/nav-config";
import { HeaderSearch } from "./header-search";

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type UnreadMsg = {
  id: string;
  content: string;
  attachmentType: string | null;
  createdAt: string;
  sender: { id: string; name: string; role: string };
};

export function DashboardHeader({ onMenuClick, role }: { onMenuClick: () => void; role: Role }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const name = session?.user?.name ?? "—";
  const initials = name === "—" ? "•" : initialsOf(name);

  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [msgs, setMsgs] = React.useState<UnreadMsg[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch unread messages
  const fetchUnread = React.useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread");
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count ?? 0);
      setMsgs(data.messages ?? []);
    } catch {}
  }, []);

  // Refetch on every page change too, so opening a chat (which marks its
  // messages read) clears the badge right away instead of after the next poll
  React.useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000); // poll every 30s
    return () => clearInterval(id);
  }, [fetchUnread, pathname]);

  // Close on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const messagesHref = `/app/${role}/messages`;

  function handleViewAll() {
    setOpen(false);
    router.push(messagesHref);
  }

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-12 items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden grid h-8 w-8 place-items-center rounded-full border border-border bg-card hover:bg-muted"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <HeaderSearch role={role} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Bell + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative grid h-8 w-8 place-items-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 ring-2 ring-background">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-10 w-72 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-bold">Notifications</span>
                  {count > 0 && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                      {count} unread
                    </span>
                  )}
                </div>

                {/* Messages list */}
                <div className="max-h-64 overflow-y-auto">
                  {msgs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                      <Bell className="h-6 w-6 opacity-30" />
                      <p className="text-xs">No new messages</p>
                    </div>
                  ) : (
                    msgs.map((m) => (
                      <button
                        key={m.id}
                        onClick={handleViewAll}
                        className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0"
                      >
                        {/* Sender avatar */}
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-[10px] font-bold mt-0.5">
                          {initialsOf(m.sender.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold truncate">{m.sender.name}</p>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {timeAgo(m.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {m.attachmentType ? `📎 ${m.attachmentType}` : m.content || "—"}
                          </p>
                        </div>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-2">
                  <button
                    onClick={handleViewAll}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    View all messages
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-[11px] text-muted-foreground">Premium Member</p>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xs shadow-md shadow-primary/20">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
