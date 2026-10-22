import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MOCK_RECENT_SIGNUPS } from "../_mock-data";
// The layout warms this same cache, so the page doesn't keep its own copy
import { getCachedDashboard } from "../_caches";
import { pktDayYmd } from "@/lib/pkt-day";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  BookOpen,
  PlusCircle,
  UserCheck,
  Inbox,
  CalendarCheck,
  Video,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Avatar } from "@/components/avatar";

// Colours come from the theme tokens, which is the dark look. In light mode
// the admin shell turns them the website's navy, gold and cream, and the `adm-*`
// hook classes (globals.css) add the white cards and the navy first stat card.

// "At a glance" counts for the activity card: work waiting for the admin and
// how today is going. Keyed by the PKT day ("YYYY-MM-DD") so it rolls over at
// midnight Pakistan time, and kept for a minute only.
const getCachedToday = unstable_cache(
  async (ymd: string) => {
    const today = new Date(`${ymd}T00:00:00.000Z`); // PKT day, stored as midnight UTC
    const [enrollRequests, trialRequests, classesToday, classesMarked, teachersSignedIn] = await Promise.all([
      prisma.enrollmentRequest.count({ where: { inTrials: false, convertedAt: null } }),
      prisma.enrollmentRequest.count({ where: { inTrials: true, convertedAt: null } }),
      prisma.bookingSlot.count({ where: { dayOfWeek: today.getUTCDay() } }),
      prisma.bookingAttendance.count({ where: { date: today } }),
      prisma.teacherAttendance.count({ where: { date: today } }),
    ]);
    return { enrollRequests, trialRequests, classesToday, classesMarked, teachersSignedIn };
  },
  ["admin-dashboard-today"],
  { revalidate: 60 }
);

// Rendered per request, not at build time (the build has no database);
// the data itself stays cached for 10 minutes by unstable_cache above.
export const dynamic = "force-dynamic";

// â”€â”€â”€ Static sections (render with no DB wait) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function QuickActionsCard() {
  const actions = [
    { href: "/app/admin/courses", icon: PlusCircle, title: "Add a new course", cta: "Manage courses" },
    { href: "/app/admin/teachers", icon: UserPlus, title: "Invite a teacher", cta: "Teachers panel" },
    { href: "/app/admin/students", icon: UserCheck, title: "View all students", cta: "Students panel" },
  ];
  return (
    <div className="adm-glass rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Quick Actions</h2>
      </div>
      <div className="space-y-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="adm-tile flex items-center gap-2.5 rounded-xl border border-border bg-background p-2 hover:border-primary/40 transition-colors"
          >
            <div className="adm-icon grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <a.icon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold">{a.title}</p>
              <p className="text-[11px] text-primary font-bold">{a.cta} →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ Shell fallbacks (structural, no pulsing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatsShell() {
  const statLabels = [
    { icon: GraduationCap, label: "Total Students" },
    { icon: Users, label: "Active Teachers" },
    { icon: BookOpen, label: "Active Courses" },
    { icon: DollarSign, label: "Monthly Revenue" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {statLabels.map(({ icon: Icon, label }, i) => (
        <div
          key={label}
          className={`${i === 0 ? "adm-hero" : "adm-glass"} flex flex-col rounded-xl border border-border bg-card p-2.5`}
        >
          <div className="flex items-start justify-between">
            <div className="adm-icon adm-chip grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="adm-arrow relative grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-auto pt-2 text-base font-bold text-muted-foreground/40">—</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

function ActivityShell() {
  return (
    <div className="adm-glass rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold">Platform Activity</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recent enrollments overview</p>
        </div>
      </div>
      <div className="adm-tile rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">Enrollment Capacity</span>
          <span className="text-xs font-bold text-muted-foreground/40">— / —</span>
        </div>
        <div className="adm-track h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-0 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>
      <GlanceGrid />
    </div>
  );
}

function SignupsShell() {
  return (
    <div className="adm-glass rounded-xl border border-border bg-card p-3">
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

async function DashboardStats() {
  const { totalStudents, totalTeachers, totalCourses, monthlyRevenue } = await getCachedDashboard();

  const stats = [
    { icon: GraduationCap, label: "Total Students", value: totalStudents, prefix: "", suffix: "" },
    { icon: Users, label: "Active Teachers", value: totalTeachers, prefix: "", suffix: "" },
    { icon: BookOpen, label: "Active Courses", value: totalCourses, prefix: "", suffix: "" },
    { icon: DollarSign, label: "Monthly Revenue", value: Math.round(monthlyRevenue), prefix: "$", suffix: "" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {stats.map((s, i) => (
        <div
          key={s.label}
          // Light mode: the first card is navy with a gold number (adm-hero), the rest white
          className={`${i === 0 ? "adm-hero" : "adm-glass"} group flex flex-col rounded-xl border border-border bg-card p-2.5 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all stagger-item`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="adm-icon adm-chip grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <s.icon className="h-3.5 w-3.5" />
            </div>
            {/* fills with the gradient on hover (light mode: .adm-arrow) */}
            <span className="adm-arrow relative grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </div>
          <p className="mt-auto pt-2 text-base font-bold">
            <CountUp end={s.value} prefix={s.prefix} suffix={s.suffix} />
          </p>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

async function DashboardActivity() {
  const [{ totalEnrollments, totalCourses, totalTeachers }, today] = await Promise.all([
    getCachedDashboard(),
    getCachedToday(pktDayYmd()),
  ]);
  const glance: GlanceItem[] = [
    {
      href: "/app/admin/enrollments",
      icon: Inbox,
      value: today.enrollRequests,
      label: "Enroll requests",
      sub: "Waiting for review",
      attention: today.enrollRequests > 0,
    },
    {
      href: "/app/admin/trials",
      icon: CalendarCheck,
      value: today.trialRequests,
      label: "Free trials",
      sub: "Requests in progress",
      attention: today.trialRequests > 0,
    },
    {
      href: "/app/admin/classes",
      icon: Video,
      value: today.classesToday,
      label: "Classes today",
      sub: `${today.classesMarked} marked so far`,
    },
    {
      href: "/app/admin/teacher-attendance",
      icon: CalendarClock,
      value: `${today.teachersSignedIn}/${totalTeachers}`,
      label: "Teachers signed in",
      sub: "Today's attendance",
    },
  ];
  return (
    <div className="adm-glass rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold">Platform Activity</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recent enrollments overview</p>
        </div>
        <div className="adm-pill inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
          <TrendingUp className="h-3 w-3" /> {totalEnrollments} total
        </div>
      </div>
      <div className="adm-tile rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">Enrollment Capacity</span>
          <span className="text-xs font-bold">{totalEnrollments} / {totalCourses * 50}</span>
        </div>
        <div className="adm-track h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
            style={{ width: `${Math.min(100, (totalEnrollments / Math.max(totalCourses * 50, 1)) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">Based on max 50 students per course</p>
      </div>
      <GlanceGrid items={glance} />
    </div>
  );
}

type GlanceItem = {
  href: string;
  icon: LucideIcon;
  value: number | string;
  label: string;
  sub: string;
  // Something is waiting for the admin: shows a small amber dot
  attention?: boolean;
};

// 2×2 tiles under Enrollment Capacity; each opens the page that handles it.
// Without items it renders the same tiles empty, for the loading shell.
function GlanceGrid({ items }: { items?: GlanceItem[] }) {
  const placeholders: GlanceItem[] = [
    { href: "/app/admin/enrollments", icon: Inbox, value: "—", label: "Enroll requests", sub: "Waiting for review" },
    { href: "/app/admin/trials", icon: CalendarCheck, value: "—", label: "Free trials", sub: "Requests in progress" },
    { href: "/app/admin/classes", icon: Video, value: "—", label: "Classes today", sub: "—" },
    { href: "/app/admin/teacher-attendance", icon: CalendarClock, value: "—", label: "Teachers signed in", sub: "Today's attendance" },
  ];
  return (
    <div className="mt-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">At a glance</p>
      <div className="grid grid-cols-2 gap-2">
        {(items ?? placeholders).map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="adm-tile group relative flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 hover:border-primary/40 transition-colors"
          >
            <div className="adm-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <g.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`pr-[28px] text-base font-bold leading-tight ${items ? "" : "text-muted-foreground/40"}`}>{g.value}</p>
              <p className="truncate text-[11px] font-semibold">{g.label}</p>
              <p className="truncate text-[10px] text-muted-foreground">{g.sub}</p>
            </div>
            {/* Top-right corner: the "needs attention" dot, then an arrow that
                fills with the gradient on hover (light mode: .adm-arrow) */}
            <span className="absolute right-[8px] top-[8px] flex items-center gap-[6px]">
              {g.attention && (
                <span className="h-2 w-2 rounded-full bg-amber-500" title="Needs attention" />
              )}
              <span className="adm-arrow relative grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function DashboardRecentSignups() {
  const { recentSignups } = await getCachedDashboard();
  const signups = recentSignups.length > 0 ? recentSignups : MOCK_RECENT_SIGNUPS;
  return (
    <div className="adm-glass flex flex-col rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold">Recent Signups</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Latest user registrations</p>
        </div>
        <Link href="/app/admin/students" className="adm-badge rounded-full px-[10px] py-[4px] text-[11px] font-semibold text-primary hover:text-accent transition-[filter,box-shadow]">
          View all
        </Link>
      </div>
      {/* A window of 5 rows; more scroll inside it, with the thin scrollbar
          (.scroller) and room kept for it. Stacked (below lg): 5 rows of
          44px, 4px apart. Beside Platform Activity (lg), the card is
          stretched to that card's height, so the window fills the rest of
          it and each row takes a fifth (size containment: cqh is the
          window's own height, and its rows don't make the card taller).
          pb-[2px]: the last row's divider hangs 2px below it and would
          otherwise make a short list scroll. */}
      <div
        className={`scroller max-h-[238px] space-y-1 overflow-y-auto pb-[2px] lg:max-h-none lg:min-h-0 lg:flex-1 lg:[container-type:size] ${
          signups.length > 5 ? "pr-[6px]" : ""
        }`}
      >
        {signups.map((s, i) => (
          <div
            key={s.id}
            className="relative flex h-[44px] items-center gap-2 rounded-lg hover:bg-muted/30 p-1.5 transition-colors stagger-item lg:h-[max(44px,calc((100cqh-16px)/5))]"
            // the ones below the window come in with the 5th
            style={{ animationDelay: `${Math.min(i, 4) * 60 + 200}ms` }}
          >
            {/* Light mode: a thin navy line under the row, fading at both ends (globals.css) */}
            <span aria-hidden="true" className="adm-divider pointer-events-none absolute -bottom-[2px] left-[10%] right-[25%] h-px" />
            <Avatar name={s.name} size={28} style="micah" />
            <div className="flex-1 min-w-0">
              {/* truncate: the column is half width now, long emails get "…" */}
              <p className="truncate text-xs font-semibold">{s.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{s.email} · {s.country ?? s.role}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{timeAgo(s.createdAt)}</span>
            <span className="adm-badge rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary inline-flex items-center gap-0.5">
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
    // adm-night: the black-and-gold dark mode (globals.css), page by page
    <div className="adm-night space-y-3">
      {/* Stats as a 2×2 grid on the left, Quick Actions beside it */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<StatsShell />}>
            <DashboardStats />
          </Suspense>
        </div>
        <QuickActionsCard />
      </div>

      {/* Platform Activity on the left, Recent Signups on the right */}
      <div className="grid lg:grid-cols-2 gap-3">
        <Suspense fallback={<ActivityShell />}>
          <DashboardActivity />
        </Suspense>

        <Suspense fallback={<SignupsShell />}>
          <DashboardRecentSignups />
        </Suspense>
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
