import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECORDINGS_TAG } from "@/lib/recordings";

export const dynamic = "force-dynamic";

// POST /api/admin/recordings/:id/share { share: boolean } — admin shows a class
// recording to that class's student (on their Schedule page), or hides it again.
// Only booking recordings belong to a student account; trial/course rooms don't.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { share } = (await req.json().catch(() => ({}))) as { share?: boolean };
  if (typeof share !== "boolean") {
    return NextResponse.json({ error: "share must be true or false" }, { status: 400 });
  }

  const recording = await prisma.classRecording.findUnique({
    where: { id: params.id },
    select: { id: true, roomId: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }
  if (!recording.roomId.startsWith("booking-")) {
    return NextResponse.json({ error: "Only recordings of a student's booked class can be shared" }, { status: 400 });
  }

  const updated = await prisma.classRecording.update({
    where: { id: recording.id },
    data: { sharedWithStudentAt: share ? new Date() : null },
    select: { sharedWithStudentAt: true },
  });

  revalidateTag(RECORDINGS_TAG);
  revalidatePath("/app/student/schedule");
  return NextResponse.json({ ok: true, shared: !!updated.sharedWithStudentAt });
}
