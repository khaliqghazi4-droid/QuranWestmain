"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Inbox,
  GraduationCap,
  Users,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { MessageComposer } from "@/components/messaging/message-composer";
import { ChatThread } from "@/components/messaging/chat-thread";
import { useChatMessages } from "@/components/messaging/use-chat-messages";
import { messagePreview, type ChatMessage } from "@/lib/chat-message";

type Conversation = {
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
};

type Thread = {
  partner: { id: string; name: string; role: string };
  messages: ChatMessage[];
};

// Stable empty list: a fresh [] each render would keep resetting the thread
const NO_MESSAGES: ChatMessage[] = [];

// Conversation list width on large screens: drag the divider to shrink it (up
// to its full 320px), double-click it to toggle full / avatars-only. The width
// is remembered per browser.
const LIST_MAX = 320;
const LIST_MIN = 72;
const LIST_COMPACT = 160; // narrower than this: avatars only
const LIST_WIDTH_KEY = "admin-inbox-list-width";

export function AdminInbox({
  currentUserId,
  conversations,
  activeThread,
}: {
  currentUserId: string;
  conversations: Conversation[];
  activeThread: Thread | null;
}) {
  const [query, setQuery] = React.useState("");
  const [listWidth, setListWidth] = React.useState(LIST_MAX);
  const compact = listWidth < LIST_COMPACT;
  const drag = React.useRef<{ startX: number; startW: number } | null>(null);

  React.useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(LIST_WIDTH_KEY));
      if (saved >= LIST_MIN && saved <= LIST_MAX) setListWidth(saved);
    } catch {
      /* storage blocked: keep the default */
    }
  }, []);

  function applyWidth(w: number) {
    const next = Math.min(LIST_MAX, Math.max(LIST_MIN, Math.round(w)));
    setListWidth(next);
    try {
      localStorage.setItem(LIST_WIDTH_KEY, String(next));
    } catch {
      /* ignore */
    }
  }

  function onResizeStart(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    drag.current = { startX: e.clientX, startW: listWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
  }

  function onResizeMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const w = drag.current.startW + e.clientX - drag.current.startX;
    setListWidth(Math.min(LIST_MAX, Math.max(LIST_MIN, w)));
  }

  function onResizeEnd() {
    if (!drag.current) return;
    drag.current = null;
    document.body.style.userSelect = "";
    applyWidth(listWidth);
  }
  const { messages, replyTo, setReplyTo, send, editMessage, deleteMessage } = useChatMessages({
    initialMessages: activeThread?.messages ?? NO_MESSAGES,
    currentUserId,
    receiverId: activeThread?.partner.id ?? null,
  });
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Jump to the bottom when another thread opens (its first message differs)
  // or a message is added, not when one is edited or deleted
  const lastCount = React.useRef(0);
  const lastFirstId = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    const firstId = messages[0]?.id;
    if (messages.length > lastCount.current || firstId !== lastFirstId.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
    lastCount.current = messages.length;
    lastFirstId.current = firstId;
  }, [messages]);

  // The open conversation's preview follows its messages locally (no server
  // refresh needed after sending), and it moves to the top
  const shownConversations = React.useMemo(() => {
    const partnerId = activeThread?.partner.id;
    const last = messages[messages.length - 1];
    if (!partnerId || !last) return conversations;
    return conversations
      .map((c) =>
        c.partnerId === partnerId
          ? { ...c, lastMessage: messagePreview(last), lastAt: last.createdAt, unreadCount: 0 }
          : c
      )
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  }, [conversations, messages, activeThread]);

  const filtered = shownConversations.filter((c) =>
    c.partnerName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full rounded-2xl border border-border bg-card overflow-hidden">
      <div
        className="grid h-full lg:grid-cols-[var(--list-w)_1fr]"
        style={{ "--list-w": `${listWidth}px` } as React.CSSProperties}
      >
        {/* Conversation list */}
        <div className="relative min-h-0 border-r border-border flex flex-col">
          {/* Drag to resize (large screens) */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize conversation list"
            aria-valuemin={LIST_MIN}
            aria-valuemax={LIST_MAX}
            aria-valuenow={listWidth}
            tabIndex={0}
            title="Drag to resize · double-click to toggle"
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
            onPointerCancel={onResizeEnd}
            onDoubleClick={() => applyWidth(listWidth < LIST_MAX ? LIST_MAX : LIST_MIN)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") applyWidth(listWidth - 16);
              if (e.key === "ArrowRight") applyWidth(listWidth + 16);
            }}
            className="group/resize absolute inset-y-0 -right-1.5 z-10 hidden w-3 cursor-col-resize touch-none lg:block focus:outline-none"
          >
            <div className="mx-auto h-full w-0.5 transition-colors group-hover/resize:bg-primary/40 group-focus/resize:bg-primary/40" />
            <div className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border transition-colors group-hover/resize:bg-primary/60" />
          </div>

          <div className="px-3 py-2 border-b border-border">
            {compact && (
              <button
                type="button"
                onClick={() => applyWidth(LIST_MAX)}
                title="Search conversations"
                className="mx-auto hidden h-8 w-8 place-items-center rounded-full hover:bg-muted lg:grid"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <div className={`relative ${compact ? "lg:hidden" : ""}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-1.5 text-sm focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className={`mt-4 text-sm text-muted-foreground ${compact ? "lg:hidden" : ""}`}>
                  {query ? "No matches" : "No messages yet"}
                </p>
                {!query && (
                  <p className={`mt-1 text-[11px] text-muted-foreground ${compact ? "lg:hidden" : ""}`}>
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
                    title={c.partnerName}
                    className={`flex items-center gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors stagger-item ${
                      isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    } ${compact ? "lg:justify-center lg:px-0" : ""}`}
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    <span className="relative shrink-0">
                      <Avatar name={c.partnerName} size={40} style={c.partnerRole === "TEACHER" ? "micah" : "avataaars"} />
                      {compact && c.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 hidden h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-card lg:grid">
                          {c.unreadCount}
                        </span>
                      )}
                    </span>
                    <div className={`flex-1 min-w-0 ${compact ? "lg:hidden" : ""}`}>
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
                      <span className={`grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground ${compact ? "lg:hidden" : ""}`}>
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
        <div className="min-h-0 flex flex-col">
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
              <div className="flex items-center gap-2.5 px-4 py-2 border-b border-border bg-muted/30">
                <Avatar name={activeThread.partner.name} size={32} style={activeThread.partner.role === "TEACHER" ? "micah" : "avataaars"} />
                <div className="flex-1">
                  <p className="text-sm font-bold leading-tight">{activeThread.partner.name}</p>
                  <p className="text-[10px] leading-tight text-muted-foreground inline-flex items-center gap-1">
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

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 bg-[#efeae2] dark:bg-[#0b141a]"
              >
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">
                    No messages in this conversation yet
                  </p>
                ) : (
                  <ChatThread
                    messages={messages}
                    currentUserId={currentUserId}
                    partnerName={activeThread.partner.name}
                    onReply={setReplyTo}
                    onEdit={editMessage}
                    onDelete={deleteMessage}
                  />
                )}
              </div>

              <MessageComposer
                placeholder={`Reply to ${activeThread.partner.name}...`}
                onSend={send}
                compact
                replyTo={
                  replyTo
                    ? {
                        label:
                          replyTo.senderId === currentUserId ? "yourself" : activeThread.partner.name,
                        text: messagePreview(replyTo),
                      }
                    : null
                }
                onCancelReply={() => setReplyTo(null)}
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
