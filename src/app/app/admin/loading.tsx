import Link from "next/link";
import { GraduationCap, Users, BookOpen, DollarSign, AlertCircle } from "lucide-react";

export default function AdminLoading() {
  const statLabels = [
    { icon: GraduationCap, label: "Total Students" },
    { icon: Users, label: "Active Teachers" },
    { icon: BookOpen, label: "Active Courses" },
    { icon: DollarSign, label: "Monthly Revenue" },
  ];

  return (
    <div className="space-y-3">
      {/* Welcome header */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Welcome back,</p>
          <h1 className="mt-0.5 text-base sm:text-lg font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Loading...</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/courses" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Manage Courses
          </Link>
          <Link href="/app/admin/students" className="rounded-lg bg-[hsl(var(--gold))] px-3 py-1.5 text-xs font-bold text-[hsl(220_32%_10%)]">
            View Students
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statLabels.map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <p className="mt-2 text-base font-bold text-muted-foreground/40">—</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-3">
          <h2 className="text-sm font-bold mb-3">Platform Activity</h2>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">Enrollment Capacity</span>
              <span className="text-xs font-bold text-muted-foreground/40">— / —</span>
            </div>
            <div className="h-2 rounded-full bg-muted" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Quick Actions</h2>
            <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
          </div>
          <div className="space-y-2">
            {["📚 Add a new course", "👨‍🏫 Invite a teacher", "🎓 View all students"].map((t) => (
              <div key={t} className="rounded-xl border border-border bg-background p-2">
                <p className="text-xs font-medium">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent signups */}
      <div className="rounded-xl border border-border bg-card p-3">
        <h2 className="text-sm font-bold mb-2">Recent Signups</h2>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5">
              <div className="h-7 w-7 rounded-full bg-muted/30 border border-border shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground/40">—</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
