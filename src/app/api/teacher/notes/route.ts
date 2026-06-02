import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/teacher/notes — list teacher's own notes
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId") || undefined;

  const notes = await prisma.teacherNote.findMany({
    where: { teacherId: session.user.id, ...(courseId ? { courseId } : {}) },
    include: { course: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ notes });
}

// POST /api/teacher/notes — create a new note
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      title?: string;
      content?: string;
      courseId?: string;
      fileUrl?: string;
      fileName?: string;
    };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // If courseId provided, verify teacher teaches it (primary or co-teacher)
    let courseId: string | null = null;
    if (body.courseId) {
      const owns = await prisma.course.findFirst({
        where: {
          id: body.courseId,
          OR: [
            { teacherId: session.user.id },
            { courseTeachers: { some: { teacherId: session.user.id } } },
          ],
        },
      });
      if (owns) courseId = body.courseId;
    }

    const note = await prisma.teacherNote.create({
      data: {
        teacherId: session.user.id,
        courseId,
        title,
        content: body.content?.trim() || null,
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
      },
      include: { course: { select: { id: true, name: true } } },
    });
    revalidatePath("/app/teacher/notes");
    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
