import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pktDayMidnightUTC } from "@/lib/pkt-day";

export const dynamic = "force-dynamic";

// POST /api/teacher/sign-out — teacher clocks out for today's PKT calendar day.
// Updates signOutAt = now. Requires that the teacher has signed in today.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = pktDayMidnightUTC();
  const existing = await prisma.teacherAttendance.findUnique({
    where: { teacherId_date: { teacherId: session.user.id, date: day } },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "You haven't signed in yet today" },
      { status: 400 }
    );
  }

  const record = await prisma.teacherAttendance.update({
    where: { id: existing.id },
    data: { signOutAt: new Date() },
  });

  revalidatePath("/app/teacher");
  revalidatePath("/app/admin/teacher-attendance");
  return NextResponse.json({ attendance: record });
}
