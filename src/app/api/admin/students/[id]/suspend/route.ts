import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, forgetSuspension, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/admin/students/:id/suspend { suspend: boolean } — admin suspends or reactivates a
// student's login. A suspended student can't sign in and is signed out of open sessions.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { suspend } = (await req.json().catch(() => ({}))) as { suspend?: boolean };
  if (typeof suspend !== "boolean") {
    return NextResponse.json({ error: "suspend must be true or false" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  });
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: student.id },
    data: { suspendedAt: suspend ? new Date() : null },
  });
  forgetSuspension(student.id);

  revalidatePath("/app/admin/students");
  return NextResponse.json({ ok: true, suspended: suspend });
}
