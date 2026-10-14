import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taughtBy } from "@/lib/note-shares";

export const dynamic = "force-dynamic";

// POST /api/teacher/notes/[id]/shares — { add?: studentIds, remove?: studentIds }
// Shares the note with (or hides it from) the teacher's own students.
// Returns the full list of student ids the note is now shared with.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const teacherId = session.user.id;

  const note = await prisma.teacherNote.findUnique({
    where: { id: params.id },
    select: { teacherId: true },
  });
  if (!note || note.teacherId !== teacherId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { add?: unknown; remove?: unknown };
  const ids = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
  const add = ids(body.add);
  const remove = ids(body.remove);

  try {
    if (add.length > 0) {
      // Only students this teacher actually teaches
      const allowed = await prisma.enrollment.findMany({
        where: { studentId: { in: add }, ...taughtBy(teacherId) },
        select: { studentId: true },
        distinct: ["studentId"],
      });
      if (allowed.length < new Set(add).size) {
        return NextResponse.json(
          { error: "You can only share notes with your own students" },
          { status: 403 }
        );
      }
      await prisma.teacherNoteShare.createMany({
        data: allowed.map((a) => ({ noteId: params.id, studentId: a.studentId })),
        skipDuplicates: true,
      });
    }
    if (remove.length > 0) {
      await prisma.teacherNoteShare.deleteMany({
        where: { noteId: params.id, studentId: { in: remove } },
      });
    }

    const shares = await prisma.teacherNoteShare.findMany({
      where: { noteId: params.id },
      select: { studentId: true },
    });
    revalidatePath("/app/teacher/notes");
    revalidatePath("/app/student/notes");
    return NextResponse.json({ sharedWith: shares.map((s) => s.studentId) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sharing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
