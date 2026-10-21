"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Inbox,
  GraduationCap,
  Users,
  MessageSquare,
  CheckCheck,
  UserRound,
  ArrowLeft,
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
  partnerImage: string | null;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
  lastFromMe: boolean;
  lastRead: boolean;
};

// The chips under the search, as in WhatsApp. "Needs reply": they wrote last
// and the admin hasn't answered yet.
type Filter = "all" | "unread" | "reply" | "teachers" | "students";
const FILTERS: { key: Filter; label: string; test: (c: Conversation) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "unread", label: "Unread", test: (c) => c.unreadCount > 0 },
  { key: "reply", label: "Needs reply", test: (c) => !c.lastFromMe },
  { key: "teachers", label: "Teachers", test: (c) => c.partnerRole === "TEACHER" },
  { key: "students", label: "Students", test: (c) => c.partnerRole === "STUDENT" },
];
const EMPTY: Record<Filter, string> = {
  all: "No messages yet",
  unread: "No unread messages",
  reply: "You're all caught up",
  teachers: "No teacher conversations",
  students: "No student conversations",
};

type Thread = {
  partner: { id: string; name: string; role: string; image: string | null };
  messages: ChatMessage[];
};

// The person's own page in the admin, from the chat header
function profileHref(p: { id: string; role: string }) {
  if (p.role === "TEACHER") return `/app/admin/teachers/${p.id}`;
  if (p.role === "STUDENT") return `/app/admin/students/${p.id}`;
  return null;
}

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
  const [filter, setFilter] = React.useState<Filter>("all");
  // A chat opened from a filtered list stays in it after it stops matching
  // (opening marks it read, replying answers it), as in WhatsApp, until the
  // filter changes
  const [kept, setKept] = React.useState<string | null>(null);
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
          ? {
              ...c,
              lastMessage: messagePreview(last),
              lastAt: last.createdAt,
              unreadCount: 0,
              lastFromMe: last.senderId === currentUserId,
              // a message just sent here hasn't been read yet
              lastRead: last.createdAt === c.lastAt ? c.lastRead : false,
            }
          : c
      )
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  }, [conversations, messages, activeThread, currentUserId]);

  const chips = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const counts = {
    unread: shownConversations.filter((c) => c.unreadCount > 0).length,
    reply: shownConversations.filter((c) => !c.lastFromMe).length,
  };
  const filtered = shownConversations.filter(
    (c) => (chips.test(c) || c.partnerId === kept) && c.partnerName.toLowerCase().includes(query.toLowerCase())
  );

  function chooseFilter(next: Filter) {
    setFilter(next);
    setKept(null);
  }

  return (
    // adm-chat*: the calm light-mode look in globals.css (solid white, not glass)
    <div className="adm-chat h-full rounded-2xl border border-border bg-card overflow-hidden">
      <div
        // Phones: one column held to the card's width; an `auto` one grew to
        // fit a long message preview and ran off the screen
        className="grid h-full grid-cols-[minmax(0,1fr)] lg:grid-cols-[var(--list-w)_1fr]"
        style={{ "--list-w": `${listWidth}px` } as React.CSSProperties}
      >
        {/* Conversation list. Phones show one pane at a time, as WhatsApp
            does: the list, or the open chat (with a back arrow) */}
        <div className={`relative min-h-0 border-r border-border flex-col ${activeThread ? "hidden lg:flex" : "flex"}`}>
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
            <div className={`mb-[10px] mt-[4px] flex items-baseline justify-between gap-[8px] px-[4px] ${compact ? "lg:hidden" : ""}`}>
              <h2 className="text-[18px] font-bold leading-[24px]">Chats</h2>
              <span className="text-[11.5px] leading-[16px] text-muted-foreground">
                {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
              </span>
            </div>
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
            {/* Filter chips; they wrap onto a second line in the narrow list.
                Sizes written out: Bootstrap overrides .text-xs and .px-3. */}
            <div
              role="tablist"
              aria-label="Filter conversations"
              className={`mt-[10px] flex flex-wrap gap-[6px] ${compact ? "lg:hidden" : ""}`}
            >
              {FILTERS.map((f) => {
                const active = filter === f.key;
                const count = f.key === "unread" ? counts.unread : f.key === "reply" ? counts.reply : 0;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => chooseFilter(f.key)}
                    className={`inline-flex items-center gap-[6px] rounded-full px-[12px] py-[5px] text-[12.5px] font-semibold leading-[18px] transition-colors ${
                      active
                        ? "adm-badge bg-gradient-to-r from-primary to-accent text-primary-foreground"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    {count > 0 && (
                      // light admin: gold on the navy chosen chip (.adm-badge .adm-count)
                      <span
                        className={`adm-count grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] text-[10.5px] font-bold leading-none ${
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-[hsl(var(--primary))] text-primary-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className={`mt-4 text-sm text-muted-foreground ${compact ? "lg:hidden" : ""}`}>
                  {query ? "No matches" : EMPTY[filter]}
                </p>
                {!query && filter === "all" && (
                  <p className={`mt-1 text-[11px] text-muted-foreground ${compact ? "lg:hidden" : ""}`}>
                    When students/teachers message you, they will appear here.
                  </p>
                )}
              </div>
            ) : (
              filtered.map((c, i) => {
                const isActive = activeThread?.partner.id === c.partnerId;
                const unread = c.unreadCount > 0;
                return (
                  <Link
                    key={c.partnerId}
                    href={`/app/admin/messages?with=${c.partnerId}`}
                    onClick={() => setKept(filter === "all" ? null : c.partnerId)}
                    title={c.partnerName}
                    className={`flex items-center gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors stagger-item ${
                      isActive ? "adm-chat-active bg-primary/5 border-l-2 border-l-primary" : ""
                    } ${compact ? "lg:justify-center lg:px-0" : ""}`}
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    <span className="relative shrink-0">
                      <Avatar name={c.partnerName} src={c.partnerImage} size={42} />
                      {compact && unread && (
                        <span className="absolute -right-1 -top-1 hidden h-4 min-w-[16px] place-items-center rounded-full bg-[hsl(var(--primary))] px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-card lg:grid">
                          {c.unreadCount}
                        </span>
                      )}
                    </span>
                    {/* Unread, as in WhatsApp: bold name, darker preview, the time in the accent */}
                    <div className={`flex-1 min-w-0 ${compact ? "lg:hidden" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread ? "font-bold" : "font-semibold"}`}>{c.partnerName}</p>
                        <span
                          className={`text-[10px] shrink-0 ${unread ? "font-bold text-primary" : "text-muted-foreground"}`}
                        >
                          {timeAgo(c.lastAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {c.partnerRole === "TEACHER" ? (
                          <Users className="h-3 w-3 text-primary shrink-0" />
                        ) : (
                          <GraduationCap className="h-3 w-3 text-primary shrink-0" />
                        )}
                        {/* The admin's own last message: ticks, blue once they've read it */}
                        {c.lastFromMe && (
                          <CheckCheck
                            aria-label={c.lastRead ? "Read" : "Not read yet"}
                            className={`h-3.5 w-3.5 shrink-0 ${c.lastRead ? "text-sky-500" : "text-muted-foreground"}`}
                          />
                        )}
                        <p
                          className={`text-xs truncate ${
                            unread ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {c.lastFromMe && "You: "}
                          {c.lastMessage}
                        </p>
                      </div>
                    </div>
                    {unread && (
                      <span className={`grid h-5 min-w-[20px] place-items-center rounded-full bg-[hsl(var(--primary))] px-1.5 text-[10px] font-bold text-primary-foreground ${compact ? "lg:hidden" : ""}`}>
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
        <div className={`min-h-0 flex-col ${activeThread ? "flex" : "hidden lg:flex"}`}>
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="adm-icon grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="mt-4 text-base font-bold">Select a conversation</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Choose a student or teacher from the list to view and reply to their messages.
              </p>
            </div>
          ) : (
            <>
              {/* Who this is (photo, role) and a way to their page */}
              <div className="adm-chat-head flex items-center gap-[12px] border-b border-border bg-muted/30 px-[16px] py-[10px]">
                <Link
                  href="/app/admin/messages"
                  aria-label="Back to all chats"
                  className="-ml-[6px] grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <Avatar name={activeThread.partner.name} src={activeThread.partner.image} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold leading-[20px]">{activeThread.partner.name}</p>
                  <span className="mt-[3px] inline-flex items-center gap-[4px] rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-semibold leading-[16px] text-primary">
                    {activeThread.partner.role === "TEACHER" ? (
                      <>
                        <Users className="h-3 w-3" /> Teacher
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-3 w-3" /> Student
                      </>
                    )}
                  </span>
                </div>
                {profileHref(activeThread.partner) && (
                  <Link
                    href={profileHref(activeThread.partner)!}
                    title={`Open ${activeThread.partner.name}'s profile`}
                    className="inline-flex shrink-0 items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[12px] py-[7px] text-[12.5px] font-semibold leading-[17px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">View profile</span>
                  </Link>
                )}
              </div>

              <div
                ref={scrollRef}
                className="adm-chat-bg flex-1 overflow-y-auto px-3 sm:px-6 py-3 bg-[#efeae2] dark:bg-[#0b141a]"
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
