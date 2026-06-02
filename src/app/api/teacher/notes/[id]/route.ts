import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function loadOwned(noteId: string, teacherId: string) {
  const note = await prisma.teacherNote.findUnique({ where: { id: noteId } });
  if (!note || note.teacherId !== teacherId) return null;
  return note;
}

// PATCH /api/teacher/notes/[id] — update title/content/courseId/fileUrl/fileName
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await loadOwned(params.id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = (await req.json()) as {
      title?: string;
      content?: string | null;
      courseId?: string | null;
      fileUrl?: string | null;
      fileName?: string | null;
    };
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) {
      const t = body.title.trim();
      if (!t) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      data.title = t;
    }
    if (body.content !== undefined) data.content = body.content ?? null;
    if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl ?? null;
    if (body.fileName !== undefined) data.fileName = body.fileName ?? null;
    if (body.courseId !== undefined) {
      if (body.courseId === null || body.courseId === "") {
        data.courseId = null;
      } else {
        const owns = await prisma.course.findFirst({
          where: {
            id: body.courseId,
            OR: [
              { teacherId: session.user.id },
              { courseTeachers: { some: { teacherId: session.user.id } } },
            ],
          },
        });
        data.courseId = owns ? body.courseId : null;
      }
    }

    const note = await prisma.teacherNote.update({
      where: { id: params.id },
      data,
      include: { course: { select: { id: true, name: true } } },
    });
    revalidatePath("/app/teacher/notes");
    return NextResponse.json({ note });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/teacher/notes/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await loadOwned(params.id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.teacherNote.delete({ where: { id: params.id } });
  revalidatePath("/app/teacher/notes");
  return NextResponse.json({ ok: true });
}
