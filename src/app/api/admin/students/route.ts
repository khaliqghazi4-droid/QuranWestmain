import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions, forgetSuspension, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

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
  const isAdmin = isAdminSession(session);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      country?: string;
      courseId?: string;
      courseName?: string;
      requestId?: string;
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

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, password: true, accessExpiresAt: true },
    });
    // Website enroll submissions pre-create a passwordless lead, and free trials get a
    // time-limited login; adding either as a student makes it a permanent account.
    const isUpgradable =
      existing?.role === "STUDENT" && (existing.password === "" || existing.accessExpiresAt !== null);
    if (existing && !isUpgradable) {
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

    const phone = body.phone?.trim() || null;
    const country = body.country?.trim() || null;
    const data = { name, password: hash, loginPassword: password };
    const select = { id: true, name: true, email: true, phone: true, country: true } as const;
    const student = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            ...data,
            phone: phone ?? undefined,
            country: country ?? undefined,
            accessExpiresAt: null,
            suspendedAt: null,
          },
          select,
        })
      : await prisma.user.create({
          data: { ...data, phone, country, email, role: "STUDENT" },
          select,
        });
    if (existing) forgetSuspension(existing.id);

    // Optional: enroll in a course right away (and assign a teacher from that course).
    // courseName comes from a website/trial request whose course isn't in the LMS yet — create it.
    const include = { courseTeachers: { select: { teacherId: true } } } as const;
    let course = body.courseId
      ? await prisma.course.findUnique({ where: { id: body.courseId }, include })
      : null;
    const courseName = body.courseName?.trim().slice(0, 120);
    if (!course && courseName) {
      const slug = slugify(courseName) || "course";
      course =
        (await prisma.course.findFirst({
          where: { OR: [{ name: { equals: courseName, mode: "insensitive" } }, { slug }] },
          include,
        })) ?? (await prisma.course.create({ data: { name: courseName, slug, level: "Beginner" }, include }));
    }

    let enrolledCourse: {
      id: string;
      name: string;
      duration: string | null;
      teacherId: string | null;
      teacherName: string | null;
    } | null = null;
    if (course) {
      // Verify the chosen teacher actually teaches this course
      let teacherId: string | null = null;
      if (body.teacherId) {
        const teachesIt =
          course.teacherId === body.teacherId ||
          course.courseTeachers.some((ct) => ct.teacherId === body.teacherId);
        if (teachesIt) teacherId = body.teacherId;
      }
      const enrollment = await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
        update: {},
        create: { studentId: student.id, courseId: course.id, teacherId },
        select: { teacher: { select: { id: true, name: true } } },
      });
      enrolledCourse = {
        id: course.id,
        name: course.name,
        duration: course.duration,
        teacherId: enrollment.teacher?.id ?? null,
        teacherName: enrollment.teacher?.name ?? null,
      };
    }

    // Their requests are done: drop them from Enroll Requests / Free Trials
    await prisma.enrollmentRequest.updateMany({
      where: {
        convertedAt: null,
        OR: [{ email }, ...(body.requestId ? [{ id: body.requestId }] : [])],
      },
      data: { convertedAt: new Date() },
    });

    revalidatePath("/app/admin/students");
    revalidatePath("/app/admin/teachers");
    revalidatePath("/app/admin/courses");
    revalidatePath("/app/admin/trials");
    revalidatePath("/app/admin/enrollments");
    revalidatePath("/app/admin");
    revalidatePath("/app/teacher", "layout");
    return NextResponse.json({ student, password, course: enrolledCourse }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create student";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
