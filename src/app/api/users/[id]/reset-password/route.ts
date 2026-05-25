import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id === params.id) {
    return NextResponse.json(
      { error: "Use the change password option in your profile instead" },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { newPassword?: string };
    const newPassword = body.newPassword?.trim() || generatePassword(12);

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { password: hash, loginPassword: newPassword },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user, newPassword });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reset failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
