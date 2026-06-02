import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar } from "@/components/avatar";
import { pktDayMidnightUTC, pktDayYmd } from "@/lib/pkt-day";
import {
  CheckCircle2,
  XCircle,
  Clock,
  CalendarClock,
  LogIn,
  LogOut,
} from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS_TO_SHOW = 7;

function fmtTime(d: Date | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtDuration(ms: number) {
  if (ms <= 0) return "0m";
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default async function AdminTeacherAttendancePage() {
  const today = pktDayMidnightUTC();
  const since = new Date(today.getTime() - (DAYS_TO_SHOW - 1) * 24 * 60 * 60 * 1000);

  // Build the date column list (oldest first)
  const days: { date: Date; ymd: string; label: string; isToday: boolean }[] = [];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    days.push({
      date: d,
      ymd: pktDayYmd(d),
      label: d.toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isToday: d.getTime() === today.getTime(),
    });
  }

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

  // Map: teacherId → ymd → record
  const map = new Map<string, Map<string, (typeof records)[number]>>();
  for (const r of records) {
    const inner = map.get(r.teacherId) ?? new Map();
    inner.set(pktDayYmd(r.date), r);
    map.set(r.teacherId, inner);
  }

  const signedInToday = records.filter(
    (r) => r.date.getTime() === today.getTime()
  ).length;
  const signedOutToday = records.filter(
    (r) => r.date.getTime() === today.getTime() && r.signOutAt
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Attendance"
        description={`Daily sign-in / sign-out · last ${DAYS_TO_SHOW} days (PKT)`}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={CalendarClock} label="Teachers" value={teachers.length} className="from-primary to-accent" />
        <Stat icon={LogIn} label="Signed in today" value={signedInToday} className="from-emerald-500 to-teal-500" />
        <Stat icon={LogOut} label="Signed out today" value={signedOutToday} className="from-fuchsia-500 to-purple-500" />
        <Stat icon={XCircle} label="Absent today" value={teachers.length - signedInToday} className="from-destructive to-rose-500" />
      </div>

      {teachers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">No teachers in the academy yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">
                    Teacher
                  </th>
                  {days.map((d) => (
                    <th
                      key={d.ymd}
                      className={`px-3 py-3 font-semibold text-center whitespace-nowrap uppercase tracking-wide ${
                        d.isToday
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {d.label}
                      {d.isToday && (
                        <span className="block text-[9px] font-bold text-primary">
                          TODAY
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teachers.map((t) => {
                  const teacherRecords = map.get(t.id) ?? new Map();
                  let weekMs = 0;
                  for (const r of teacherRecords.values()) {
                    if (r.signOutAt) {
                      weekMs += r.signOutAt.getTime() - r.signInAt.getTime();
                    }
                  }
                  return (
                    <tr key={t.id} className="hover:bg-muted/20">
                      <td className="sticky left-0 z-10 bg-card px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <Avatar name={t.name} size={36} style="micah" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Week total:{" "}
                              <span className="font-bold text-foreground">{fmtDuration(weekMs)}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      {days.map((d) => {
                        const r = teacherRecords.get(d.ymd);
                        return (
                          <td key={d.ymd} className="px-2 py-3 align-top">
                            {r ? (
                              <div
                                className={`rounded-lg px-2 py-1.5 ${
                                  r.signOutAt
                                    ? "bg-emerald-500/10 border border-emerald-500/30"
                                    : "bg-primary/10 border border-primary/30"
                                }`}
                              >
                                <div className="text-[10px] inline-flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                  In · {fmtTime(r.signInAt)}
                                </div>
                                {r.signOutAt ? (
                                  <>
                                    <div className="text-[10px] inline-flex items-center gap-1 font-semibold text-muted-foreground mt-0.5">
                                      <LogOut className="h-2.5 w-2.5" />
                                      Out · {fmtTime(r.signOutAt)}
                                    </div>
                                    <div className="text-[10px] font-bold text-foreground mt-0.5 inline-flex items-center gap-1">
                                      <Clock className="h-2.5 w-2.5" />
                                      {fmtDuration(
                                        r.signOutAt.getTime() - r.signInAt.getTime()
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-[10px] text-primary font-bold mt-0.5">
                                    still in
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-border px-2 py-1.5 text-center text-[10px] text-muted-foreground italic">
                                Absent
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${className} text-primary-foreground shadow-md`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
