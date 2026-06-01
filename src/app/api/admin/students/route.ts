import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

// POST /api/admin/students — admin creates a student account (with optional
// course enrollment) and returns the plaintext password so the admin can
// share the login credentials with the student.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      country?: string;
      courseId?: string;
      teacherId?: string;
      password?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const password = body.password?.trim() || generatePassword(10);
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        phone: body.phone?.trim() || null,
        country: body.country?.trim() || null,
        password: hash,
        loginPassword: password,
        role: "STUDENT",
      },
      select: { id: true, name: true, email: true, phone: true, country: true },
    });

    // Optional: enroll in a course right away (and assign a teacher from that course)
    if (body.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: body.courseId },
        include: {
          courseTeachers: { select: { teacherId: true } },
        },
      });
      if (course) {
        // Verify the chosen teacher actually teaches this course
        let teacherId: string | null = null;
        if (body.teacherId) {
          const teachesIt =
            course.teacherId === body.teacherId ||
            course.courseTeachers.some((ct) => ct.teacherId === body.teacherId);
          if (teachesIt) teacherId = body.teacherId;
        }
        await prisma.enrollment.create({
          data: { studentId: student.id, courseId: body.courseId, teacherId },
        });
      }
    }

    revalidatePath("/app/admin/students");
    revalidatePath("/app/admin/teachers");
    revalidatePath("/app/admin/courses");
    revalidatePath("/app/admin");
    return NextResponse.json({ student, password }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create student";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
