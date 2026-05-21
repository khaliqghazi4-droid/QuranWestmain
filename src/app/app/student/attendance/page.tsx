import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { CheckCircle2, XCircle, Clock, Calendar, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentAttendance() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const records = await prisma.attendance.findMany({
    where: { studentId: session.user.id },
    include: {
      class: {
        include: {
          course: {
            select: { name: true, teacher: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { class: { startTime: "desc" } },
    take: 100,
  });

  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const overall = total === 0 ? 0 : Math.round(((present + late * 0.5) / total) * 100);

  const statusConfig = {
    PRESENT: { icon: CheckCircle2, label: "Present", color: "text-emerald-600 bg-emerald-500/10" },
    ABSENT: { icon: XCircle, label: "Absent", color: "text-destructive bg-destructive/10" },
    LATE: { icon: Clock, label: "Late", color: "text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.1)]" },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={
          total === 0
            ? "Your attendance records will appear here once your teacher marks them"
            : `${total} class records · ${overall}% overall attendance`
        }
      />

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Overall", value: `${overall}%`, icon: TrendingUp, color: "from-primary to-accent" },
          { label: "Present", value: present, icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
          { label: "Late", value: late, icon: Clock, color: "from-[hsl(var(--gold))] to-amber-500" },
          { label: "Absent", value: absent, icon: XCircle, color: "from-red-500 to-pink-500" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all stagger-item"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-primary-foreground shadow-md`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold">Attendance Records</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recent class attendance
          </p>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">No attendance records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Class</th>
                  <th className="px-6 py-3 font-semibold">Course</th>
                  <th className="px-6 py-3 font-semibold">Teacher</th>
                  <th className="px-6 py-3 font-semibold">Duration</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r, i) => {
                  const cfg = statusConfig[r.status];
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/20 transition-colors stagger-item"
                      style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {r.class.startTime.toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{r.class.title}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {r.class.course.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {r.class.course.teacher?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {r.class.duration} min
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.color}`}
                        >
                          <cfg.icon className="h-3 w-3" /> {cfg.label}
                        </span>
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
