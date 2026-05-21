import { PageHeader } from "@/components/dashboard/page-header";
import { Download, TrendingUp, Users, BookOpen, DollarSign, Calendar } from "lucide-react";

const reports = [
  { title: "Monthly Revenue Report", desc: "Detailed breakdown of January 2026 revenue", icon: DollarSign, date: "Jan 2026" },
  { title: "Student Attendance Summary", desc: "Average attendance across all courses", icon: Calendar, date: "Last 30 days" },
  { title: "Teacher Performance", desc: "Ratings, classes taught, and student feedback", icon: Users, date: "Q4 2025" },
  { title: "Course Enrollment Trends", desc: "Most popular courses and growth metrics", icon: BookOpen, date: "Year 2025" },
];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into academy performance"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Enrollment Trends</h2>
              <p className="text-xs text-muted-foreground mt-0.5">New students per month</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3 w-3" /> +24% growth
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-56">
            {[
              { m: "Jul", v: 35 }, { m: "Aug", v: 50 }, { m: "Sep", v: 42 },
              { m: "Oct", v: 65 }, { m: "Nov", v: 78 }, { m: "Dec", v: 88 }, { m: "Jan", v: 95 },
            ].map((b) => (
              <div key={b.m} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-[10px] font-bold text-foreground">{Math.round(b.v * 2)}</p>
                <div className="w-full flex-1 flex items-end">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent shadow-md" style={{ height: `${b.v}%` }} />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">{b.m}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-4">Top Performing Courses</h2>
          <div className="space-y-4">
            {[
              { name: "Tajweed Mastery", count: 178, color: "from-primary to-accent" },
              { name: "Nazra Quran", count: 220, color: "from-emerald-500 to-teal-500" },
              { name: "Hifz Program", count: 89, color: "from-[hsl(var(--gold))] to-amber-500" },
              { name: "Arabic Language", count: 102, color: "from-fuchsia-500 to-purple-500" },
            ].map((c) => {
              const max = 250;
              const pct = (c.count / max) * 100;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold">{c.name}</p>
                    <p className="text-xs font-bold">{c.count}</p>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-5">Generated Reports</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r.title} className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-all">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0">
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Period: {r.date}</p>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
