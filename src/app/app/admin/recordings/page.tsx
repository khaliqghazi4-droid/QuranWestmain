import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession, ACTIVE_STUDENT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECORDINGS_TAG } from "@/lib/recordings";
import { parseRoomId } from "@/lib/class-room";
import { RecordingsBrowser, type Person, type Recording } from "./recordings-browser";
import { AlertCircle } from "lucide-react";
import { RecordingsHeader, RecordingsShell } from "./shell";

// A recording keeps the student's name only as text. A booked class's room
// (`booking-<slot id>`) leads to the real student through the booking's
// enrollment; anything else (trial classes, a booking deleted since) is
// matched by name, or kept as a student of its own under that name.
const getCachedRecordings = unstable_cache(
  async () => {
    const recs = await prisma.classRecording.findMany({
      orderBy: { startedAt: "desc" },
      take: 1000,
    });

    const bookingIds = recs.flatMap((r) => {
      const room = parseRoomId(r.roomId);
      return room?.kind === "booking" ? [room.id] : [];
    });
    const slots = await prisma.bookingSlot.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, enrollment: { select: { studentId: true } } },
    });
    const studentBySlot = new Map(slots.map((s) => [s.id, s.enrollment.studentId]));
    const linkedIds = Array.from(new Set(studentBySlot.values()));

    const [teachers, students] = await Promise.all([
      prisma.user.findMany({
        where: { OR: [{ role: "TEACHER" }, { id: { in: recs.map((r) => r.teacherId) } }] },
        select: { id: true, name: true, image: true },
      }),
      // everyone on the Students page, plus any former student who still has recordings
      prisma.user.findMany({
        where: { OR: [ACTIVE_STUDENT, { id: { in: linkedIds } }] },
        select: { id: true, name: true, image: true },
      }),
    ]);

    const norm = (s: string) => s.trim().toLowerCase();
    const studentByName = new Map(students.map((s) => [norm(s.name), s.id]));
    const others = new Map<string, Person>();

    const recordings: Recording[] = recs.map((r) => {
      const room = parseRoomId(r.roomId);
      const name = r.studentName?.trim() || "Unknown student";
      let studentKey = room?.kind === "booking" ? studentBySlot.get(room.id) : undefined;
      studentKey ??= studentByName.get(norm(name));
      if (!studentKey) {
        studentKey = `name:${norm(name)}`;
        if (!others.has(studentKey)) others.set(studentKey, { id: studentKey, name, image: null });
      }
      return {
        id: r.id,
        teacherId: r.teacherId,
        studentKey,
        courseName: r.courseName?.trim() || null,
        url: r.url,
        durationSec: r.durationSec,
        sizeBytes: r.sizeBytes,
        startedAt: new Date(r.startedAt).toISOString(),
        // A booked class's recording can be shown to its student; trials can't
        canShare: room?.kind === "booking",
        shared: !!r.sharedWithStudentAt,
      };
    });

    return { teachers, students: [...students, ...others.values()], recordings };
  },
  ["admin-recordings-by-person"],
  { revalidate: 600, tags: [RECORDINGS_TAG] }
);

export const revalidate = 600;

export default function AdminRecordingsPage() {
  return (
    <div className="space-y-6">
      <RecordingsHeader />
      <Suspense fallback={<RecordingsShell />}>
        <RecordingsData />
      </Suspense>
    </div>
  );
}

async function RecordingsData() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground text-center">
        Admin access required
      </div>
    );
  }

  try {
    const data = await getCachedRecordings();
    return <RecordingsBrowser {...data} />;
  } catch (e) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Could not load recordings</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {e instanceof Error ? e.message : "Could not load recordings"}
          </p>
        </div>
      </div>
    );
  }
}
