import { DashboardShell } from "@/components/dashboard/shell";

// Auth + role enforcement is handled by middleware.ts. Keeping this layout
// free of cookie/session reads lets the inner pages cache (ISR) properly.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
