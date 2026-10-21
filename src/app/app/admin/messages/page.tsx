import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminInbox } from "./admin-inbox";
import {
  chatMessageInclude,
  messagePreview,
  toChatMessage,
  type ChatMessage,
} from "@/lib/chat-message";
import { AlertCircle } from "lucide-react";
import { MessagesShell } from "./shell";

export const dynamic = "force-dynamic";

export default function AdminMessages({
  searchParams,
}: {
  searchParams: { with?: string };
}) {
  return (
    // Fill <main>'s content box exactly so only the lists scroll, not the page
    <div className="h-full min-h-[420px]">
      <Suspense fallback={<MessagesShell />}>
        <MessagesData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MessagesData({ searchParams }: { searchParams: { with?: string } }) {
  const session = await getServerSession(authOptions);

  const me = session?.user?.id ?? "no-user";

  type ConversationEntry = {
    partnerId: string;
    partnerName: string;
    partnerRole: string;
    partnerImage: string | null;
    lastMessage: string;
    lastAt: string;
    unreadCount: number;
    // the last message was the admin's, and whether the other side has read it
    lastFromMe: boolean;
    lastRead: boolean;
  };
  let conversations: ConversationEntry[] = [];
  let activeThread: {
    partner: { id: string; name: string; role: string; image: string | null };
    messages: ChatMessage[];
  } | null = null;
  let fetchError: string | null = null;

  try {
    const activeId = searchParams.with;
    // Everything in one parallel round: the DB is far away (~250ms a query),
    // so running these one after another made opening a chat slow
    const [messages, partner, thread] = await Promise.all([
      // Only what the conversation list needs, not whole message rows
      prisma.message.findMany({
        where: { OR: [{ senderId: me }, { receiverId: me }] },
        orderBy: { createdAt: "desc" },
        select: {
          senderId: true,
          content: true,
          attachmentType: true,
          read: true,
          deletedAt: true,
          createdAt: true,
          sender: { select: { id: true, name: true, role: true, image: true } },
          receiver: { select: { id: true, name: true, role: true, image: true } },
        },
      }),
      activeId
        ? prisma.user.findUnique({
            where: { id: activeId },
            select: { id: true, name: true, role: true, image: true },
          })
        : null,
      activeId
        ? prisma.message.findMany({
            where: {
              OR: [
                { senderId: me, receiverId: activeId },
                { senderId: activeId, receiverId: me },
              ],
            },
            orderBy: { createdAt: "asc" },
            take: 200,
            include: chatMessageInclude,
          })
        : [],
      // Opening a thread marks its incoming messages read
      activeId
        ? prisma.message.updateMany({
            where: { senderId: activeId, receiverId: me, read: false },
            data: { read: true },
          })
        : null,
    ]);

    const map = new Map<string, ConversationEntry>();
    for (const m of messages) {
      const partner = m.senderId === me ? m.receiver : m.sender;
      if (!partner) continue;
      const existing = map.get(partner.id);
      if (existing) {
        if (m.senderId !== me && !m.read && !m.deletedAt) existing.unreadCount++;
      } else {
        const unread = m.senderId !== me && !m.read && !m.deletedAt ? 1 : 0;
        map.set(partner.id, {
          partnerId: partner.id,
          partnerName: partner.name,
          partnerRole: partner.role,
          partnerImage: partner.image,
          lastMessage: messagePreview(m),
          lastAt: m.createdAt.toISOString(),
          unreadCount: unread,
          lastFromMe: m.senderId === me,
          lastRead: m.read,
        });
      }
    }
    conversations = Array.from(map.values());

    if (partner) {
      activeThread = { partner, messages: thread.map(toChatMessage) };
      // Just marked read above, so the open conversation has no unread badge
      const open = conversations.find((c) => c.partnerId === partner.id);
      if (open) open.unreadCount = 0;
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Could not load messages";
  }

  if (fetchError) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Could not load messages</p>
          <p className="text-muted-foreground mt-1 text-xs">{fetchError}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Try running: <code className="font-mono bg-muted px-1 rounded">npx prisma db push</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminInbox
      currentUserId={me}
      conversations={conversations}
      activeThread={activeThread}
    />
  );
}
