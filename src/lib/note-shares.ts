// Teacher notes shared with students (TeacherNoteShare).

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ClassRoomContext } from "@/lib/class-room";
import type { NoteItem } from "@/app/app/teacher/notes/notes-manager";

export type SharedNote = NoteItem & { teacherName: string; sharedAt: string };

// Enrollments of students this teacher teaches: as the student's assigned
// teacher, as the course's main teacher, or through a booked class.
export function taughtBy(teacherId: string): Prisma.EnrollmentWhereInput {
  return {
    OR: [{ teacherId }, { course: { teacherId } }, { bookings: { some: { teacherId } } }],
  };
}

const shareInclude = {
  note: {
    include: {
      course: { select: { name: true } },
      teacher: { select: { name: true } },
    },
  },
} satisfies Prisma.TeacherNoteShareInclude;

type ShareRow = Prisma.TeacherNoteShareGetPayload<{ include: typeof shareInclude }>;

function toSharedNote(s: ShareRow): SharedNote {
  return {
    id: s.note.id,
    title: s.note.title,
    content: s.note.content,
    fileUrl: s.note.fileUrl,
    fileName: s.note.fileName,
    courseId: s.note.courseId,
    courseName: s.note.course?.name ?? null,
    createdAt: s.note.createdAt.toISOString(),
    updatedAt: s.note.updatedAt.toISOString(),
    // Students don't see who else a note is shared with
    sharedWith: [],
    teacherName: s.note.teacher.name,
    sharedAt: s.createdAt.toISOString(),
  };
}

// Every note shared with a student, newest share first (their Notes page)
export async function studentSharedNotes(studentId: string): Promise<SharedNote[]> {
  const shares = await prisma.teacherNoteShare.findMany({
    where: { studentId },
    include: shareInclude,
    orderBy: { createdAt: "desc" },
  });
  return shares.map(toSharedNote);
}

// Notes shown in a student's class room: shared by this class's teacher, for
// this class's course or with no course (same scope as the teacher's panel)
export async function studentClassNotes(
  studentId: string,
  room: Pick<ClassRoomContext, "kind" | "teacherId" | "courseId">
): Promise<SharedNote[]> {
  if (room.kind === "trial" || !room.teacherId) return [];
  const shares = await prisma.teacherNoteShare.findMany({
    where: {
      studentId,
      note: {
        teacherId: room.teacherId,
        ...(room.courseId ? { OR: [{ courseId: room.courseId }, { courseId: null }] } : {}),
      },
    },
    include: shareInclude,
    orderBy: { createdAt: "desc" },
  });
  return shares.map(toSharedNote);
}
