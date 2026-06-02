import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Clock,
  LogIn,
  LogOut,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import { pktDayMidnightUTC } from "@/lib/pkt-day";
import {
  workdayMetrics,
  shiftLabel,
  fmtDurationHM,
  fmtMinutes,
  fmtPKT,
  fmtUK,
  type ShiftKind,
} from "@/lib/workday-metrics";
import { TeacherWorkdayCard } from "@/components/teacher/workday-card";

export const dynamic = "force-dynamic";

const DAYS_TO_SHOW = 30;

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function TeacherMyWorkdayPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;
  const today = pktDayMidnightUTC();
  const since = new Date(today.getTime() - (DAYS_TO_SHOW - 1) * 24 * 60 * 60 * 1000);

  const [me, records] = await Promise.all([
    prisma.user.findUnique({ where: { id: teacherId }, select: { shift: true } }),
    prisma.teacherAttendance.findMany({
      where: { teacherId, date: { gte: since, lte: today } },
      orderBy: { date: "desc" },
    }),
  ]);

  const shift = (me?.shift as ShiftKind) ?? null;
  const todayRecord = records.find((r) => r.date.getTime() === today.getTime()) ?? null;
  const todayMetrics = workdayMetrics(todayRecord, today, shift);

  const workdayInitial = {
    signedIn: !!todayRecord,
    signedOut: !!todayRecord?.signOutAt,
    signInAt: todayRecord?.signInAt.toISOString() ?? null,
    signOutAt: todayRecord?.signOutAt?.toISOString() ?? null,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Workday"
        description={`Office hours: ${shiftLabel(shift)}`}
      />

      {/* Today's card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-bold inline-flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          Today —{" "}
          {today.toLocaleDateString("en-US", {
            timeZone: "UTC",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Check In"
            icon={LogIn}
            tone={todayRecord ? "primary" : "muted"}
            primary={fmtPKT(todayRecord?.signInAt ?? null)}
            primarySub="PKT"
            secondary={todayRecord ? fmtUK(todayRecord.signInAt) : "—"}
            secondarySub="UK"
          />
          <MetricCard
            label="Check Out"
            icon={LogOut}
            tone={todayRecord?.signOutAt ? "primary" : "muted"}
            primary={fmtPKT(todayRecord?.signOutAt ?? null)}
            primarySub="PKT"
            secondary={todayRecord?.signOutAt ? fmtUK(todayRecord.signOutAt) : "—"}
            secondarySub="UK"
          />
          <MetricCard
            label="Late"
            icon={AlertTriangle}
            tone={todayMetrics.lateMin > 0 ? "warn" : "muted"}
            primary={fmtMinutes(todayMetrics.lateMin)}
          />
          <MetricCard
            label="Overtime"
            icon={TrendingUp}
            tone={todayMetrics.overtimeMin > 0 ? "success" : "muted"}
            primary={fmtMinutes(todayMetrics.overtimeMin)}
          />
        </div>

        <div className="mt-5">
          <TeacherWorkdayCard initial={workdayInitial} />
        </div>
      </div>

      {/* Recent records */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-base font-bold inline-flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" /> Recent Records
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last {DAYS_TO_SHOW} PKT days
          </p>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground italic">
            No attendance recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Check In
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Check Out
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Hours
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Late
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Overtime
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => {
                  const m = workdayMetrics(r, r.date, shift);
                  return (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono">{fmtDate(r.date)}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold">
                          {fmtPKT(r.signInAt)}{" "}
                          <span className="text-[10px] text-muted-foreground">PKT</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {fmtUK(r.signInAt)} UK
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.signOutAt ? (
                          <>
                            <div className="font-bold">
                              {fmtPKT(r.signOutAt)}{" "}
                              <span className="text-[10px] text-muted-foreground">PKT</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {fmtUK(r.signOutAt)} UK
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {m.workedMs > 0 ? fmtDurationHM(m.workedMs) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {m.lateMin > 0 ? (
                          <span className="text-destructive font-semibold">
                            {fmtMinutes(m.lateMin)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {m.overtimeMin > 0 ? (
                          <span className="text-emerald-600 font-semibold">
                            {fmtMinutes(m.overtimeMin)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "On Time" | "Late" | "Working" | "Absent" }) {
  const map = {
    "On Time": "bg-emerald-500/15 text-emerald-700",
    Late: "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]",
    Working: "bg-primary/15 text-primary",
    Absent: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${map[status]}`}
    >
      {status}
    </span>
  );
}

function MetricCard({
  label,
  icon: Icon,
  tone,
  primary,
  primarySub,
  secondary,
  secondarySub,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "warn" | "success" | "muted";
  primary: string;
  primarySub?: string;
  secondary?: string;
  secondarySub?: string;
}) {
  const toneCls = {
    primary: "border-primary/30 bg-primary/5",
    warn: "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.08)]",
    success: "border-emerald-500/30 bg-emerald-500/5",
    muted: "border-border bg-background",
  }[tone];

  const iconCls = {
    primary: "text-primary",
    warn: "text-[hsl(var(--gold))]",
    success: "text-emerald-600",
    muted: "text-muted-foreground",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneCls}`}>
      <p className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground inline-flex items-center gap-1">
        <Icon className={`h-3 w-3 ${iconCls}`} /> {label}
      </p>
      <p className="mt-1.5 text-lg font-bold leading-tight">
        {primary}
        {primarySub && (
          <span className="text-[10px] text-muted-foreground font-semibold ml-1">
            {primarySub}
          </span>
        )}
      </p>
      {secondary && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {secondary}
          {secondarySub && <span className="ml-1">{secondarySub}</span>}
        </p>
      )}
    </div>
  );
}
