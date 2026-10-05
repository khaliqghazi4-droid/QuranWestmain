"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navConfig, roleMeta, type Role } from "@/lib/nav-config";

export function Sidebar({
  role,
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
  // Desktop only: show an icon rail instead of the full sidebar
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();
  const items = navConfig[role];
  const meta = roleMeta[role];
  // Hidden on desktop while collapsed (the phone drawer always shows them)
  const hideCollapsed = collapsed ? "lg:hidden" : "";
  // The website's Bootstrap stylesheet also defines .px-3, .p-2, .p-3, .px-4
  // and .border with !important, so `lg:` paddings can't override them. While collapsed,
  // those are swapped (via tailwind-merge in cn) for same-size arbitrary
  // values Bootstrap doesn't know, and the rail's `lg:` paddings apply.

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
          "fixed top-0 left-0 z-50 h-screen w-52 bg-card border-r border-border flex flex-col transition-[transform,width] duration-300 lg:relative lg:translate-x-0 lg:h-full",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed && "lg:w-16"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-4 py-3 border-b border-border",
            collapsed && "px-[24px] lg:justify-center lg:px-2"
          )}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit the academy website"
            className={cn("flex items-center group min-w-0", hideCollapsed)}
          >
            <Image
              src="/quran-academy-logo.png"
              alt="Quran Academy Logo"
              width={120}
              height={40}
              className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80"
              priority
            />
          </a>
          {/* Desktop: shrink the sidebar to icons / expand it again */}
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("px-3 py-2", collapsed && "px-[16px] lg:px-2")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-2",
              collapsed && "p-[8px] border-[1px] lg:justify-center lg:border-0 lg:bg-none lg:p-0"
            )}
            title={collapsed ? `Signed in as ${meta.label}` : undefined}
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
              <meta.icon className="h-4 w-4" />
            </div>
            <div className={hideCollapsed}>
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-bold">{meta.label}</p>
            </div>
          </div>
        </div>

        <nav className={cn("flex-1 overflow-y-auto px-3 py-2", collapsed && "px-[16px] lg:px-2")}>
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== `/app/${role}` && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      collapsed && "px-[16px] lg:justify-center lg:px-0",
                      active
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
                        active ? "text-primary-foreground" : ""
                      )}
                    />
                    <span className={cn("truncate", hideCollapsed)}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={cn("border-t border-border p-3", collapsed && "p-[16px] lg:p-2")}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Sign Out" : undefined}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
              collapsed && "px-[16px] lg:justify-center lg:px-0"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={hideCollapsed}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
