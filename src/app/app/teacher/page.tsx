import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Users,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Star,
  Award,
  Calendar,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Avatar } from "@/components/avatar";
import { DAYS } from "@/lib/timezones";
import { formatSlotRange, SHIFT_RANGES, type Shift } from "@/lib/shifts";
import { pktDayMidnightUTC } from "@/lib/pkt-day";
import { TeacherWorkdayCard } from "@/components/teacher/workday-card";
import { WeekAttendanceStrip } from "@/components/teacher/week-attendance-strip";
import { getTeacherDashboardData } from "./_caches";

export const revalidate = 30;

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;
  const teacherName = session.user.name ?? "Teacher";

  // Keyed by today's PKT date so the workday card + 7-day strip roll over at midnight
  const today = pktDayMidnightUTC();
  const { shift: myShift, courses, enrollments, bookings, workdayInitial, weekDays, weekHours } =
    await getTeacherDashboardData(teacherId, today.toISOString());

  const totalStudents = new Set(enrollments.map((e) => e.student.id)).size;
  const totalCourses = courses.length;
  const shift = myShift as Shift | null;

  // Group bookings by day for the weekly schedule
  const bookingsByDay = DAYS.map((d) => ({
    day: d,
    slots: bookings.filter((b) => b.dayOfWeek === d.id),
  }));

  const stats = [
    { icon: Users, label: "Active Students", value: totalStudents, trend: totalStudents > 0 ? "Currently teaching" : "No students yet" },
    { icon: BookOpen, label: "My Courses", value: totalCourses, trend: "Assigned to you" },
    { icon: Star, label: "Average Rating", value: 4.9, decimals: 1, trend: "Coming soon" },
    { icon: Award, label: "Total Enrollments", value: enrollments.length, trend: "All time" },
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
          <div className="flex items-center gap-2">
            <p className="text-sm text-primary-foreground/80">Assalamu Alaikum,</p>
            {shift && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {shift === "DAY" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                {SHIFT_RANGES[shift].label}
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-primary-foreground">
            {teacherName} 👋
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80 max-w-xl">
            {totalCourses === 0 ? (
              <>You have no courses assigned yet. Please contact the admin to get courses assigned.</>
            ) : totalStudents === 0 ? (
              <>You teach <span className="font-bold text-[hsl(var(--gold))]">{totalCourses}</span> {totalCourses === 1 ? "course" : "courses"} but no students have enrolled yet.</>
            ) : (
              <>
                You&apos;re teaching{" "}
                <span className="font-bold text-[hsl(var(--gold))]">{totalStudents}</span>{" "}
                {totalStudents === 1 ? "student" : "students"} across{" "}
                <span className="font-bold text-[hsl(var(--gold))]">{totalCourses}</span>{" "}
                {totalCourses === 1 ? "course" : "courses"}.
              </>
            )}
          </p>
          <Link
            href="/app/teacher/students"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/25 transition-all"
          >
            View Students
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <TeacherWorkdayCard initial={workdayInitial} />

      {/* My weekly attendance history */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> My Attendance — Last 7 Days
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PKT calendar days · admin sees the same record
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Clock className="h-3 w-3" />
            {(() => {
              const m = Math.round(weekHours / 60000);
              const h = Math.floor(m / 60);
              const mm = m % 60;
              return `${h}h ${mm}m this week`;
            })()}
          </span>
        </div>
        <WeekAttendanceStrip days={weekDays} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 stagger-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <s.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-[hsl(var(--gold))]" />
            </div>
            <p className="mt-4 text-3xl font-bold">
              <CountUp end={s.value} decimals={s.decimals ?? 0} />
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-[11px] text-primary mt-2 font-medium">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Weekly booked schedule */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold inline-flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> My Weekly Schedule
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bookings.length === 0
                ? "No classes booked yet — the admin assigns students to your slots"
                : `${bookings.length} recurring 30-min ${bookings.length === 1 ? "class" : "classes"} per week · all times PKT`}
            </p>
          </div>
          {!shift && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold)/0.12)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--gold))]">
              No shift assigned yet
            </span>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">
              When the admin books a student into one of your time slots, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {bookingsByDay.map(({ day, slots }) => (
              <div
                key={day.id}
                className="rounded-xl border border-border bg-background p-3 min-h-[80px]"
              >
                <p className="text-xs font-bold text-foreground mb-2">{day.short}</p>
                {slots.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">Free</p>
                ) : (
                  <div className="space-y-1.5">
                    {slots.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-lg bg-primary/5 border border-primary/20 p-2"
                      >
                        <p className="text-[11px] font-bold text-primary inline-flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatSlotRange(b.startTime)}
                        </p>
                        <p className="text-[11px] font-semibold mt-1 truncate">
                          {b.enrollment.student.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {b.enrollment.course.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">My Courses</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Courses you teach</p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">
                No courses assigned. Ask the admin to assign you to a course.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-all stagger-item"
                  style={{ animationDelay: `${i * 80 + 200}ms` }}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {c._count.enrollments} students
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-semibold">
                        {c.level}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-primary">${c.price}/mo</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Recent Students</h2>
            <Link href="/app/teacher/students" className="text-xs font-semibold text-primary hover:text-accent">
              View all
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No students enrolled yet
            </p>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((e, i) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 stagger-item"
                  style={{ animationDelay: `${i * 80 + 300}ms` }}
                >
                  <Avatar name={e.student.name} size={40} style="avataaars" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{e.student.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {e.course.name}
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                        style={{ width: `${e.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
