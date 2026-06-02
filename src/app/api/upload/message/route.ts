import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/upload/message — any signed-in user uploads a chat attachment.
// Supports images (jpg/png/gif/webp), PDFs, and audio (webm/mp3/m4a/ogg).
// Returns { url, type, name, mime, size } the chat sender can attach to a message.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const mime = (file.type || "").toLowerCase();
    let kind: "image" | "file" | "voice";
    if (mime.startsWith("image/")) kind = "image";
    else if (mime.startsWith("audio/")) kind = "voice";
    else if (mime === "application/pdf") kind = "file";
    else {
      return NextResponse.json(
        { error: "Only images, PDFs and audio are allowed" },
        { status: 400 }
      );
    }

    const safeName = (file.name || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `messages/${session.user.id}/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: mime || undefined,
    });

    return NextResponse.json({
      url: blob.url,
      type: kind,
      name: file.name || safeName,
      mime,
      size: file.size,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
