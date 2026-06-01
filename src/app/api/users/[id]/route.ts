import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function revalidateUserTouched() {
  revalidatePath("/app/admin/teachers");
  revalidatePath("/app/admin/students");
  revalidatePath("/app/admin/courses");
  revalidatePath("/app/admin");
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id === params.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    revalidateUserTouched();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Whitelist editable fields only
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.country !== undefined) data.country = body.country;
    if (body.address !== undefined) data.address = body.address;
    if (body.bio !== undefined) data.bio = body.bio;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.shift !== undefined) data.shift = body.shift; // "DAY" | "NIGHT" | null
    if (body.gender !== undefined) data.gender = body.gender; // "MALE" | "FEMALE" | null

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        shift: true,
        gender: true,
      },
    });
    revalidateUserTouched();
    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
