import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveRoom } from "@/lib/class-room";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/upload/recording
//
// Vercel Blob client-upload flow. The browser asks this endpoint for a
// short-lived upload token, PUTs the recording directly to Blob (bypassing
// our 4.5 MB Lambda body limit), then this endpoint is invoked again via
// onUploadCompleted with the final blob URL — we use that to persist a
// ClassRecording row.
//
// `clientPayload` carries the room id + start time so we can attribute the
// recording to the right class without making the client trust-worthy: we
// re-verify the teacher actually teaches that room here on the server.
type ClientPayload = {
  roomId: string;
  startedAt?: string;
  durationSec?: number;
};

function parsePayload(raw: string | null | undefined): ClientPayload {
  if (!raw) return { roomId: "" };
  try {
    const v = JSON.parse(raw) as ClientPayload;
    return { roomId: String(v.roomId ?? ""), startedAt: v.startedAt, durationSec: v.durationSec };
  } catch {
    return { roomId: "" };
  }
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,

      // Called before issuing the upload token — gate on auth + role.
      onBeforeGenerateToken: async (_pathname, clientPayloadStr) => {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "TEACHER") {
          throw new Error("Only teachers can upload class recordings");
        }
        const payload = parsePayload(clientPayloadStr);
        if (!payload.roomId) throw new Error("roomId is required");

        const room = await resolveRoom(payload.roomId);
        if (!room) throw new Error("Class room not found");
        if (room.teacherId !== session.user.id) {
          throw new Error("You don't teach this class");
        }

        // NOTE: only the keys typed on `HandleUploadOptions` are honored
        // here — `pathname` is decided client-side (we already namespace it
        // there) and adding it here makes the SDK throw, which surfaces as
        // "Failed to retrieve the client token" in the browser.
        return {
          allowedContentTypes: [
            "video/webm",
            "video/mp4",
            "audio/webm",
            "audio/mp4",
            "audio/mpeg",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB ceiling
          addRandomSuffix: true,
          // We re-derive teacherId/roomId on the completion call below from
          // tokenPayload so the client can't tamper with attribution.
          tokenPayload: JSON.stringify({
            teacherId: session.user.id,
            roomId: payload.roomId,
            studentName: room.studentName,
            courseName: room.courseName,
            startedAt: payload.startedAt ?? new Date().toISOString(),
            durationSec: payload.durationSec ?? null,
          }),
        };
      },

      // After Blob storage receives the file, persist a DB row so the admin
      // recordings page can list it.
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        try {
          const meta = JSON.parse(tokenPayload) as {
            teacherId: string;
            roomId: string;
            studentName: string | null;
            courseName: string | null;
            startedAt: string;
            durationSec: number | null;
          };
          await prisma.classRecording.create({
            data: {
              teacherId: meta.teacherId,
              roomId: meta.roomId,
              studentName: meta.studentName ?? null,
              courseName: meta.courseName ?? null,
              url: blob.url,
              mimeType: blob.contentType ?? null,
              durationSec: meta.durationSec ?? null,
              sizeBytes: typeof (blob as { contentLength?: number }).contentLength === "number"
                ? (blob as { contentLength?: number }).contentLength!
                : null,
              startedAt: new Date(meta.startedAt),
            },
          });
        } catch (e) {
          // Don't fail the upload if the DB write fails — the blob is already
          // safe in storage and the admin can still find it from the dashboard.
          console.error("[upload/recording] DB write failed", e);
        }
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// GET /api/upload/recording — admin lists every recording, teacher lists own.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.role === "TEACHER"
        ? { teacherId: session.user.id }
        : null;

  if (!where) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const recordings = await prisma.classRecording.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { teacher: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ recordings });
}
