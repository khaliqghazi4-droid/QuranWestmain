import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taughtBy } from "@/lib/note-shares";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  NotesManager,
  type NoteItem,
  type CourseRef,
  type NoteStudent,
} from "./notes-manager";

export const dynamic = "force-dynamic";

export default async function TeacherNotesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;
  const [notes, primaryCourses, coCourses, enrollments] = await Promise.all([
    prisma.teacherNote.findMany({
      where: { teacherId },
      include: {
        course: { select: { id: true, name: true } },
        shares: { select: { studentId: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.course.findMany({
      where: { teacherId },
      select: { id: true, name: true },
    }),
    prisma.courseTeacher.findMany({
      where: { teacherId },
      include: { course: { select: { id: true, name: true } } },
    }),
    // The teacher's students, for sharing notes with them
    prisma.enrollment.findMany({
      where: taughtBy(teacherId),
      select: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Deduped list of teacher's courses
  const courseMap = new Map<string, CourseRef>();
  for (const c of primaryCourses) courseMap.set(c.id, c);
  for (const ct of coCourses) {
    if (!courseMap.has(ct.course.id)) courseMap.set(ct.course.id, ct.course);
  }
  const teacherCourses = Array.from(courseMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // One entry per student, with every course they take with this teacher
  const studentMap = new Map<string, NoteStudent>();
  for (const e of enrollments) {
    const s = studentMap.get(e.student.id) ?? {
      id: e.student.id,
      name: e.student.name,
      courseIds: [],
      courseNames: [],
    };
    s.courseIds.push(e.course.id);
    s.courseNames.push(e.course.name);
    studentMap.set(s.id, s);
  }
  const students = Array.from(studentMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const items: NoteItem[] = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    fileUrl: n.fileUrl,
    fileName: n.fileName,
    courseId: n.courseId,
    courseName: n.course?.name ?? null,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
    sharedWith: n.shares.map((s) => s.studentId),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Notes"
        description="Personal teaching notes — text + PDFs, organized by course. Share a note to let a student see it."
      />
      <NotesManager initialNotes={items} courses={teacherCourses} students={students} />
    </div>
  );
}
