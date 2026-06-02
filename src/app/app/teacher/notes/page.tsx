import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { NotesManager, type NoteItem, type CourseRef } from "./notes-manager";

export const dynamic = "force-dynamic";

export default async function TeacherNotesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const teacherId = session.user.id;
  const [notes, primaryCourses, coCourses] = await Promise.all([
    prisma.teacherNote.findMany({
      where: { teacherId },
      include: { course: { select: { id: true, name: true } } },
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

  const items: NoteItem[] = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    fileUrl: n.fileUrl,
    fileName: n.fileName,
    courseId: n.courseId,
    courseName: n.course?.name ?? null,
    updatedAt: n.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Notes"
        description="Personal teaching notes — text + PDFs, organized by course"
      />
      <NotesManager initialNotes={items} courses={teacherCourses} />
    </div>
  );
}
