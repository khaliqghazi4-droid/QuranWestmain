import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { resolveRoom } from "@/lib/class-room";
import { ensureDailyRoom, isDailyConfigured } from "@/lib/daily";
import { createJaasJwt, getJaasConfig } from "@/lib/jaas";
import { ClassRoom } from "@/components/class-room/class-room";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Admin joins any class to look in. On JaaS the admin is a moderator, so they
// skip the lobby; they join with camera and mic off. No recording or notes.
export default async function AdminClassRoom({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isAdminSession(session)) redirect("/app");

  const room = await resolveRoom(params.id);
  if (!room) notFound();

  const displayName = `${session.user.name ?? "Admin"} (Admin)`;

  // Same server as the teacher and student: JaaS for regular classes,
  // public meet.jit.si for trials
  const jaasConfig = room.kind !== "trial" ? getJaasConfig() : null;
  const jaas = jaasConfig
    ? createJaasJwt(jaasConfig, {
        user: { id: session.user.id, name: displayName, email: session.user.email },
        moderator: true,
      })
    : null;

  let dailyUrl: string | null = null;
  if (!jaas && isDailyConfigured()) {
    try {
      const dRoom = await ensureDailyRoom(room.roomId);
      dailyUrl = dRoom.url;
    } catch (e) {
      console.error("[admin/class] Daily room create failed", e);
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
      isAdmin
      notes={[]}
      backHref="/app/admin/classes"
      startUTC={room.startUTC}
    />
  );
}
