import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function canManage(id: string, userId: string, role: string) {
  if (role === "ADMIN") return true;
  if (role !== "TEACHER") return false;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { course: true },
  });
  return lesson?.course.teacherId === userId;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canManage(params.id, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const allowed: Record<string, unknown> = {};
    const fields = ["title", "description", "content", "videoUrl", "audioUrl", "fileUrl", "duration", "order", "isPublished"];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }

    const lesson = await prisma.lesson.update({ where: { id: params.id }, data: allowed });
    return NextResponse.json({ lesson });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canManage(params.id, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
