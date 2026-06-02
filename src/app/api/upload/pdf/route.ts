import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/upload/pdf — admin/teacher uploads a PDF; returns the Blob URL.
// Used for lesson attachments and other generic PDF docs.
// Body: multipart/form-data with `file` (Blob) and optional `folder` (string)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") ?? "uploads");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }
    // Restrict to PDF (browsers happily iframe-render PDFs)
    const isPdf =
      file.type === "application/pdf" ||
      (file.name.toLowerCase().endsWith(".pdf") && !file.type);
    if (!isPdf) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const safeFolder = folderRaw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32) || "uploads";
    const safeName = (file.name || "file.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `${safeFolder}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "application/pdf",
    });

    return NextResponse.json({
      url: blob.url,
      name: file.name || safeName,
      size: file.size,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
