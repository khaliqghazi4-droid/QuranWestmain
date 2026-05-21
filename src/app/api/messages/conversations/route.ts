import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/conversations
// Returns list of unique conversation partners with last message + unread count
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = session.user.id;

  // All messages involving the user
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: me }, { receiverId: me }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  // Group by conversation partner
  const map = new Map<
    string,
    {
      partnerId: string;
      partnerName: string;
      partnerRole: string;
      lastMessage: string;
      lastAt: Date;
      unreadCount: number;
    }
  >();

  for (const m of messages) {
    const partner = m.senderId === me ? m.receiver : m.sender;
    if (!partner) continue;

    const existing = map.get(partner.id);
    if (existing) {
      if (m.senderId !== me && !m.read) existing.unreadCount++;
    } else {
      const unread = m.senderId !== me && !m.read ? 1 : 0;
      map.set(partner.id, {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerRole: partner.role,
        lastMessage: m.content,
        lastAt: m.createdAt,
        unreadCount: unread,
      });
    }
  }

  const conversations = Array.from(map.values()).sort(
    (a, b) => b.lastAt.getTime() - a.lastAt.getTime()
  );

  return NextResponse.json({ conversations });
}
