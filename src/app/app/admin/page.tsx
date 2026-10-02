import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MOCK_RECENT_SIGNUPS } from "./_mock-data";
import { ACTIVE_STUDENT } from "@/lib/auth";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  AlertCircle,
  BookOpen,
  PlusCircle,
  UserCheck,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Avatar } from "@/components/avatar";

const getCachedDashboard = unstable_cache(
  async () => {
    const [totalStudents, totalTeachers, totalCourses, totalEnrollments, recentSignups, revenueAgg] =
      await Promise.all([
        prisma.user.count({ where: ACTIVE_STUDENT }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.course.count({ where: { isActive: true } }),
        prisma.enrollment.count(),
        prisma.user.findMany({
          where: { role: { in: ["STUDENT", "TEACHER"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, email: true, role: true, country: true, createdAt: true },
        }),
        prisma.enrollment.findMany({
          include: { course: { select: { price: true } } },
        }),
      ]);

    const monthlyRevenue = revenueAgg.reduce((sum, e) => sum + e.course.price, 0);

    return { totalStudents, totalTeachers, totalCourses, totalEnrollments, recentSignups, monthlyRevenue };
  },
  ["admin-dashboard"],
  { revalidate: 600 }
);

export const revalidate = 600;

// â”€â”€â”€ Static sections (render with no DB wait) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function QuickActionsCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Quick Actions</h2>
        <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
      </div>
      <div className="space-y-2">
        <Link href="/app/admin/courses" className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-2 hover:border-primary/40 transition-colors">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <PlusCircle className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold">Add a new course</p>
            <p className="text-[11px] text-primary font-bold">Manage courses →</p>
          </div>
        </Link>
        <Link href="/app/admin/teachers" className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-2 hover:border-primary/40 transition-colors">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserPlus className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold">Invite a teacher</p>
            <p className="text-[11px] text-primary font-bold">Teachers panel →</p>
          </div>
        </Link>
        <Link href="/app/admin/students" className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-2 hover:border-primary/40 transition-colors">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold">View all students</p>
            <p className="text-[11px] text-primary font-bold">Students panel →</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// â”€â”€â”€ Shell fallbacks (structural, no pulsing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WelcomeShell() {
  const statLabels = [
    { icon: GraduationCap, label: "Total Students" },
    { icon: Users, label: "Active Teachers" },
    { icon: BookOpen, label: "Active Courses" },
    { icon: DollarSign, label: "Monthly Revenue" },
  ];
  return (
    <>
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Welcome back,</p>
          <h1 className="mt-0.5 text-base sm:text-lg font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground max-w-xl">Loading stats...</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/courses" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            Manage Courses
          </Link>
          <Link href="/app/admin/students" className="rounded-lg bg-[hsl(var(--gold))] px-3 py-1.5 text-xs font-bold text-[hsl(220_32%_10%)] hover:opacity-90 transition-opacity">
            View Students
          </Link>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statLabels.map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-2.5">
            <div className="flex items-start justify-between">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-2 text-base font-bold text-muted-foreground/40">—</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ActivityShell() {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold">Platform Activity</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recent enrollments overview</p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">Enrollment Capacity</span>
          <span className="text-xs font-bold text-muted-foreground/40">— / —</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-0 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>
    </div>
  );
}

function SignupsShell() {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold">Recent Signups</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Latest user registrations</p>
        </div>
      </div>
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-1.5">
            <div className="h-7 w-7 rounded-full bg-muted/30 border border-border shrink-0" />
            <div className="flex-1 space-y-0.5">
              <div className="text-xs font-semibold text-muted-foreground/40">—</div>
              <div className="text-[10px] text-muted-foreground/30">—</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ Async data loaders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function DashboardWelcomeAndStats() {
  const { totalStudents, totalTeachers, totalCourses, totalEnrollments, monthlyRevenue } =
    await getCachedDashboard();

  const stats = [
    { icon: GraduationCap, label: "Total Students", value: totalStudents, prefix: "", suffix: "" },
    { icon: Users, label: "Active Teachers", value: totalTeachers, prefix: "", suffix: "" },
    { icon: BookOpen, label: "Active Courses", value: totalCourses, prefix: "", suffix: "" },
    { icon: DollarSign, label: "Monthly Revenue", value: Math.round(monthlyRevenue), prefix: "$", suffix: "" },
  ];

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Welcome back,</p>
          <h1 className="mt-0.5 text-base sm:text-lg font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground max-w-xl">
            You have <span className="font-semibold text-foreground">{totalStudents}</span> students,{" "}
            <span className="font-semibold text-foreground">{totalTeachers}</span> teachers, and{" "}
            <span className="font-semibold text-foreground">{totalEnrollments}</span> total enrollments.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/courses" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            Manage Courses
          </Link>
          <Link href="/app/admin/students" className="rounded-lg bg-[hsl(var(--gold))] px-3 py-1.5 text-xs font-bold text-[hsl(220_32%_10%)] hover:opacity-90 transition-opacity">
            View Students
          </Link>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group rounded-xl border border-border bg-card p-2.5 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all stagger-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <s.icon className="h-3.5 w-3.5" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                <ArrowUpRight className="h-2.5 w-2.5" />
                Live
              </span>
            </div>
            <p className="mt-2 text-base font-bold">
              <CountUp end={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}

async function DashboardActivity() {
  const { totalEnrollments, totalCourses } = await getCachedDashboard();
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold">Platform Activity</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recent enrollments overview</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
          <TrendingUp className="h-3 w-3" /> {totalEnrollments} total
        </div>
      </div>
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">Enrollment Capacity</span>
          <span className="text-xs font-bold">{totalEnrollments} / {totalCourses * 50}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
            style={{ width: `${Math.min(100, (totalEnrollments / Math.max(totalCourses * 50, 1)) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">Based on max 50 students per course</p>
      </div>
    </div>
  );
}

async function DashboardRecentSignups() {
  const { recentSignups } = await getCachedDashboard();
  const signups = recentSignups.length > 0 ? recentSignups : MOCK_RECENT_SIGNUPS;
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold">Recent Signups</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Latest user registrations</p>
        </div>
        <Link href="/app/admin/students" className="text-[11px] font-semibold text-primary hover:text-accent">
          View all
        </Link>
      </div>
      <div className="space-y-1">
        {signups.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-lg hover:bg-muted/30 p-1.5 transition-colors stagger-item"
            style={{ animationDelay: `${i * 60 + 200}ms` }}
          >
            <Avatar name={s.name} size={28} style="micah" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.email} · {s.country ?? s.role}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{timeAgo(s.createdAt)}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary inline-flex items-center gap-0.5">
              <UserPlus className="h-2.5 w-2.5" /> {s.role.toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminDashboard() {
  return (
    <div className="space-y-3">
      <Suspense fallback={<WelcomeShell />}>
        <DashboardWelcomeAndStats />
      </Suspense>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityShell />}>
            <DashboardActivity />
          </Suspense>
        </div>
        <QuickActionsCard />
      </div>

      <Suspense fallback={<SignupsShell />}>
        <DashboardRecentSignups />
      </Suspense>
    </div>
  );
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
