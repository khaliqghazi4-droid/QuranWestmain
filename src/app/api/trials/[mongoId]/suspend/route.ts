import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, forgetSuspension, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/trials/:id/suspend { suspend: boolean } — admin suspends or reactivates the
// trial student's login. A suspended student can't sign in and is signed out of open sessions.
export async function POST(req: Request, { params }: { params: { mongoId: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { suspend } = (await req.json().catch(() => ({}))) as { suspend?: boolean };
  if (typeof suspend !== "boolean") {
    return NextResponse.json({ error: "suspend must be true or false" }, { status: 400 });
  }

  const request = await prisma.enrollmentRequest.findUnique({
    where: { id: params.mongoId },
    select: { email: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Trial request not found" }, { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { email: request.email.toLowerCase(), role: "STUDENT" },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "This trial has no student login" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { suspendedAt: suspend ? new Date() : null },
  });
  forgetSuspension(user.id);

  revalidatePath("/app/admin/trials");
  return NextResponse.json({ ok: true, suspended: suspend });
}
