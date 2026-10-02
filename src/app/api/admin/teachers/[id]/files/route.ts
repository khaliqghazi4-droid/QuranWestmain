import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_KINDS = ["resume", "certificate", "other"] as const;

// POST /api/admin/teachers/[id]/files — upload a PDF/image for a teacher
// Body: multipart/form-data with fields: file (Blob), kind (string), name (string)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const kindRaw = String(form.get("kind") ?? "other");
    const nameRaw = String(form.get("name") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }
    const kind = ALLOWED_KINDS.includes(kindRaw as (typeof ALLOWED_KINDS)[number])
      ? kindRaw
      : "other";
    const name = nameRaw || file.name || "Document";

    const teacher = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });
    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Store under a stable path so deletes can target the same blob
    const safeName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `teachers/${teacher.id}/${kind}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });

    const record = await prisma.teacherFile.create({
      data: {
        userId: teacher.id,
        kind,
        name,
        url: blob.url,
        mimeType: file.type || null,
        size: file.size,
      },
    });

    revalidatePath(`/app/admin/teachers/${teacher.id}`);
    revalidatePath("/app/admin/teachers");
    return NextResponse.json({ file: record }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
