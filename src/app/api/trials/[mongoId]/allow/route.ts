import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { allowTrialAccount } from "@/lib/trial-account";

export const dynamic = "force-dynamic";

// POST /api/trials/:id/allow — admin re-opens a locked free-trial login for another few days
export async function POST(_req: Request, { params }: { params: { mongoId: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.enrollmentRequest.findUnique({
    where: { id: params.mongoId },
    select: { email: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Trial request not found" }, { status: 404 });
  }

  const count = await allowTrialAccount(request.email);
  if (count === 0) {
    return NextResponse.json({ error: "This trial has no trial login to allow" }, { status: 409 });
  }

  revalidatePath("/app/admin/trials");
  return NextResponse.json({ ok: true });
}
