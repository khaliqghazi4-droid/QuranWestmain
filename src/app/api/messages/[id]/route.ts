import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModifyMessage, chatMessageInclude, toChatMessage } from "@/lib/chat-message";

// Loads the message and checks the signed-in user may change it: only the
// sender, within 15 minutes of sending, and not once it's deleted
async function loadOwnMessage(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return { error: NextResponse.json({ error: "Message not found" }, { status: 404 }) };
  }
  if (message.senderId !== session.user.id) {
    return { error: NextResponse.json({ error: "You can only change your own messages" }, { status: 403 }) };
  }
  if (!canModifyMessage(message, session.user.id)) {
    return {
      error: NextResponse.json(
        { error: "Messages can only be edited or deleted within 15 minutes" },
        { status: 403 }
      ),
    };
  }
  return { message };
}

// PATCH /api/messages/[id]  { content } → edit the text (caption for attachments)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { message, error } = await loadOwnMessage(params.id);
  if (error) return error;

  try {
    const { content } = (await req.json()) as { content?: string };
    const text = (content ?? "").trim();
    if (!text && !message.attachmentUrl) {
      return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });
    }
    const updated = await prisma.message.update({
      where: { id: message.id },
      data: { content: text, editedAt: new Date() },
      include: chatMessageInclude,
    });
    return NextResponse.json({ message: toChatMessage(updated) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Edit failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/messages/[id] → "This message was deleted" for both sides;
// the text and attachment are wiped, the row stays so the chat keeps its place
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { message, error } = await loadOwnMessage(params.id);
  if (error) return error;

  try {
    const updated = await prisma.message.update({
      where: { id: message.id },
      data: {
        deletedAt: new Date(),
        content: "",
        attachmentUrl: null,
        attachmentType: null,
        attachmentName: null,
        attachmentMime: null,
        attachmentSize: null,
      },
      include: chatMessageInclude,
    });
    return NextResponse.json({ message: toChatMessage(updated) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
