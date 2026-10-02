import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveRoom } from "@/lib/class-room";
import { ensureDailyRoom, isDailyConfigured } from "@/lib/daily";
import { createJaasJwt, getJaasConfig } from "@/lib/jaas";
import { ClassRoom, type ClassRoomNote } from "@/components/class-room/class-room";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-app class room for the teacher. Opens the meeting inside the academy
// page and shows the teacher's own notes for the course. Start Class joins
// and records the class; the recording saves to the admin's recordings tab.
export default async function TeacherClassRoom({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/app");

  const room = await resolveRoom(params.id);
  if (!room) notFound();
  if (room.teacherId !== session.user.id) {
    // Teacher is trying to join a class that isn't theirs.
    redirect("/app/teacher/classes");
  }

  // Pull the teacher's notes scoped to this course (or all general notes if
  // the room isn't tied to a specific course, e.g. a trial).
  const dbNotes = await prisma.teacherNote.findMany({
    where: {
      teacherId: session.user.id,
      ...(room.courseId ? { OR: [{ courseId: room.courseId }, { courseId: null }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  const notes: ClassRoomNote[] = dbNotes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    fileUrl: n.fileUrl,
    fileName: n.fileName,
  }));

  const displayName = `Ustaz ${session.user.name ?? "Teacher"}`;

  // With JaaS keys configured the teacher joins on 8x8.vc as the moderator
  // (they were checked above to be this class's teacher). Trials stay on
  // public meet.jit.si: the trial student joins through an outside
  // meet.jit.si link, so both sides must use the same server.
  const jaasConfig = room.kind !== "trial" ? getJaasConfig() : null;
  const jaas = jaasConfig
    ? createJaasJwt(jaasConfig, {
        user: { id: session.user.id, name: displayName, email: session.user.email },
        moderator: true,
      })
    : null;

  // Ensure a Daily room exists for this class (idempotent). If Daily isn't
  // configured yet we fall back to the older Jitsi room so the class still
  // joins — just without the embed improvements. Skipped when JaaS is in use.
  let dailyUrl: string | null = null;
  if (!jaas && isDailyConfigured()) {
    try {
      const dRoom = await ensureDailyRoom(room.roomId);
      dailyUrl = dRoom.url;
    } catch (e) {
      console.error("[teacher/class] Daily room create failed", e);
    }
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 -mb-8">
      <ClassRoom
        roomId={room.roomId}
        dailyUrl={dailyUrl}
        jitsiRoomName={room.jitsiRoomName}
        jaas={jaas}
        courseName={room.courseName}
        studentName={room.studentName}
        displayName={displayName}
        isTeacher
        notes={notes}
        backHref="/app/teacher/classes"
        startUTC={room.startUTC}
      />
    </div>
  );
}
