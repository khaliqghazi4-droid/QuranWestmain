import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAccess(enrollmentId: string, userId: string, role: string) {
  const enr = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { studentId: true },
  });
  if (!enr) return null;
  if (role === "ADMIN") return enr;
  if (enr.studentId === userId) return enr;
  return false;
}

// GET /api/enrollments/[id]/availability
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enr = await ensureAccess(params.id, session.user.id, session.user.role);
  if (enr === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (enr === false) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [user, slots] = await Promise.all([
    prisma.user.findUnique({
      where: { id: enr.studentId },
      select: { timezone: true, name: true },
    }),
    prisma.enrollmentAvailability.findMany({
      where: { enrollmentId: params.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return NextResponse.json({
    timezone: user?.timezone ?? "UTC",
    studentName: user?.name ?? "Student",
    slots: slots.map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  });
}

// PUT /api/enrollments/[id]/availability - replace all slots for this enrollment
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enr = await ensureAccess(params.id, session.user.id, session.user.role);
  if (enr === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (enr === false) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await req.json()) as {
      slots: { dayOfWeek: number; startTime: string; endTime: string }[];
      timezone?: string;
    };

    if (!Array.isArray(body.slots)) {
      return NextResponse.json({ error: "slots[] required" }, { status: 400 });
    }

    const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const s of body.slots) {
      if (s.dayOfWeek < 0 || s.dayOfWeek > 6) {
        return NextResponse.json({ error: "Invalid day of week" }, { status: 400 });
      }
      if (!timeRe.test(s.startTime) || !timeRe.test(s.endTime)) {
        return NextResponse.json({ error: "Time must be HH:MM" }, { status: 400 });
      }
      if (s.startTime >= s.endTime) {
        return NextResponse.json({ error: "End must be after start" }, { status: 400 });
      }
    }

    await prisma.$transaction([
      prisma.enrollmentAvailability.deleteMany({ where: { enrollmentId: params.id } }),
      ...(body.slots.length > 0
        ? [
            prisma.enrollmentAvailability.createMany({
              data: body.slots.map((s) => ({
                enrollmentId: params.id,
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
              })),
            }),
          ]
        : []),
      ...(body.timezone
        ? [
            prisma.user.update({
              where: { id: enr.studentId },
              data: { timezone: body.timezone },
            }),
          ]
        : []),
    ]);

    // The Scheduling page serves enrollments from a 10-min cache; without this the
    // cards and the "Edit Times" editor keep showing the old times after a save
    revalidatePath("/app/admin/availability");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
