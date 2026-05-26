// Renders instantly during navigation between dashboard tabs so the user
// gets immediate feedback while the next page's data loads on the server.
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted/60" />
      </div>

      {/* Toolbar skeleton */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-muted" />
        <div className="h-9 w-40 rounded-full bg-muted" />
        <div className="flex-1" />
        <div className="h-9 w-72 max-w-full rounded-full bg-muted" />
      </div>

      {/* Content cards skeleton */}
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted/60" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted/60" />
              <div className="h-3 w-5/6 rounded bg-muted/60" />
              <div className="h-3 w-2/3 rounded bg-muted/60" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-9 rounded-full bg-muted" />
              <div className="h-9 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
