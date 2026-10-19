import {
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  AlertCircle,
  Inbox,
  CalendarCheck,
  Video,
  CalendarClock,
} from "lucide-react";

const glanceLabels = [
  { icon: Inbox, label: "Enroll requests" },
  { icon: CalendarCheck, label: "Free trials" },
  { icon: Video, label: "Classes today" },
  { icon: CalendarClock, label: "Teachers signed in" },
];

export default function AdminLoading() {
  const statLabels = [
    { icon: GraduationCap, label: "Total Students" },
    { icon: Users, label: "Active Teachers" },
    { icon: BookOpen, label: "Active Courses" },
    { icon: DollarSign, label: "Monthly Revenue" },
  ];

  return (
    <div className="space-y-3">
      {/* Stat cards (2×2) + Quick Actions. `adm-*` classes: light-mode look, see globals.css */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {statLabels.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className={`${i === 0 ? "adm-hero" : "adm-glass"} flex flex-col rounded-xl border border-border bg-card p-2.5`}
            >
              <div className="adm-chip grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className="mt-auto pt-2 text-base font-bold text-muted-foreground/40">—</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="adm-glass rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Quick Actions</h2>
            <AlertCircle className="adm-accent-icon h-3.5 w-3.5 text-[hsl(var(--gold))]" />
          </div>
          <div className="space-y-2">
            {["📚 Add a new course", "👨‍🏫 Invite a teacher", "🎓 View all students"].map((t) => (
              <div key={t} className="adm-tile rounded-xl border border-border bg-background p-2">
                <p className="text-xs font-medium">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Activity (left) + Recent signups (right) */}
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="adm-glass rounded-xl border border-border bg-card p-3">
          <h2 className="text-sm font-bold mb-3">Platform Activity</h2>
          <div className="adm-tile rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">Enrollment Capacity</span>
              <span className="text-xs font-bold text-muted-foreground/40">— / —</span>
            </div>
            <div className="adm-track h-2 rounded-full bg-muted" />
          </div>
          {/* "At a glance" tiles (filled in on page.tsx) */}
          <p className="mt-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">At a glance</p>
          <div className="grid grid-cols-2 gap-2">
            {glanceLabels.map(({ icon: Icon, label }) => (
              <div key={label} className="adm-tile flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold leading-tight text-muted-foreground/40">—</p>
                  <p className="truncate text-[11px] font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground/40">—</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="adm-glass rounded-xl border border-border bg-card p-3">
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
    </div>
  );
}
