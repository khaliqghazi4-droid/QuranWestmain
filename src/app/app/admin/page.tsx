import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Avatar } from "@/components/avatar";

export const revalidate = 30;

export default async function AdminDashboard() {
  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.enrollment.count(),
    prisma.user.findMany({
      where: { role: { in: ["STUDENT", "TEACHER"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, country: true, createdAt: true },
    }),
  ]);

  // Revenue estimate: sum of all enrolled course prices
  const revenueAgg = await prisma.enrollment.findMany({
    include: { course: { select: { price: true } } },
  });
  const monthlyRevenue = revenueAgg.reduce((sum, e) => sum + e.course.price, 0);

  const stats = [
    { icon: GraduationCap, label: "Total Students", value: totalStudents, prefix: "", suffix: "" },
    { icon: Users, label: "Active Teachers", value: totalTeachers, prefix: "", suffix: "" },
    { icon: BookOpen, label: "Active Courses", value: totalCourses, prefix: "", suffix: "" },
    { icon: DollarSign, label: "Monthly Revenue", value: Math.round(monthlyRevenue), prefix: "$", suffix: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-6 sm:p-8 shadow-xl shadow-primary/20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl animate-float-slow" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl animate-float" />
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-primary-foreground/80">Welcome back,</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-primary-foreground">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/80 max-w-xl">
              You have <span className="font-bold text-[hsl(var(--gold))]">{totalStudents}</span> students,{" "}
              <span className="font-bold text-[hsl(var(--gold))]">{totalTeachers}</span> teachers, and{" "}
              <span className="font-bold text-[hsl(var(--gold))]">{totalEnrollments}</span> total enrollments.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/app/admin/courses" className="rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/25">
              Manage Courses
            </Link>
            <Link href="/app/admin/students" className="rounded-full bg-[hsl(var(--gold))] px-4 py-2 text-sm font-bold text-[hsl(220_32%_10%)] shadow-md hover:shadow-lg transition-all">
              View Students
            </Link>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all stagger-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                Live
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold">
              <CountUp end={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Platform Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Recent enrollments overview</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3 w-3" /> {totalEnrollments} total
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Enrollment Capacity</span>
              <span className="text-sm font-bold">
                {totalEnrollments} / {totalCourses * 50}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (totalEnrollments / Math.max(totalCourses * 50, 1)) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Based on max 50 students per course
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Quick Actions</h2>
            <AlertCircle className="h-4 w-4 text-[hsl(var(--gold))]" />
          </div>
          <div className="space-y-2">
            <Link
              href="/app/admin/courses"
              className="block rounded-xl border border-border bg-background p-3 hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-medium">📚 Add a new course</p>
              <p className="text-[11px] text-primary mt-1 font-bold">Manage courses →</p>
            </Link>
            <Link
              href="/app/admin/teachers"
              className="block rounded-xl border border-border bg-background p-3 hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-medium">👨‍🏫 Invite a teacher</p>
              <p className="text-[11px] text-primary mt-1 font-bold">Teachers panel →</p>
            </Link>
            <Link
              href="/app/admin/students"
              className="block rounded-xl border border-border bg-background p-3 hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-medium">🎓 View all students</p>
              <p className="text-[11px] text-primary mt-1 font-bold">Students panel →</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">Recent Signups</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest user registrations</p>
          </div>
          <Link href="/app/admin/students" className="text-xs font-semibold text-primary hover:text-accent">
            View all
          </Link>
        </div>

        {recentSignups.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No signups yet</p>
        ) : (
          <div className="space-y-2">
            {recentSignups.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-xl hover:bg-muted/30 p-3 transition-colors stagger-item"
                style={{ animationDelay: `${i * 60 + 200}ms` }}
              >
                <Avatar name={s.name} size={40} style="micah" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.email} · {s.country ?? s.role}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(s.createdAt)}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary inline-flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> {s.role.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
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
