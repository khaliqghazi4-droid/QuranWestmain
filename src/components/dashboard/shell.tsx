"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import type { Role } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

// The in-app class room fills the whole area under the header (no padding,
// no page scroll) so the meeting fits one screen
const CLASS_ROOM_PATH = /^\/app\/(teacher|student|admin)\/class\//;

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const fullBleed = CLASS_ROOM_PATH.test(usePathname() ?? "");
  // Desktop: sidebar shrunk to an icon rail. Remembered per browser.
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
    } catch {
      /* storage blocked: start expanded */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem("sidebar-collapsed", c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  }

  return (
    <div className="admin-dashboard h-screen overflow-hidden flex bg-background">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader role={role} onMenuClick={() => setSidebarOpen(true)} />
        {/* overflow-x-hidden: no page ever scrolls sideways (wide tables
            scroll inside their own overflow-x-auto wrappers). The padding is
            written out because the website's Bootstrap stylesheet overrides
            .px-3/.py-4 with !important; these are the values that applied. */}
        <main
          className={cn(
            "flex-1 min-h-0 overflow-x-hidden animate-fade-in",
            fullBleed ? "flex flex-col overflow-y-hidden" : "overflow-y-auto px-[16px] py-[24px]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
