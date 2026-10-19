import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { put, del } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // the profile editor shrinks photos first; this is a backstop

// Old photos live on our Blob store; anything else (e.g. a pasted URL) is left alone
async function removeOldPhoto(url: string | null) {
  if (!url || !url.includes(".blob.vercel-storage.com/")) return;
  try {
    await del(url);
  } catch {
    /* already gone: nothing to clean up */
  }
}

// POST /api/users/me/avatar — set the signed-in user's profile photo
// Body: multipart/form-data with field `file` (an image)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large (max 5 MB)" }, { status: 400 });
    }

    const userId = session.user.id;
    const before = await prisma.user.findUnique({ where: { id: userId }, select: { image: true } });

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const blob = await put(`avatars/${userId}/${Date.now()}.${ext}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    await prisma.user.update({ where: { id: userId }, data: { image: blob.url } });
    await removeOldPhoto(before?.image ?? null);

    revalidatePath("/app/admin/settings");
    return NextResponse.json({ image: blob.url }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/users/me/avatar — remove the photo (back to the initials badge)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const before = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } });
    await prisma.user.update({ where: { id: session.user.id }, data: { image: null } });
    await removeOldPhoto(before?.image ?? null);

    revalidatePath("/app/admin/settings");
    return NextResponse.json({ image: null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Remove failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
