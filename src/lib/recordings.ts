import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Cache tag on the admin recordings queries; bumped whenever a recording is saved
export const RECORDINGS_TAG = "recordings";

// Same blob URL -> same row id. The browser's confirm call and Vercel Blob's
// onUploadCompleted callback can both save the same upload; a duplicate insert
// then hits the primary key and is ignored, so no schema change is needed.
function recordingIdForUrl(url: string) {
  return "rec_" + crypto.createHash("sha256").update(url).digest("hex").slice(0, 24);
}

// Recordings the class-room recorder uploads: https://<store>.public.blob.vercel-storage.com/recordings/<room>/...
export function isRecordingBlobUrl(url: string, roomId: string): boolean {
  try {
    const u = new URL(url);
    const safeRoom = roomId.replace(/[^a-zA-Z0-9_-]/g, "-");
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com") &&
      u.pathname.startsWith(`/recordings/${safeRoom}/`)
    );
  } catch {
    return false;
  }
}

export async function saveClassRecording(data: {
  teacherId: string;
  roomId: string;
  studentName: string | null;
  courseName: string | null;
  url: string;
  mimeType: string | null;
  durationSec: number | null;
  sizeBytes: number | null;
  startedAt: Date;
}): Promise<void> {
  try {
    await prisma.classRecording.create({ data: { id: recordingIdForUrl(data.url), ...data } });
  } catch (e) {
    // Already saved by the other path
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
  revalidateTag(RECORDINGS_TAG);
}
