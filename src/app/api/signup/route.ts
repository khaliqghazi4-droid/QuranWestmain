import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, isAdminSession } from "@/lib/auth";
import { Role } from "@prisma/client";

const allowedRoles: Role[] = ["STUDENT", "TEACHER"];

// Accounts are created by the academy admin (e.g. "Invite Teacher"); there is no public sign-up
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, password, role } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const upperRole = role.toUpperCase() as Role;
    if (!allowedRoles.includes(upperRole)) {
      return NextResponse.json(
        { error: "Invalid role. Only student and teacher accounts can be created here." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashed,
        loginPassword: password, // admin-issued; cleared when the user sets their own
        role: upperRole,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    revalidatePath(upperRole === "TEACHER" ? "/app/admin/teachers" : "/app/admin/students");
    revalidatePath("/app/admin");
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
