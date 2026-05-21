import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages?with=userId  → fetch conversation thread
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const otherId = searchParams.get("with");
  if (!otherId) return NextResponse.json({ error: "with=userId required" }, { status: 400 });

  const me = session.user.id;

  // Students and Teachers can only message Admin
  if (session.user.role === "STUDENT" || session.user.role === "TEACHER") {
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { role: true } });
    if (!other || other.role !== "ADMIN") {
      return NextResponse.json({ error: "You can only message admin" }, { status: 403 });
    }
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me, receiverId: otherId },
        { senderId: otherId, receiverId: me },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Mark messages from other → me as read
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: me, read: false },
    data: { read: true },
  });

  return NextResponse.json({ messages });
}

// POST /api/messages  → send a message
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { receiverId, content } = (await req.json()) as {
      receiverId?: string;
      content?: string;
    };

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "receiverId and content required" }, { status: 400 });
    }

    // Students and Teachers can only send to Admin
    if (session.user.role === "STUDENT" || session.user.role === "TEACHER") {
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { role: true },
      });
      if (!receiver || receiver.role !== "ADMIN") {
        return NextResponse.json(
          { error: "You can only contact the admin" },
          { status: 403 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
