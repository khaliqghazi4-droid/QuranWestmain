export default function MessagesLoading() {
  return (
    <div className="h-full" role="status" aria-live="polite">
      <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-44 animate-pulse rounded bg-muted/60" />
          </div>
        </div>

        <div className="flex-1 space-y-5 p-6" aria-hidden="true">
          <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-muted/70" />
          <div className="ml-auto h-12 w-1/2 animate-pulse rounded-2xl bg-primary/10" />
          <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-muted/70" />
        </div>

        <div className="border-t border-border p-4">
          <div className="h-11 animate-pulse rounded-xl bg-muted/70" aria-hidden="true" />
        </div>
      </div>
      <span className="sr-only">Loading messages</span>
    </div>
  );
}