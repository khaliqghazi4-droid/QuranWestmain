"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navConfig, roleMeta, type Role } from "@/lib/nav-config";

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = navConfig[role];
  const meta = roleMeta[role];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">Online Quran</span>
              <span className="text-[11px] font-medium text-muted-foreground -mt-0.5">
                Academy
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
              <meta.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-bold">{meta.label}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== `/app/${role}` && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4.5 w-4.5 transition-transform group-hover:scale-110",
                        active ? "text-primary-foreground" : ""
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
