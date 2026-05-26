import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Calendar,
  Trophy,
  TrendingUp,
  ArrowRight,
  Flame,
} from "lucide-react";
import { CountUp } from "@/components/count-up";

export const revalidate = 30;

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = session.user.id;
  const userName = session.user.name ?? "Student";

  const [enrollments, totalAttendance] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: { course: { include: { teacher: { select: { name: true } } } } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.attendance.count({
      where: { studentId: userId, status: "PRESENT" },
    }),
  ]);

  const enrolledCount = enrollments.length;
  const avgProgress =
    enrolledCount === 0
      ? 0
      : Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrolledCount);

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: enrolledCount, trend: enrolledCount > 0 ? "Active" : "Start learning" },
    { icon: Calendar, label: "Classes Attended", value: totalAttendance, trend: "Total" },
    { icon: Trophy, label: "Avg Progress", value: avgProgress, suffix: "%", trend: "Across all courses" },
    { icon: Flame, label: "Day Streak", value: 0, trend: "Keep going!" },
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
        <div className="relative">
          <p className="text-sm text-primary-foreground/80">Assalamu Alaikum,</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-primary-foreground">
            {userName} 👋
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80 max-w-xl">
            {enrolledCount === 0 ? (
              <>
                Welcome to your learning journey! Start by browsing the{" "}
                <Link href="/app/student/catalog" className="font-bold underline text-[hsl(var(--gold))]">
                  course catalog
                </Link>{" "}
                and enrolling in your first course.
              </>
            ) : (
              <>
                You&apos;re enrolled in{" "}
                <span className="font-bold text-[hsl(var(--gold))]">
                  {enrolledCount} {enrolledCount === 1 ? "course" : "courses"}
                </span>
                . Keep up the great work!
              </>
            )}
          </p>
          <Link
            href={enrolledCount === 0 ? "/app/student/catalog" : "/app/student/courses"}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/25 transition-all"
          >
            {enrolledCount === 0 ? "Browse Courses" : "Continue Learning"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 stagger-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <s.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-[hsl(var(--gold))]" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight">
              <CountUp end={s.value} suffix={s.suffix ?? ""} />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <p className="text-[11px] text-primary mt-2 font-medium">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Your Courses</h2>
          {enrolledCount > 0 && (
            <Link
              href="/app/student/courses"
              className="text-xs font-semibold text-primary hover:text-accent"
            >
              View all
            </Link>
          )}
        </div>

        {enrolledCount === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link
              href="/app/student/catalog"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {enrollments.slice(0, 5).map((e) => (
              <div key={e.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{e.course.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {e.course.teacher?.name ?? "Teacher TBA"} · {e.course.level}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{e.progress}%</p>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
