import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveRoom } from "@/lib/class-room";
import { ensureDailyRoom, isDailyConfigured } from "@/lib/daily";
import { createJaasJwt, getJaasConfig } from "@/lib/jaas";
import { ClassRoom } from "@/components/class-room/class-room";
import { studentClassNotes } from "@/lib/note-shares";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-app class room for the student. Same Jitsi room as the teacher (so
// they meet), no recording controls; the side panel shows the notes the
// teacher has shared with them.
export default async function StudentClassRoom({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/app");

  const room = await resolveRoom(params.id);
  if (!room) notFound();

  // Guardrail: students may only join classes for courses they're enrolled in
  // (we skip this check for trial rooms since those aren't tied to enrollments).
  if (room.kind !== "trial" && room.courseId) {
    const enrolled = await prisma.enrollment.findFirst({
      where: { studentId: session.user.id, courseId: room.courseId },
      select: { id: true },
    });
    if (!enrolled) redirect("/app/student/schedule");
  }

  const displayName = session.user.name ?? "Student";

  // Notes this class's teacher has shared with the student
  const notes = await studentClassNotes(session.user.id, room);

  // With JaaS keys configured the student joins the teacher's 8x8.vc room as a
  // regular participant. Trials stay on public meet.jit.si (see teacher page).
  const jaasConfig = room.kind !== "trial" ? getJaasConfig() : null;
  const jaas = jaasConfig
    ? createJaasJwt(jaasConfig, {
        user: { id: session.user.id, name: displayName, email: session.user.email },
        moderator: false,
      })
    : null;

  let dailyUrl: string | null = null;
  if (!jaas && isDailyConfigured()) {
    try {
      const dRoom = await ensureDailyRoom(room.roomId);
      dailyUrl = dRoom.url;
    } catch (e) {
      console.error("[student/class] Daily room create failed", e);
    }
  }

  // The dashboard shell gives class room pages the whole area under the header
  return (
    <ClassRoom
      roomId={room.roomId}
      dailyUrl={dailyUrl}
      jitsiRoomName={room.jitsiRoomName}
      jaas={jaas}
      courseName={room.courseName}
      courseId={room.courseId}
      studentName={room.studentName}
      displayName={displayName}
      isTeacher={false}
      notes={notes}
      backHref="/app/student/schedule"
      startUTC={room.startUTC}
    />
  );
}
