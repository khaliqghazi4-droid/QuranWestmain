import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Video, Clock, Calendar, ExternalLink, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentSchedule() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((e) => e.courseId);

  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  const classes = await prisma.class.findMany({
    where: {
      courseId: { in: courseIds },
      startTime: { gte: now, lte: next30Days },
    },
    include: {
      course: {
        select: { id: true, name: true, level: true, teacher: { select: { name: true } } },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Group by day
  const byDay = new Map<string, typeof classes>();
  for (const c of classes) {
    const dayKey = c.startTime.toDateString();
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(c);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Schedule"
        description={
          classes.length === 0
            ? "No upcoming classes — enroll in courses to see your schedule"
            : `${classes.length} upcoming ${classes.length === 1 ? "class" : "classes"} in the next 30 days`
        }
      />

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-bold">Not enrolled in any course</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the catalog and enroll to start receiving classes
          </p>
          <Link
            href="/app/student/catalog"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md"
          >
            Browse Catalog
          </Link>
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-bold">No classes scheduled yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your teachers will schedule classes soon. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(byDay.entries()).map(([dayKey, dayClasses]) => {
            const day = new Date(dayKey);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={dayKey} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`p-4 border-b border-border ${isToday ? "bg-gradient-to-r from-primary/10 to-accent/10" : "bg-muted/30"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold inline-flex items-center gap-2">
                        {day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        {isToday && (
                          <span className="rounded-full bg-[hsl(var(--gold))] px-2 py-0.5 text-[10px] font-bold text-[hsl(220_32%_10%)]">
                            TODAY
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {dayClasses.map((c, i) => {
                    const start = new Date(c.startTime);
                    const startingSoon = isToday && start.getTime() - Date.now() < 30 * 60 * 1000 && start.getTime() > Date.now();
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors stagger-item"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="text-center min-w-[64px]">
                          <p className="text-xs font-bold text-muted-foreground uppercase">
                            {start.toLocaleString("en-US", { hour: "numeric", hour12: true, minute: "2-digit" }).split(" ")[1]}
                          </p>
                          <p className="text-base font-bold">
                            {start.toLocaleString("en-US", { hour: "numeric", hour12: true }).split(" ")[0]}:{start.getMinutes().toString().padStart(2, "0")}
                          </p>
                        </div>
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shrink-0">
                          <Video className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{c.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {c.course.name} · with {c.course.teacher?.name ?? "TBA"}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {c.duration} min
                            </span>
                          </div>
                        </div>
                        {c.meetingUrl ? (
                          <a
                            href={c.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-md transition-all ${
                              startingSoon
                                ? "bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)] animate-glow"
                                : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
                            }`}
                          >
                            {startingSoon ? "Join Now" : "Join"}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Link coming soon
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
