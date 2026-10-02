import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminChat } from "@/components/messaging/admin-chat";
import { chatMessageInclude, toChatMessage } from "@/lib/chat-message";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherMessages() {
  const [session, admin] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const currentUserId = session?.user?.id;

  if (!admin) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No admin is available right now. Please try again later.
        </p>
      </div>
    );
  }

  const [initialMessages] = currentUserId
    ? await Promise.all([
        prisma.message.findMany({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: admin.id },
              { senderId: admin.id, receiverId: currentUserId },
            ],
          },
          orderBy: { createdAt: "asc" },
          take: 200,
          include: chatMessageInclude,
        }),
        // Opening the chat counts as seeing it: clears the header bell badge
        prisma.message.updateMany({
          where: { senderId: admin.id, receiverId: currentUserId, read: false },
          data: { read: true },
        }),
      ])
    : [[]];

  return (
    // Fill <main>'s content box exactly (it has a definite height in the
    // dashboard shell), so the page itself never scrolls; only the messages do
    <AdminChat
      heightClassName="h-full min-h-[420px]"
      currentUserId={currentUserId ?? ""}
      admin={admin}
      initialMessages={initialMessages.map(toChatMessage)}
    />
  );
}
