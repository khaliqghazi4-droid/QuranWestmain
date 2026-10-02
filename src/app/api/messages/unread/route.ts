import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/unread  → unread count + last 5 messages for the bell dropdown
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = session.user.id;

  const messages = await prisma.message.findMany({
    where: { receiverId: me, read: false, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      content: true,
      attachmentType: true,
      createdAt: true,
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  const count = await prisma.message.count({
    where: { receiverId: me, read: false, deletedAt: null },
  });

  return NextResponse.json({ count, messages });
}
