import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminInbox } from "./admin-inbox";

export const dynamic = "force-dynamic";

export default async function AdminMessages({
  searchParams,
}: {
  searchParams: { with?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const me = session.user.id;

  // Build conversation list
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: me }, { receiverId: me }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  const map = new Map<
    string,
    {
      partnerId: string;
      partnerName: string;
      partnerRole: string;
      lastMessage: string;
      lastAt: string;
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
        lastAt: m.createdAt.toISOString(),
        unreadCount: unread,
      });
    }
  }

  const conversations = Array.from(map.values());

  // Active conversation (from query param)
  const activeId = searchParams.with;
  type ThreadMessage = {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    attachmentUrl: string | null;
    attachmentType: "image" | "file" | "voice" | null;
    attachmentName: string | null;
    attachmentMime: string | null;
    attachmentSize: number | null;
  };
  let activeThread: {
    partner: { id: string; name: string; role: string };
    messages: ThreadMessage[];
  } | null = null;

  if (activeId) {
    const partner = await prisma.user.findUnique({
      where: { id: activeId },
      select: { id: true, name: true, role: true },
    });
    if (partner) {
      const thread = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: me, receiverId: activeId },
            { senderId: activeId, receiverId: me },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 200,
      });
      activeThread = {
        partner,
        messages: thread.map((m) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          createdAt: m.createdAt.toISOString(),
          // Preserve attachment fields — without these the server re-render
          // would silently drop voice clips / images / files from the chat.
          attachmentUrl: m.attachmentUrl,
          attachmentType: m.attachmentType as "image" | "file" | "voice" | null,
          attachmentName: m.attachmentName,
          attachmentMime: m.attachmentMime,
          attachmentSize: m.attachmentSize,
        })),
      };

      // Mark inbound as read
      await prisma.message.updateMany({
        where: { senderId: activeId, receiverId: me, read: false },
        data: { read: true },
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description={`${conversations.length} ${conversations.length === 1 ? "conversation" : "conversations"}`}
      />
      <AdminInbox
        currentUserId={me}
        conversations={conversations}
        activeThread={activeThread}
      />
    </div>
  );
}
