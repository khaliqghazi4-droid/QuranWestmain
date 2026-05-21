import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      teacher: { select: { id: true, name: true, image: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, level, duration, classDuration, price, image, teacherId } =
      body as {
        name?: string;
        description?: string;
        level?: string;
        duration?: string;
        classDuration?: number;
        price?: number;
        image?: string;
        teacherId?: string;
      };

    if (!name || !level) {
      return NextResponse.json({ error: "Name and level are required" }, { status: 400 });
    }

    const slug = slugify(name);
    const course = await prisma.course.create({
      data: {
        name,
        slug,
        description,
        level,
        duration,
        classDuration: classDuration ?? 45,
        price: price ?? 0,
        image,
        teacherId: teacherId || null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create course";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A course with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
