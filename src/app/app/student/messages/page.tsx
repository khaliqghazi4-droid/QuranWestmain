import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminChat } from "@/components/messaging/admin-chat";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentMessages() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [admin, messages] = await Promise.all([
    prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    // empty until admin exists
    Promise.resolve([] as { id: string; content: string; senderId: string; createdAt: Date }[]),
  ]);

  if (!admin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Messages"
          description="Contact the academy administration"
        />
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No admin is available right now. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const initialMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: admin.id },
        { senderId: admin.id, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  // discard the unused placeholder
  void messages;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Contact the academy administration directly"
      />
      <AdminChat
        currentUserId={session.user.id}
        admin={admin}
        initialMessages={initialMessages.map((m) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
