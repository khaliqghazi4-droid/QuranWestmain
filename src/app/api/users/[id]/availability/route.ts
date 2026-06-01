import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id]/availability
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      timezone: true,
      role: true,
      availability: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role,
    timezone: user.timezone ?? "UTC",
    slots: user.availability.map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  });
}

// PUT /api/users/[id]/availability - replace all slots
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isOwn = session.user.id === params.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwn && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
        return NextResponse.json({ error: "Time must be HH:MM (24-hour)" }, { status: 400 });
      }
      if (s.startTime >= s.endTime) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction([
      prisma.userAvailability.deleteMany({ where: { userId: params.id } }),
      ...(body.slots.length > 0
        ? [
            prisma.userAvailability.createMany({
              data: body.slots.map((s) => ({
                userId: params.id,
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
              where: { id: params.id },
              data: { timezone: body.timezone },
            }),
          ]
        : []),
    ]);

    revalidatePath("/app/admin/teachers");
    revalidatePath("/app/admin/availability");
    revalidatePath("/app/admin/trials");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
