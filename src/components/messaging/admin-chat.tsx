"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import { Avatar } from "@/components/avatar";
import {
  MessageAttachmentView,
  type MessageAttachment,
} from "@/components/messaging/message-attachment";
import { MessageComposer } from "@/components/messaging/message-composer";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentType?: "image" | "file" | "voice" | null;
  attachmentName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
};

export function AdminChat({
  currentUserId,
  admin,
  initialMessages,
}: {
  currentUserId: string;
  admin: { id: string; name: string };
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = React.useState(initialMessages);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send({
    text,
    attachment,
  }: {
    text: string;
    attachment: MessageAttachment | null;
  }) {
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      content: text,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      attachmentUrl: attachment?.url ?? null,
      attachmentType: attachment?.type ?? null,
      attachmentName: attachment?.name ?? null,
      attachmentMime: attachment?.mime ?? null,
      attachmentSize: attachment?.size ?? null,
    };
    setMessages((prev) => [...prev, optimistic]);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: admin.id,
        content: text,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentName: attachment?.name,
        attachmentMime: attachment?.mime,
        attachmentSize: attachment?.size,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      throw new Error(data.error ?? "Failed to send");
    }
    const data = await res.json();
    setMessages((prev) =>
      prev.map((m) => (m.id === optimistic.id ? { ...optimistic, ...data.message } : m))
    );
    router.refresh();
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 240px)" }}
    >
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
        <div className="relative">
          <Avatar name={admin.name} size={44} style="micah" />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground ring-2 ring-card">
            <ShieldCheck className="h-2.5 w-2.5" />
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{admin.name}</p>
          <p className="text-[11px] text-emerald-600 inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Academy Administration
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
          <Lock className="h-2.5 w-2.5" /> Verified Channel
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 space-y-3 overflow-y-auto bg-background/40">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold">Start a conversation</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Send a message, file or voice note to the academy administration.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  {m.attachmentUrl && m.attachmentType && (
                    <MessageAttachmentView
                      attachment={{
                        url: m.attachmentUrl,
                        type: m.attachmentType,
                        name: m.attachmentName ?? "attachment",
                        mime: m.attachmentMime ?? "",
                        size: m.attachmentSize ?? 0,
                      }}
                      isMe={isMe}
                    />
                  )}
                  {m.content && (
                    <p className="leading-relaxed whitespace-pre-wrap mt-1 first:mt-0">
                      {m.content}
                    </p>
                  )}
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageComposer placeholder="Type your message to admin…" onSend={send} />
      <p className="px-4 pb-3 text-[10px] text-muted-foreground text-center">
        🔒 Secure channel · text, images, PDFs, voice notes
      </p>
    </div>
  );
}
