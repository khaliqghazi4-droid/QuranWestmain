import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession, ACTIVE_STUDENT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PER_GROUP = 5;

// GET /api/admin/search?q=… — suggestions for the dashboard header search:
// students (the same set the Students page lists), teachers and courses whose
// name, email or phone contains the text.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ students: [], teachers: [], courses: [] });

  const has = { contains: q, mode: "insensitive" as const };
  const [students, teachers, courses] = await Promise.all([
    prisma.user.findMany({
      where: { ...ACTIVE_STUDENT, OR: [{ name: has }, { email: has }, { phone: has }] },
      select: { id: true, name: true, email: true, image: true, country: true },
      orderBy: { name: "asc" },
      take: PER_GROUP,
    }),
    prisma.user.findMany({
      where: { role: "TEACHER", OR: [{ name: has }, { email: has }, { phone: has }] },
      select: { id: true, name: true, email: true, image: true },
      orderBy: { name: "asc" },
      take: PER_GROUP,
    }),
    prisma.course.findMany({
      where: { OR: [{ name: has }, { slug: has }] },
      select: { id: true, name: true, level: true, isActive: true },
      orderBy: { name: "asc" },
      take: PER_GROUP,
    }),
  ]);

  return NextResponse.json({ students, teachers, courses });
}
