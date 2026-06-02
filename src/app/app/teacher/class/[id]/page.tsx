import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveRoom } from "@/lib/class-room";
import { ClassRoom, type ClassRoomNote } from "@/components/class-room/class-room";
import { ScreenRecorder } from "@/components/class-room/screen-recorder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-app class room for the teacher. Opens Jitsi inside the academy page,
// shows the teacher's own notes for the course, and exposes the screen
// recorder so the lecture is saved to the admin's recordings tab.
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

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 -mb-8">
      <ClassRoom
        roomId={room.roomId}
        jitsiRoomName={room.jitsiRoomName}
        courseName={room.courseName}
        studentName={room.studentName}
        displayName={`Ustaz ${session.user.name ?? "Teacher"}`}
        isTeacher
        notes={notes}
        backHref="/app/teacher/classes"
        startUTC={room.startUTC}
        recorderSlot={
          <ScreenRecorder
            roomId={room.roomId}
            courseName={room.courseName}
            studentName={room.studentName}
          />
        }
      />
    </div>
  );
}
