import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  submitWebsiteEnrollment,
  trimStr,
  parseGender,
  parseChildren,
} from "@/lib/enroll-source";

// POST /api/enroll — handles the public "Enroll Now" form submission
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const course = trimStr(body.course, 120);
  const fullName = trimStr(body.fullName, 120);
  const email = trimStr(body.email, 200).toLowerCase();
  const whatsapp = trimStr(body.whatsapp, 40);
  const city = trimStr(body.city, 100);
  const country = trimStr(body.country, 100);

  if (!fullName || !email || !whatsapp || !course || !city || !country) {
    return NextResponse.json(
      { message: "Please fill in all required fields." },
      { status: 400 }
    );
  }

  const courseFor = body.courseFor === "kid" ? "kid" : "adult";
  const gender = parseGender(body.gender);

  try {
    const matched = await prisma.course.findFirst({
      where: { name: { equals: course, mode: "insensitive" } },
      select: { name: true },
    });

    const { id } = await submitWebsiteEnrollment({
      course: matched?.name ?? course,
      courseFor,
      gender,
      tutorGender: parseGender(body.tutorGender),
      fullName,
      email,
      whatsapp,
      city,
      country,
      trialTime: typeof body.trialTime === "string" && body.trialTime ? body.trialTime : null,
      children: courseFor === "kid" ? parseChildren(body.children) : [],
      source: "website",
    });

    // Lead account with no password; the admin sets one when adding them as a student.
    try {
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            name: fullName,
            phone: whatsapp,
            password: "",
            role: "STUDENT",
            country,
            gender: gender === "male" ? "MALE" : gender === "female" ? "FEMALE" : undefined,
          },
        });
      }
    } catch (e) {
      console.error("Enroll API: could not create lead user:", e);
    }

    revalidatePath("/app/admin/enrollments");
    revalidatePath("/app/admin/students");
    revalidatePath("/app/admin");
    return NextResponse.json(
      { message: "Enrollment submitted successfully!", id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Enroll API error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
