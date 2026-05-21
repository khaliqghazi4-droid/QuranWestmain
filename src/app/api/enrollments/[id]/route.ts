import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: params.id },
    include: { course: true },
  });
  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isTeacher =
    session.user.role === "TEACHER" && enrollment.course.teacherId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isTeacher && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { progress?: number; status?: string };

    const data: { progress?: number; status?: string } = {};
    if (typeof body.progress === "number") {
      data.progress = Math.max(0, Math.min(100, Math.round(body.progress)));
    }
    if (body.status) data.status = body.status;

    const updated = await prisma.enrollment.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ enrollment: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
