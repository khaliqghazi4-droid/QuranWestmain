// Helpers for the in-app class room.
//
// A "room id" identifies the source of a class so we can fetch its student /
// course context and embed the same Jitsi room for both teacher and student.
// Format: `booking-<bookingSlotId>` | `trial-<trialAssignmentId>` | `course-<slug>`

import { prisma } from "@/lib/prisma";
import { getWebsiteEnrollments } from "@/lib/enroll-source";

export type ClassRoomContext = {
  roomId: string;            // canonical (`booking-x` etc.)
  jitsiRoomName: string;     // the Jitsi room slug everyone joins
  studentName: string;
  courseName: string;
  courseId: string | null;   // null for trials that don't map to a course in DB
  durationMin: number;
  startUTC: number | null;   // null for ad-hoc "course-<slug>" rooms
  teacherId: string | null;  // the teacher assigned to this class
  kind: "booking" | "trial" | "course";
};

function safeSlug(s: string) {
  return s.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64);
}

// Parse a room id like `booking-abc123` → { kind: "booking", id: "abc123" }
export function parseRoomId(raw: string): { kind: ClassRoomContext["kind"]; id: string } | null {
  if (raw.startsWith("booking-")) return { kind: "booking", id: raw.slice("booking-".length) };
  if (raw.startsWith("trial-")) return { kind: "trial", id: raw.slice("trial-".length) };
  if (raw.startsWith("course-")) return { kind: "course", id: raw.slice("course-".length) };
  return null;
}

// Resolve a roomId to full context (student, course, teacher, jitsi room name).
// Returns null if the id is malformed or the underlying record was deleted.
export async function resolveRoom(roomId: string): Promise<ClassRoomContext | null> {
  const parsed = parseRoomId(roomId);
  if (!parsed) return null;

  if (parsed.kind === "booking") {
    const b = await prisma.bookingSlot.findUnique({
      where: { id: parsed.id },
      include: {
        enrollment: {
          include: {
            student: { select: { name: true } },
            course: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!b) return null;
    return {
      roomId,
      jitsiRoomName: `OnlineQuranAcademy-${safeSlug(b.enrollment.course.slug)}-${safeSlug(b.id)}`,
      studentName: b.enrollment.student.name,
      courseName: b.enrollment.course.name,
      courseId: b.enrollment.course.id,
      durationMin: b.duration,
      startUTC: null, // booking is recurring; not a single timestamp
      teacherId: b.teacherId,
      kind: "booking",
    };
  }

  if (parsed.kind === "trial") {
    const a = await prisma.trialAssignment.findUnique({ where: { id: parsed.id } });
    if (!a) return null;
    // Look up trial metadata from the website (MongoDB) for nicer labels
    let studentName = "Trial student";
    let courseName = "Free trial class";
    try {
      const enrollments = await getWebsiteEnrollments();
      const e = enrollments.find((x) => x.id === a.mongoEnrollmentId);
      if (e) {
        studentName = e.fullName;
        courseName = e.course;
      }
    } catch {
      /* tolerate Mongo outage */
    }
    return {
      roomId,
      jitsiRoomName: `OnlineQuranAcademy-trial-${safeSlug(a.mongoEnrollmentId)}`,
      studentName,
      courseName,
      courseId: null,
      durationMin: 30,
      startUTC: a.trialTime.getTime(),
      teacherId: a.teacherId,
      kind: "trial",
    };
  }

  // course-<slug> — generic per-course room (used by student schedule fallback)
  const course = await prisma.course.findUnique({
    where: { slug: parsed.id },
    select: { id: true, name: true, slug: true, teacherId: true },
  });
  if (!course) return null;
  return {
    roomId,
    jitsiRoomName: `OnlineQuranAcademy-${safeSlug(course.slug)}`,
    studentName: "Course room",
    courseName: course.name,
    courseId: course.id,
    durationMin: 60,
    startUTC: null,
    teacherId: course.teacherId,
    kind: "course",
  };
}
