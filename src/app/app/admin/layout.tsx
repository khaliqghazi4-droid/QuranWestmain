import { DashboardShell } from "@/components/dashboard/shell";
import { warmAllAdminCaches } from "./_caches";

// Auth + role enforcement is handled by middleware.ts. Keeping this layout
// free of cookie/session reads lets the inner pages cache (ISR) properly.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fire all DB cache warm-ups immediately (non-blocking).
  // On cache hit: returns in <1ms. On cache miss: starts all 10 queries in
  // parallel so by the time the page's Suspense resolves them, data is ready
  // or in-flight — subsequent page navigations are instant.
  void warmAllAdminCaches();

  return <DashboardShell role="admin">{children}</DashboardShell>;
}
