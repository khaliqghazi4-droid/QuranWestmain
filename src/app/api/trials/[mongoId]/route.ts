import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureTrialAccount, lockTrialAccount } from "@/lib/trial-account";

export const dynamic = "force-dynamic";

function bust() {
  revalidatePath("/app/admin/trials");
  revalidatePath("/app/admin/enrollments");
  revalidatePath("/app/teacher/classes");
  revalidatePath("/app/teacher");
}

// POST /api/trials/:id — admin sends an enrollment request to Free Trial at the given time
export async function POST(req: Request, { params }: { params: { mongoId: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { trialTime } = (await req.json()) as { trialTime?: string };
    const date = trialTime ? new Date(trialTime) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "A valid trial time is required" }, { status: 400 });
    }
    const [updated] = await prisma.$transaction([
      prisma.enrollmentRequest.updateMany({
        where: { id: params.mongoId },
        data: { inTrials: true, trialTime: date },
      }),
      prisma.trialAssignment.updateMany({
        where: { mongoEnrollmentId: params.mongoId },
        data: { trialTime: date },
      }),
    ]);
    if (updated.count === 0) {
      return NextResponse.json({ error: "Enrollment request not found" }, { status: 404 });
    }
    const request = await prisma.enrollmentRequest.findUnique({
      where: { id: params.mongoId },
      select: { email: true, fullName: true, whatsapp: true, country: true },
    });
    if (request) await ensureTrialAccount({ ...request, trialTime: date });
    bust();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not schedule the trial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/trials/:id — take the request out of Free Trial (drops any teacher assignment)
export async function DELETE(
  _req: Request,
  { params }: { params: { mongoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.$transaction([
      prisma.enrollmentRequest.updateMany({
        where: { id: params.mongoId },
        data: { inTrials: false },
      }),
      prisma.trialAssignment.deleteMany({
        where: { mongoEnrollmentId: params.mongoId },
      }),
    ]);
    const request = await prisma.enrollmentRequest.findUnique({
      where: { id: params.mongoId },
      select: { email: true },
    });
    if (request) await lockTrialAccount(request.email);
    bust();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not remove the trial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
