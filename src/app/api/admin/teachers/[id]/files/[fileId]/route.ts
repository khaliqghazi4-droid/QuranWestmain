import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { del } from "@vercel/blob";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; fileId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const file = await prisma.teacherFile.findUnique({ where: { id: params.fileId } });
    if (!file || file.userId !== params.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Best-effort blob delete; if it fails we still drop the DB record
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(file.url);
      } catch {
        /* ignore — orphan blob is harmless */
      }
    }

    await prisma.teacherFile.delete({ where: { id: params.fileId } });

    revalidatePath(`/app/admin/teachers/${params.id}`);
    revalidatePath("/app/admin/teachers");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
