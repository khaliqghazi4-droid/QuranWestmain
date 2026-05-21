import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      timezone: true,
      bio: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      country?: string;
      timezone?: string;
      bio?: string;
    };

    const data: Record<string, string | null> = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.country !== undefined) data.country = body.country || null;
    if (body.timezone !== undefined) data.timezone = body.timezone || null;
    if (body.bio !== undefined) data.bio = body.bio || null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        timezone: true,
        bio: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
