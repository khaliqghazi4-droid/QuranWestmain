import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Calendar, Clock, Video, Info, User, BookOpen } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { DAYS } from "@/lib/timezones";
import { formatSlotRange, bookingTiming, SHIFT_RANGES, type Shift } from "@/lib/shifts";
import { courseMeetingLink } from "@/lib/meeting";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;

  const [me, bookings] = await Promise.all([
    prisma.user.findUnique({ where: { id: teacherId }, select: { shift: true } }),
    prisma.bookingSlot.findMany({
      where: { teacherId },
      include: {
        enrollment: {
          include: {
            student: { select: { name: true, country: true } },
            course: { select: { id: true, name: true, slug: true, level: true, meetingUrl: true } },
          },
        },
      },
    }),
  ]);

  const shift = me?.shift as Shift | null;

  // Compute next occurrence for each booking and sort soonest-first.
  const classes = bookings
    .map((b) => {
      const timing = bookingTiming(b.dayOfWeek, b.startTime, b.duration);
      return {
        id: b.id,
        dayOfWeek: b.dayOfWeek,
        startTime: b.startTime,
        duration: b.duration,
        student: b.enrollment.student.name,
        country: b.enrollment.student.country,
        courseName: b.enrollment.course.name,
        level: b.enrollment.course.level,
        meetingLink: courseMeetingLink(b.enrollment.course),
        ...timing,
      };
    })
    .sort((a, b) => a.startUTC - b.startUTC);

  const liveNow = classes.filter((c) => c.isLive);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="Classes the admin has booked into your schedule"
      />

      {/* Info banner: teacher cannot self-schedule */}
      <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-foreground">
            Your classes are assigned by the academy admin.
          </p>
          <p className="text-muted-foreground mt-0.5">
            {shift
              ? `You are on the ${SHIFT_RANGES[shift].label} shift. `
              : "No shift assigned yet — ask the admin to set your Day/Night shift. "}
            Each class is a recurring weekly 30-minute lesson. Click <span className="font-semibold text-foreground">Start Class</span> to open the meeting room instantly.
          </p>
        </div>
      </div>

      {/* Live now */}
      {liveNow.length > 0 && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-6">
          <h2 className="text-lg font-bold mb-4 inline-flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live Now
          </h2>
          <div className="space-y-3">
            {liveNow.map((c) => (
              <ClassRow key={c.id} c={c} highlight />
            ))}
          </div>
        </div>
      )}

      {/* All booked classes */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold inline-flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Classes
          </h2>
          <span className="text-xs text-muted-foreground">
            {classes.length} weekly {classes.length === 1 ? "class" : "classes"} · all times PKT
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-semibold">No classes booked yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              When the admin books a student into one of your available time slots, the class will
              appear here automatically with a Start Class button.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((c) => (
              <ClassRow key={c.id} c={c} highlight={c.isLive} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ClassData = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  student: string;
  country: string | null;
  courseName: string;
  level: string;
  meetingLink: string;
  startUTC: number;
  isLive: boolean;
  minutesUntil: number;
  isToday: boolean;
};

function ClassRow({ c, highlight }: { c: ClassData; highlight?: boolean }) {
  const dateLabel = new Date(c.startUTC).toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  let when: string;
  if (c.isLive) when = "Live now";
  else if (c.minutesUntil < 60) when = `in ${c.minutesUntil} min`;
  else if (c.minutesUntil < 24 * 60) when = `in ${Math.round(c.minutesUntil / 60)} h`;
  else when = `in ${Math.round(c.minutesUntil / (60 * 24))} d`;

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
        highlight
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <div
        className={`grid h-12 w-12 place-items-center rounded-xl shadow-md shrink-0 ${
          highlight
            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
            : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
        }`}
      >
        <Video className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> {c.student}
          </p>
          {c.isLive ? (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              LIVE
            </span>
          ) : c.isToday ? (
            <span className="rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--gold))]">
              TODAY
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> {c.courseName}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Calendar className="h-3 w-3" /> {DAYS[c.dayOfWeek].long}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatSlotRange(c.startTime)} PKT
          </span>
          <span className="text-muted-foreground">
            Next: {dateLabel} · {when}
          </span>
        </div>
      </div>

      <a
        href={c.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 ${
          c.isLive
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            : "bg-gradient-to-r from-primary to-accent text-primary-foreground"
        }`}
      >
        <Video className="h-4 w-4" /> Start Class
      </a>
    </div>
  );
}
