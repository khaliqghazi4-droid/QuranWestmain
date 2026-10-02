export default function TeacherLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="h-6 w-56 rounded-lg bg-muted" />
      <div className="h-10 w-full rounded-xl bg-muted" />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-10 bg-muted/40 border-b border-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="h-5 w-8 rounded bg-muted" />
            <div className="h-5 flex-1 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
