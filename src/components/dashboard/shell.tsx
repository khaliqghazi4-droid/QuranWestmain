"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import type { Role } from "@/lib/nav-config";

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
