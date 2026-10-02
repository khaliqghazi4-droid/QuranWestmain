"use client";

import * as React from "react";
import type { MessageAttachment } from "@/components/messaging/message-attachment";
import type { ChatMessage } from "@/lib/chat-message";

// Message state for one open conversation: optimistic send (with an optional
// reply), edit and delete. Shared by the student/teacher chat box and the
// admin inbox. The list updates from each API response, with no full-page
// refresh (that re-rendered the whole server page every time).
// `initialMessages` must keep a stable identity between renders (server props,
// or a shared empty array), since a new array resets the list.
export function useChatMessages({
  initialMessages,
  currentUserId,
  receiverId,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  receiverId: string | null;
}) {
  const [messages, setMessages] = React.useState(initialMessages);
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null);

  // Server refreshes (and switching conversations) bring a new list
  React.useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  React.useEffect(() => {
    setReplyTo(null);
  }, [receiverId]);

  async function send({ text, attachment }: { text: string; attachment: MessageAttachment | null }) {
    if (!receiverId) return;
    const reply = replyTo;
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      content: text,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      attachmentUrl: attachment?.url ?? null,
      attachmentType: attachment?.type ?? null,
      attachmentName: attachment?.name ?? null,
      attachmentMime: attachment?.mime ?? null,
      attachmentSize: attachment?.size ?? null,
      editedAt: null,
      deletedAt: null,
      replyTo: reply
        ? {
            id: reply.id,
            senderId: reply.senderId,
            content: reply.content,
            attachmentType: reply.attachmentType,
            deleted: false,
          }
        : null,
    };
    setMessages((prev) => [...prev, optimistic]);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId,
        content: text,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentName: attachment?.name,
        attachmentMime: attachment?.mime,
        attachmentSize: attachment?.size,
        replyToId: reply?.id,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      throw new Error(data.error ?? "Failed to send");
    }
    const data = (await res.json()) as { message: ChatMessage };
    setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)));
    setReplyTo(null);
  }

  // PATCH (edit) or DELETE one of my messages; swaps in the server's version
  async function change(id: string, init: RequestInit): Promise<string | null> {
    const res = await fetch(`/api/messages/${id}`, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Something went wrong";
    setMessages((prev) => prev.map((m) => (m.id === id ? (data.message as ChatMessage) : m)));
    return null;
  }

  const editMessage = (id: string, content: string) =>
    change(id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

  const deleteMessage = (id: string) => change(id, { method: "DELETE" });

  return { messages, replyTo, setReplyTo, send, editMessage, deleteMessage };
}
