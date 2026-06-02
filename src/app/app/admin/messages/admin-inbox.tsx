"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Inbox,
  GraduationCap,
  Users,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import {
  MessageAttachmentView,
  type MessageAttachment,
} from "@/components/messaging/message-attachment";
import { MessageComposer } from "@/components/messaging/message-composer";

type Conversation = {
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
};

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

type Thread = {
  partner: { id: string; name: string; role: string };
  messages: Message[];
};

export function AdminInbox({
  currentUserId,
  conversations,
  activeThread,
}: {
  currentUserId: string;
  conversations: Conversation[];
  activeThread: Thread | null;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>(activeThread?.messages ?? []);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Sync messages when active thread changes
  React.useEffect(() => {
    setMessages(activeThread?.messages ?? []);
  }, [activeThread]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const filtered = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(query.toLowerCase())
  );

  async function send({
    text,
    attachment,
  }: {
    text: string;
    attachment: MessageAttachment | null;
  }) {
    if (!activeThread) return;
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
        receiverId: activeThread.partner.id,
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
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="grid lg:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 240px)" }}>
        {/* Conversation list */}
        <div className="border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {query ? "No matches" : "No messages yet"}
                </p>
                {!query && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    When students/teachers message you, they will appear here.
                  </p>
                )}
              </div>
            ) : (
              filtered.map((c, i) => {
                const isActive = activeThread?.partner.id === c.partnerId;
                return (
                  <Link
                    key={c.partnerId}
                    href={`/app/admin/messages?with=${c.partnerId}`}
                    className={`flex items-center gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors stagger-item ${
                      isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    <Avatar name={c.partnerName} size={40} style={c.partnerRole === "TEACHER" ? "micah" : "avataaars"} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{c.partnerName}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(c.lastAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {c.partnerRole === "TEACHER" ? (
                          <Users className="h-3 w-3 text-primary shrink-0" />
                        ) : (
                          <GraduationCap className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {c.lastMessage}
                        </p>
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {c.unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Active conversation */}
        <div className="flex flex-col">
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="mt-4 text-base font-bold">Select a conversation</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Choose a student or teacher from the list to view and reply to their messages.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
                <Avatar name={activeThread.partner.name} size={44} style={activeThread.partner.role === "TEACHER" ? "micah" : "avataaars"} />
                <div className="flex-1">
                  <p className="text-sm font-bold">{activeThread.partner.name}</p>
                  <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    {activeThread.partner.role === "TEACHER" ? (
                      <>
                        <Users className="h-3 w-3" /> Teacher
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-3 w-3" /> Student
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 p-6 space-y-3 overflow-y-auto bg-background/40">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">
                    No messages in this conversation yet
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-sm"
                            : "bg-card border border-border rounded-bl-sm"
                        }`}>
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
                          <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(m.createdAt).toLocaleString("en-US", {
                              hour: "numeric", minute: "2-digit", hour12: true,
                              month: "short", day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <MessageComposer
                placeholder={`Reply to ${activeThread.partner.name}...`}
                onSend={send}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
