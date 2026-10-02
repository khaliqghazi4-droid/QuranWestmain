import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function bust() {
  revalidatePath("/app/admin/trials");
  revalidatePath("/app/teacher/classes");
  revalidatePath("/app/teacher");
}

export async function POST(req: Request, { params }: { params: { mongoId: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { teacherId, trialTime } = (await req.json()) as {
      teacherId?: string;
      trialTime?: string;
    };
    if (!teacherId || !trialTime) {
      return NextResponse.json(
        { error: "teacherId and trialTime are required" },
        { status: 400 }
      );
    }
    const date = new Date(trialTime);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid trialTime" }, { status: 400 });
    }
    const assignment = await prisma.trialAssignment.upsert({
      where: { mongoEnrollmentId: params.mongoId },
      update: { teacherId, trialTime: date },
      create: { mongoEnrollmentId: params.mongoId, teacherId, trialTime: date },
    });
    bust();
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Assign failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { mongoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.trialAssignment.deleteMany({
      where: { mongoEnrollmentId: params.mongoId },
    });
    bust();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unassign failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
