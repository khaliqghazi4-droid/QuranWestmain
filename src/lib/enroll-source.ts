import { prisma } from "@/lib/prisma";

// Enrollment requests submitted from the public website's "Enroll Now" form
// and the student dashboard, stored in the EnrollmentRequest table.

export async function pingEnrollDb(): Promise<boolean> {
  try {
    await prisma.enrollmentRequest.findFirst({ select: { id: true } });
    return true;
  } catch {
    return false;
  }
}

export type EnrollChild = {
  name: string;
  age: number | null;
  gender: "male" | "female" | null;
};

export type WebsiteEnrollment = {
  id: string;
  course: string;
  courseFor: "adult" | "kid";
  tutorGender: "male" | "female" | null;
  gender: "male" | "female" | null;
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  country: string;
  trialTime: string | null;
  children: EnrollChild[];
  createdAt: string | null;
};

export type EnrollSubmission = {
  course: string;            // course name (matches a row in the `courses` table when possible)
  courseFor: "adult" | "kid";
  gender: "male" | "female" | null;
  tutorGender: "male" | "female" | null;
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  country: string;
  trialTime: string | null;  // ISO timestamp the student picked, optional
  children: EnrollChild[];
  source: "website" | "dashboard"; // so admin can tell where it came from
};

export function trimStr(v: unknown, max = 200): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export function parseGender(v: unknown): "male" | "female" | null {
  return v === "male" || v === "female" ? v : null;
}

export function parseChildren(raw: unknown): EnrollChild[] {
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

export async function submitWebsiteEnrollment(
  payload: EnrollSubmission
): Promise<{ id: string }> {
  const trialTime = payload.trialTime ? new Date(payload.trialTime) : null;
  const row = await prisma.enrollmentRequest.create({
    data: {
      ...payload,
      trialTime: trialTime && !Number.isNaN(trialTime.getTime()) ? trialTime : null,
    },
    select: { id: true },
  });
  return { id: row.id };
}

// inTrials: true = Free Trial list, false = Enroll Requests list (both skip requests
// already added as students); omitted = every request, for lookups by id.
export async function getWebsiteEnrollments(
  opts: { inTrials?: boolean } = {}
): Promise<WebsiteEnrollment[]> {
  const rows = await prisma.enrollmentRequest.findMany({
    where:
      opts.inTrials === undefined ? undefined : { inTrials: opts.inTrials, convertedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    course: r.course,
    courseFor: r.courseFor === "kid" ? "kid" : "adult",
    tutorGender: parseGender(r.tutorGender),
    gender: parseGender(r.gender),
    fullName: r.fullName,
    email: r.email,
    whatsapp: r.whatsapp,
    city: r.city,
    country: r.country,
    trialTime: r.trialTime ? r.trialTime.toISOString() : null,
    children: parseChildren(r.children),
    createdAt: r.createdAt.toISOString(),
  }));
}
