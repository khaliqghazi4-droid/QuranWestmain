import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveRoom } from "@/lib/class-room";
import { isRecordingBlobUrl, saveClassRecording } from "@/lib/recordings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/upload/recording/confirm
//
// Called by the class-room recorder right after its Blob upload finishes, to
// save the ClassRecording row. The upload route's onUploadCompleted does the
// same, but Vercel can't reach it on localhost and it can arrive late; the
// shared row id makes the second save a no-op.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Only teachers can save class recordings" }, { status: 403 });
  }

  let body: {
    url?: unknown;
    roomId?: unknown;
    startedAt?: unknown;
    durationSec?: unknown;
    sizeBytes?: unknown;
    mimeType?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url : "";
  const roomId = typeof body.roomId === "string" ? body.roomId : "";
  if (!roomId || !isRecordingBlobUrl(url, roomId)) {
    return NextResponse.json({ error: "Not a class recording upload" }, { status: 400 });
  }

  const room = await resolveRoom(roomId);
  if (!room) return NextResponse.json({ error: "Class room not found" }, { status: 404 });
  if (room.teacherId !== session.user.id) {
    return NextResponse.json({ error: "You don't teach this class" }, { status: 403 });
  }

  const started = typeof body.startedAt === "string" ? new Date(body.startedAt) : new Date();
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : null);

  await saveClassRecording({
    teacherId: session.user.id,
    roomId,
    studentName: room.studentName,
    courseName: room.courseName,
    url,
    mimeType: typeof body.mimeType === "string" ? body.mimeType.slice(0, 100) : null,
    durationSec: num(body.durationSec),
    sizeBytes: num(body.sizeBytes),
    startedAt: Number.isNaN(started.getTime()) ? new Date() : started,
  });

  return NextResponse.json({ ok: true });
}
