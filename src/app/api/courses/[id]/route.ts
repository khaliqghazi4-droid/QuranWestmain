import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      teacher: { select: { id: true, name: true, image: true, bio: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { teacherIds, ...rest } = body as {
      teacherIds?: string[];
      [k: string]: unknown;
    };

    const course = await prisma.course.update({
      where: { id: params.id },
      data: rest,
    });

    // If teacherIds provided, replace the CourseTeacher set entirely
    if (Array.isArray(teacherIds)) {
      await prisma.courseTeacher.deleteMany({ where: { courseId: params.id } });
      if (teacherIds.length > 0) {
        await prisma.courseTeacher.createMany({
          data: teacherIds.map((teacherId) => ({ courseId: params.id, teacherId })),
          skipDuplicates: true,
        });

        // If no primary teacher, set the first one as primary
        if (!course.teacherId && teacherIds[0]) {
          await prisma.course.update({
            where: { id: params.id },
            data: { teacherId: teacherIds[0] },
          });
        }
        // If primary teacher removed from list, change to first in list
        if (course.teacherId && !teacherIds.includes(course.teacherId)) {
          await prisma.course.update({
            where: { id: params.id },
            data: { teacherId: teacherIds[0] },
          });
        }
      } else {
        // No teachers
        await prisma.course.update({
          where: { id: params.id },
          data: { teacherId: null },
        });
      }
    }

    return NextResponse.json({ course });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
