﻿import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar } from "@/components/avatar";
import { pktDayMidnightUTC } from "@/lib/pkt-day";
import { buildWeekDays, weekTotalMs } from "@/lib/attendance-week";
import { WeekAttendanceStrip } from "@/components/teacher/week-attendance-strip";
import {
  CalendarClock,
  LogIn,
  LogOut,
  XCircle,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { SHIFT_RANGES, type Shift } from "@/lib/shifts";

export const revalidate = 600;

const DAYS_TO_SHOW = 7;

function fmtDuration(ms: number) {
  if (ms <= 0) return "0h";
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const getCachedAttendance = unstable_cache(
  async () => {
    const today = pktDayMidnightUTC();
    const since = new Date(today.getTime() - (DAYS_TO_SHOW - 1) * 24 * 60 * 60 * 1000);

    const [teachers, records] = await Promise.all([
      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true, email: true, country: true, shift: true },
        orderBy: { name: "asc" },
      }),
      prisma.teacherAttendance.findMany({
        where: { date: { gte: since, lte: today } },
      }),
    ]);

    return {
      teachers,
      records: records.map((r) => ({
        ...r,
        date: new Date(r.date).toISOString(),
        signInAt: new Date(r.signInAt).toISOString(),
        signOutAt: r.signOutAt ? new Date(r.signOutAt).toISOString() : null,
      })),
      todayISO: today.toISOString(),
    };
  },
  ["admin-teacher-attendance"],
  { revalidate: 600 }
);

export default function AdminTeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Attendance"
        description={`Daily sign-in / sign-out · last ${DAYS_TO_SHOW} PKT days`}
      />
      <Suspense fallback={<AttendanceShell />}>
        <AttendanceData />
      </Suspense>
    </div>
  );
}

async function AttendanceData() {
  const { teachers, records, todayISO } = await getCachedAttendance();
  const todayTime = new Date(todayISO).getTime();

  const byTeacher = new Map<string, typeof records>();
  for (const r of records) {
    const arr = byTeacher.get(r.teacherId) ?? [];
    arr.push(r);
    byTeacher.set(r.teacherId, arr);
  }

  const signedInToday = records.filter((r) => new Date(r.date).getTime() === todayTime).length;
  const stillWorking = records.filter((r) => new Date(r.date).getTime() === todayTime && !r.signOutAt).length;
  const signedOutToday = records.filter((r) => new Date(r.date).getTime() === todayTime && r.signOutAt).length;
  const absentToday = teachers.length - signedInToday;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={CalendarClock} label="Teachers" value={teachers.length} accent="from-primary to-accent" />
        <Stat icon={LogIn} label="Signed in today" value={signedInToday} accent="from-emerald-500 to-teal-500" />
        <Stat icon={LogOut} label="Still working" value={stillWorking} sub={`${signedOutToday} signed out`} accent="from-fuchsia-500 to-purple-500" />
        <Stat icon={XCircle} label="Absent today" value={absentToday} accent="from-destructive to-rose-500" />
      </div>

      {teachers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">No teachers in the academy yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => {
            const rawRecords = byTeacher.get(t.id) ?? [];
            const teacherRecords = rawRecords.map((r) => ({
              ...r,
              date: new Date(r.date),
              signInAt: new Date(r.signInAt),
              signOutAt: r.signOutAt ? new Date(r.signOutAt) : null,
            }));
            const days = buildWeekDays(teacherRecords, DAYS_TO_SHOW);
            const weekMs = weekTotalMs(teacherRecords);
            const daysPresent = teacherRecords.length;
            const shift = t.shift as Shift | null;

            return (
              <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <Avatar name={t.name} size={44} style="micah" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold truncate">{t.name}</p>
                      {shift && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {shift === "DAY" ? <Sun className="h-2.5 w-2.5" /> : <Moon className="h-2.5 w-2.5" />}
                          {SHIFT_RANGES[shift].label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.email}{t.country ? ` · ${t.country}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-center">
                      <p className="text-[9px] uppercase font-semibold text-primary tracking-wide">Week total</p>
                      <p className="text-sm font-bold text-primary inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {fmtDuration(weekMs)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-center">
                      <p className="text-[9px] uppercase font-semibold text-emerald-600 tracking-wide">Days</p>
                      <p className="text-sm font-bold text-emerald-600">{daysPresent} / {DAYS_TO_SHOW}</p>
                    </div>
                  </div>
                </div>
                <WeekAttendanceStrip days={days} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function AttendanceShell() {
  const statLabels = ["Teachers", "Signed in today", "Still working", "Absent today"];
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statLabels.map((label) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <div className="h-10 w-10 rounded-lg bg-muted/20 border border-border mb-2" />
            <p className="text-2xl font-bold text-muted-foreground/40">—</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-full bg-muted/30 border border-border shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium text-muted-foreground/40">—</div>
                <div className="text-[11px] text-muted-foreground/30">—</div>
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="flex-1 h-8 rounded-lg bg-muted/20 border border-border" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${accent} text-primary-foreground shadow-md`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
