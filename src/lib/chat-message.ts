// Shared shape + rules for chat messages (student/teacher chat box and the
// admin inbox). Safe to import from client components: Prisma is type-only.

import type { Message, Prisma } from "@prisma/client";

// Senders can edit or delete a message for this long after sending it
export const MESSAGE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export type ChatAttachmentType = "image" | "file" | "voice";

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  attachmentUrl: string | null;
  attachmentType: ChatAttachmentType | null;
  attachmentName: string | null;
  attachmentMime: string | null;
  attachmentSize: number | null;
  editedAt: string | null;
  deletedAt: string | null;
  // Small preview of the message this one replies to
  replyTo: {
    id: string;
    senderId: string;
    content: string;
    attachmentType: ChatAttachmentType | null;
    deleted: boolean;
  } | null;
};

// Prisma `include` that loads what toChatMessage needs
export const chatMessageInclude = {
  replyTo: {
    select: { id: true, senderId: true, content: true, attachmentType: true, deletedAt: true },
  },
} satisfies Prisma.MessageInclude;

type MessageWithReply = Message & {
  replyTo: {
    id: string;
    senderId: string;
    content: string;
    attachmentType: string | null;
    deletedAt: Date | null;
  } | null;
};

export function toChatMessage(m: MessageWithReply): ChatMessage {
  return {
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
    attachmentUrl: m.attachmentUrl,
    attachmentType: m.attachmentType as ChatAttachmentType | null,
    attachmentName: m.attachmentName,
    attachmentMime: m.attachmentMime,
    attachmentSize: m.attachmentSize,
    editedAt: m.editedAt?.toISOString() ?? null,
    deletedAt: m.deletedAt?.toISOString() ?? null,
    replyTo: m.replyTo
      ? {
          id: m.replyTo.id,
          senderId: m.replyTo.senderId,
          content: m.replyTo.content,
          attachmentType: m.replyTo.attachmentType as ChatAttachmentType | null,
          deleted: !!m.replyTo.deletedAt,
        }
      : null,
  };
}

// Only the sender, only within the edit window, and not once deleted
export function canModifyMessage(
  m: { senderId: string; createdAt: string | Date; deletedAt: string | Date | null },
  userId: string,
  now: number = Date.now()
): boolean {
  if (m.senderId !== userId || m.deletedAt) return false;
  return now - new Date(m.createdAt).getTime() <= MESSAGE_EDIT_WINDOW_MS;
}

// One-line text for previews (reply quote, conversation list)
export function messagePreview(m: {
  content: string;
  attachmentType: string | null;
  deleted?: boolean;
  deletedAt?: string | Date | null;
}): string {
  if (m.deleted || m.deletedAt) return "This message was deleted";
  if (m.content) return m.content;
  if (m.attachmentType === "image") return "📷 Photo";
  if (m.attachmentType === "voice") return "🎤 Voice message";
  if (m.attachmentType === "file") return "📄 File";
  return "";
}
