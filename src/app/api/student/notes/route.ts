import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseRoomId, resolveRoom } from "@/lib/class-room";
import { studentClassNotes, studentSharedNotes } from "@/lib/note-shares";

export const dynamic = "force-dynamic";

// GET /api/student/notes[?room=<roomId>] — notes teachers shared with this
// student. With `room`, only the ones for that class (the class room polls
// this so a note the teacher shares mid-class shows up).
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roomId = new URL(req.url).searchParams.get("room");
  if (!roomId) {
    return NextResponse.json({ notes: await studentSharedNotes(session.user.id) });
  }

  // Trial rooms have no shared notes; skip resolving them (it reads the website DB)
  const parsed = parseRoomId(roomId);
  if (!parsed || parsed.kind === "trial") return NextResponse.json({ notes: [] });

  const room = await resolveRoom(roomId);
  if (!room) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  return NextResponse.json({ notes: await studentClassNotes(session.user.id, room) });
}
