import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: { course: true },
  });
  if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = cls.course.teacherId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.class.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: { course: true },
  });
  if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = cls.course.teacherId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (body.startTime) body.startTime = new Date(body.startTime);
    const updated = await prisma.class.update({ where: { id: params.id }, data: body });
    return NextResponse.json({ class: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
