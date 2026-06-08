import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  submitWebsiteEnrollment,
  type EnrollSubmission,
  type EnrollChild,
} from "@/lib/enroll-source";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/enrollments/website-request
//
// In-app version of the public website's "Enroll Now" form. Same fields,
// same destination (MongoDB enrollments collection) so the admin's existing
// /app/admin/enrollments review flow keeps working unchanged — they assign
// a teacher, schedule the trial, and the request becomes a real Enrollment
// the same way it does for website submissions.
//
// Auth: any signed-in student (we don't restrict to STUDENT role explicitly
// since a teacher could conceivably enroll their own family member, but we
// do block ADMINs to keep the request list clean of test data).
type Body = Partial<Omit<EnrollSubmission, "source" | "children">> & {
  children?: unknown;
};

function trimStr(v: unknown, max = 200): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function parseGender(v: unknown): "male" | "female" | null {
  return v === "male" || v === "female" ? v : null;
}

function parseChildren(raw: unknown): EnrollChild[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const obj = c as Record<string, unknown>;
      const name = trimStr(obj.name, 100);
      if (!name) return null;
      const ageNum = typeof obj.age === "number" ? obj.age : Number(obj.age);
      return {
        name,
        age: Number.isFinite(ageNum) ? ageNum : null,
        gender: parseGender(obj.gender),
      } satisfies EnrollChild;
    })
    .filter((c): c is EnrollChild => c !== null)
    .slice(0, 10);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Admins can't submit enrollment requests" },
      { status: 403 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Required fields — fail fast with the same error format the website uses.
  const course = trimStr(body.course);
  if (!course) return NextResponse.json({ error: "Course is required" }, { status: 400 });

  // We accept the course either by name or by slug/id — normalize against
  // our own table so the admin's existing matching code (which keys on the
  // course name) keeps working.
  const matched = await prisma.course.findFirst({
    where: {
      OR: [{ name: course }, { slug: course }, { id: course }],
      isActive: true,
    },
    select: { name: true },
  });
  const courseName = matched?.name ?? course;

  const fullName = trimStr(body.fullName, 120);
  const email = trimStr(body.email, 200).toLowerCase();
  const whatsapp = trimStr(body.whatsapp, 40);
  const city = trimStr(body.city, 100);
  const country = trimStr(body.country, 100);

  if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  if (!email || !email.includes("@"))
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  if (!whatsapp) return NextResponse.json({ error: "WhatsApp number required" }, { status: 400 });
  if (!country) return NextResponse.json({ error: "Country required" }, { status: 400 });

  const courseFor = body.courseFor === "kid" ? "kid" : "adult";
  const children = courseFor === "kid" ? parseChildren(body.children) : [];

  const payload: EnrollSubmission = {
    course: courseName,
    courseFor,
    gender: parseGender(body.gender),
    tutorGender: parseGender(body.tutorGender),
    fullName,
    email,
    whatsapp,
    city,
    country,
    trialTime: typeof body.trialTime === "string" && body.trialTime ? body.trialTime : null,
    children,
    source: "dashboard",
  };

  try {
    const { id } = await submitWebsiteEnrollment(payload);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to submit enrollment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
