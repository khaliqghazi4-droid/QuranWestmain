import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pktDayMidnightUTC } from "@/lib/pkt-day";

export const dynamic = "force-dynamic";

// POST /api/teacher/sign-in — teacher clocks in for today's PKT calendar day.
// Idempotent: if already signed in today, returns the existing record without
// changing signInAt (so the recorded time stays the first one of the day).
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = pktDayMidnightUTC();
  const now = new Date();

  const record = await prisma.teacherAttendance.upsert({
    where: { teacherId_date: { teacherId: session.user.id, date: day } },
    update: {}, // don't change signInAt if already exists
    create: { teacherId: session.user.id, date: day, signInAt: now },
  });

  revalidatePath("/app/teacher");
  revalidatePath("/app/admin/teacher-attendance");
  return NextResponse.json({ attendance: record });
}
