import Link from "next/link";
import { getStudentViewer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Video, Clock, Calendar, BookOpen, User, Film } from "lucide-react";
import { bookingTiming } from "@/lib/shifts";
import { DAYS } from "@/lib/timezones";
import {
  MyRecordingsList,
  type MyRecordingItem,
} from "@/components/student/my-recordings-list";

export const revalidate = 30;

// Number of future occurrences (per recurring weekly booking) to surface in
// the upcoming list. 4 covers about a month of classes which matches what
// the page used to advertise.
const OCCURRENCES_PER_BOOKING = 4;

export default async function StudentSchedule() {
  const viewer = await getStudentViewer();
  if (!viewer) return null;

  // Look up the student's recurring weekly classes (BookingSlot rows linked
  // through Enrollment) — this is the real schedule, not the legacy Class
  // model which the academy never actually populates.
  // enrolledCount drives the friendly "enroll first" empty state
  const [bookings, enrolledCount] = await Promise.all([
    prisma.bookingSlot.findMany({
      where: { enrollment: { studentId: viewer.id } },
      include: {
        teacher: { select: { id: true, name: true } },
        enrollment: {
          include: {
            course: { select: { id: true, name: true, slug: true, level: true } },
          },
        },
      },
    }),
    prisma.enrollment.count({ where: { studentId: viewer.id } }),
  ]);

  // Fan out each weekly booking to its next N occurrences so the page can
  // group by day (instead of just showing one row per booking).
  type Occurrence = {
    bookingId: string;
    startUTC: number;
    durationMin: number;
    courseName: string;
    courseLevel: string;
    teacherName: string;
    classHref: string;
    isLive: boolean;
  };
  const now = Date.now();
  const occurrences: Occurrence[] = [];
  for (const b of bookings) {
    let cursor = now;
    for (let i = 0; i < OCCURRENCES_PER_BOOKING; i++) {
      const t = bookingTiming(b.dayOfWeek, b.startTime, b.duration, cursor);
      occurrences.push({
        bookingId: b.id,
        startUTC: t.startUTC,
        durationMin: b.duration,
        courseName: b.enrollment.course.name,
        courseLevel: b.enrollment.course.level,
        teacherName: b.teacher.name,
        classHref: `/app/student/class/booking-${b.id}`,
        isLive: t.isLive,
      });
      // Advance the clock just past this occurrence so the next bookingTiming
      // call returns the following week's occurrence rather than the same one.
      cursor = t.startUTC + b.duration * 60_000 + 60_000;
    }
  }
  occurrences.sort((a, b) => a.startUTC - b.startUTC);

  // Group by PKT calendar day for the day-bucketed UI.
  const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
  const byDay = new Map<string, Occurrence[]>();
  for (const o of occurrences) {
    const pktDay = new Date(o.startUTC + PKT_OFFSET_MS).toISOString().slice(0, 10);
    if (!byDay.has(pktDay)) byDay.set(pktDay, []);
    byDay.get(pktDay)!.push(o);
  }

  // Recordings of this student's classes that the admin has shown them;
  // every other recording stays admin-only
  const roomIds = bookings.map((b) => `booking-${b.id}`);
  const recordings = roomIds.length
    ? await prisma.classRecording.findMany({
        where: { roomId: { in: roomIds }, sharedWithStudentAt: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { teacher: { select: { name: true } } },
      })
    : [];

  const recordingItems: MyRecordingItem[] = recordings.map((r) => ({
    id: r.id,
    teacherName: r.teacher?.name ?? null,
    courseName: r.courseName,
    url: r.url,
    durationSec: r.durationSec,
    startedAt: r.startedAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Schedule"
        description={
          bookings.length === 0
            ? "No classes scheduled yet"
            : `${bookings.length} weekly ${bookings.length === 1 ? "class" : "classes"}${
                recordings.length > 0
                  ? ` · ${recordings.length} ${recordings.length === 1 ? "recording" : "recordings"}`
                  : ""
              }`
        }
      />

      {enrolledCount === 0 ? (
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
      ) : (
        <>
          {/* ───────── Upcoming Classes ───────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Upcoming Classes</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                All times PKT · 30-min weekly lessons
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 text-center">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-semibold">
                  No classes scheduled yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  The academy admin books your weekly classes after you set
                  available times. Check back soon or contact the admin if it&apos;s
                  taking too long.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(byDay.entries()).map(([dayKey, dayOccs]) => {
                  const dayDate = new Date(dayKey + "T00:00:00Z");
                  const todayPktDay = new Date(Date.now() + PKT_OFFSET_MS)
                    .toISOString()
                    .slice(0, 10);
                  const isToday = dayKey === todayPktDay;
                  return (
                    <div
                      key={dayKey}
                      className="rounded-2xl border border-border bg-card overflow-hidden"
                    >
                      <div
                        className={`p-4 border-b border-border ${isToday ? "bg-gradient-to-r from-primary/10 to-accent/10" : "bg-muted/30"}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold inline-flex items-center gap-2">
                            {dayDate.toLocaleDateString("en-US", {
                              timeZone: "UTC",
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                            {isToday && (
                              <span className="rounded-full bg-[hsl(var(--gold))] px-2 py-0.5 text-[10px] font-bold text-[hsl(220_32%_10%)]">
                                TODAY
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayOccs.length}{" "}
                            {dayOccs.length === 1 ? "class" : "classes"}
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-border">
                        {dayOccs.map((c, i) => {
                          const start = new Date(c.startUTC);
                          const minsUntil = Math.round(
                            (c.startUTC - Date.now()) / 60_000
                          );
                          const startingSoon =
                            !c.isLive && minsUntil > 0 && minsUntil <= 30;
                          const timeLabel = start.toLocaleTimeString("en-US", {
                            timeZone: "Asia/Karachi",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          });
                          return (
                            <div
                              key={c.bookingId + "-" + i}
                              className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors stagger-item"
                              style={{ animationDelay: `${i * 40}ms` }}
                            >
                              <div className="text-center min-w-[72px]">
                                <p className="text-base font-bold leading-tight">
                                  {timeLabel.replace(/\s/g, "")}
                                </p>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                                  PKT
                                </p>
                              </div>
                              <div
                                className={`grid h-12 w-12 place-items-center rounded-xl text-white shadow-md shrink-0 ${
                                  c.isLive
                                    ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                                    : "bg-gradient-to-br from-primary to-accent"
                                }`}
                              >
                                <Video className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate inline-flex items-center gap-1.5">
                                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                                  {c.courseName}
                                  {c.isLive && (
                                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                      LIVE
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1">
                                    <User className="h-3 w-3" /> {c.teacherName}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {c.durationMin}{" "}
                                    min
                                  </span>
                                  <span>{DAYS[start.getUTCDay()].long}</span>
                                </p>
                              </div>
                              <Link
                                href={c.classHref}
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-md transition-all ${
                                  c.isLive
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                    : startingSoon
                                      ? "bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)] animate-glow"
                                      : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
                                }`}
                              >
                                <Video className="h-3 w-3" />
                                {c.isLive
                                  ? "Join Live"
                                  : startingSoon
                                    ? "Join Now"
                                    : "Join"}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ───────── Recordings the admin shared ───────── */}
          {recordingItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Class Recordings</h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  Rewatch your recorded lessons
                </span>
              </div>
              <MyRecordingsList items={recordingItems} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
