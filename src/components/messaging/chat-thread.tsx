"use client";

import * as React from "react";
import { Ban, Check, Copy, Loader2, MoreVertical, Pencil, Reply, Trash2, X } from "lucide-react";
import { MessageAttachmentView } from "@/components/messaging/message-attachment";
import { canModifyMessage, messagePreview, type ChatMessage } from "@/lib/chat-message";

// WhatsApp-style message list shared by the student/teacher chat box and the
// admin inbox. The parent owns the scroll container and the empty state.
// Each bubble has a ⋮ menu (also right-click / long-press): Reply, Copy, and
// (own message, first 15 min) Edit / Delete. Deleted messages show "This
// message was deleted".
export function ChatThread({
  messages,
  currentUserId,
  partnerName,
  onReply,
  onEdit,
  onDelete,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  partnerName: string;
  onReply: (m: ChatMessage) => void;
  // Both return an error message, or null on success
  onEdit: (id: string, content: string) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
}) {
  const [menuFor, setMenuFor] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [savingEdit, setSavingEdit] = React.useState(false);
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const pressTimer = React.useRef<ReturnType<typeof setTimeout>>();

  // Close the open menu on any click outside it. The check has to look at the
  // target: React (App Router) listens on `document` too, so stopPropagation
  // inside the menu can't keep this listener from firing.
  // Also ignores the first instant after opening: some phones fire a fake
  // mousedown right after a long-press, which would close the menu straight away.
  React.useEffect(() => {
    if (!menuFor) return;
    const openedAt = Date.now();
    const close = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-chat-menu]")) return;
      if (Date.now() - openedAt > 400) setMenuFor(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuFor]);

  function flash(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 1500);
  }

  async function copy(m: ChatMessage) {
    setMenuFor(null);
    try {
      await navigator.clipboard.writeText(m.content);
      flash("Copied");
    } catch {
      flash("Could not copy");
    }
  }

  function startEdit(m: ChatMessage) {
    setMenuFor(null);
    setEditingId(m.id);
    setEditText(m.content);
  }

  async function saveEdit() {
    if (!editingId || savingEdit) return;
    setSavingEdit(true);
    const err = await onEdit(editingId, editText);
    setSavingEdit(false);
    if (err) {
      alert(err);
      return;
    }
    setEditingId(null);
  }

  async function remove(m: ChatMessage) {
    setMenuFor(null);
    if (!confirm("Delete this message for everyone?")) return;
    const err = await onDelete(m.id);
    if (err) alert(err);
  }

  // Tap on a reply quote: scroll to the original and highlight it briefly
  function jumpTo(id: string) {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 1500);
  }

  return (
    <>
      {messages.map((m, i) => {
        const isMe = m.senderId === currentUserId;
        const prev = messages[i - 1];
        const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
        // Consecutive messages from the same person sit close together;
        // only the first of a run gets the WhatsApp-style pointed corner
        const firstInGroup = newDay || prev.senderId !== m.senderId;
        const deleted = !!m.deletedAt;
        const pending = m.id.startsWith("tmp-");
        const canModify = !pending && canModifyMessage(m, currentUserId);
        const editing = editingId === m.id;
        // Open the menu upward near the bottom so it isn't cut off
        const menuUp = i >= messages.length - 2 && messages.length > 2;
        const time = new Date(m.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const stamp = `${m.editedAt && !deleted ? "edited " : ""}${time}`;

        // ⋮ options button beside the bubble (toward the middle of the chat):
        // always visible, darker on hover
        const options =
          !deleted && !pending && !editing ? (
            <div className="relative shrink-0" data-chat-menu>
              <button
                type="button"
                onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                title="Message options"
                aria-label="Message options"
                className={`grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-black/10 hover:text-black/80 dark:hover:bg-white/10 dark:hover:text-white ${
                  menuFor === m.id
                    ? "bg-black/10 text-black/80 dark:bg-white/10 dark:text-white"
                    : "text-black/35 group-hover:text-black/60 dark:text-white/40 dark:group-hover:text-white/70"
                }`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuFor === m.id && (
                <div
                  className={`absolute z-20 ${menuUp ? "bottom-8" : "top-8"} ${
                    isMe ? "right-0" : "left-0"
                  } w-36 overflow-hidden rounded-lg border border-border bg-card py-1 text-[13px] text-foreground shadow-xl`}
                >
                  <MenuItem icon={Reply} label="Reply" onClick={() => {
                    setMenuFor(null);
                    onReply(m);
                  }} />
                  {m.content && <MenuItem icon={Copy} label="Copy" onClick={() => copy(m)} />}
                  {canModify && <MenuItem icon={Pencil} label="Edit" onClick={() => startEdit(m)} />}
                  {canModify && (
                    <MenuItem icon={Trash2} label="Delete" danger onClick={() => remove(m)} />
                  )}
                </div>
              )}
            </div>
          ) : null;

        return (
          <React.Fragment key={m.id}>
            {newDay && (
              <div className="flex justify-center my-3 first:mt-0">
                <span className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#54656f] shadow-sm dark:bg-[#182229] dark:text-[#8696a0]">
                  {dayLabel(m.createdAt)}
                </span>
              </div>
            )}
            <div
              id={`msg-${m.id}`}
              className={`group flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"} ${
                firstInGroup ? "mt-2" : "mt-0.5"
              }`}
            >
              {isMe && options}
              <div
                className={`relative max-w-[80%] sm:max-w-[65%] rounded-lg px-2.5 pt-1.5 pb-1 text-[13.5px] leading-snug shadow-sm transition-shadow ${
                  isMe
                    ? "bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef]"
                    : "bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef]"
                } ${firstInGroup ? (isMe ? "rounded-tr-none" : "rounded-tl-none") : ""} ${
                  highlightId === m.id ? "ring-2 ring-primary/60" : ""
                } ${editing ? "w-72 max-w-full" : ""}`}
                // Right-click (desktop) or long-press (touch) also opens the menu
                onContextMenu={(e) => {
                  if (deleted || pending || editing) return;
                  e.preventDefault();
                  setMenuFor(m.id);
                }}
                onTouchStart={() => {
                  if (deleted || pending || editing) return;
                  clearTimeout(pressTimer.current);
                  pressTimer.current = setTimeout(() => setMenuFor(m.id), 500);
                }}
                onTouchEnd={() => clearTimeout(pressTimer.current)}
                onTouchMove={() => clearTimeout(pressTimer.current)}
              >
                {deleted ? (
                  <p className="inline-flex items-center gap-1 italic text-black/50 dark:text-white/50">
                    <Ban className="h-3.5 w-3.5" /> This message was deleted
                    <span className="inline-block w-12" aria-hidden="true" />
                  </p>
                ) : (
                  <>
                    {m.replyTo && (
                      <button
                        type="button"
                        onClick={() => jumpTo(m.replyTo!.id)}
                        className={`mb-1 block w-full rounded-md border-l-4 bg-black/5 px-2 py-1 text-left dark:bg-white/10 ${
                          m.replyTo.senderId === currentUserId ? "border-[#06cf9c]" : "border-[#53bdeb]"
                        }`}
                      >
                        <span
                          className={`block text-[11px] font-semibold ${
                            m.replyTo.senderId === currentUserId ? "text-[#06cf9c]" : "text-[#53bdeb]"
                          }`}
                        >
                          {m.replyTo.senderId === currentUserId ? "You" : partnerName}
                        </span>
                        <span className="line-clamp-2 text-[12px] text-black/60 dark:text-white/60">
                          {messagePreview(m.replyTo)}
                        </span>
                      </button>
                    )}
                    {m.attachmentUrl && m.attachmentType && (
                      <MessageAttachmentView
                        attachment={{
                          url: m.attachmentUrl,
                          type: m.attachmentType,
                          name: m.attachmentName ?? "attachment",
                          mime: m.attachmentMime ?? "",
                          size: m.attachmentSize ?? 0,
                        }}
                        // The light WhatsApp-style bubbles need the neutral chip colours
                        isMe={false}
                      />
                    )}
                    {editing ? (
                      <div className="pb-1">
                        <textarea
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              saveEdit();
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          rows={2}
                          className="w-full resize-none rounded-md border border-black/10 bg-white/80 px-2 py-1 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-black/20"
                        />
                        <div className="mt-1 flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            disabled={savingEdit}
                            title="Cancel"
                            className="grid h-6 w-6 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={savingEdit}
                            title="Save"
                            className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-60"
                          >
                            {savingEdit ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      m.content && (
                        <p className="whitespace-pre-wrap break-words">
                          {m.content}
                          {/* Keeps room on the last line for the time stamp */}
                          <span
                            className={`inline-block ${m.editedAt ? "w-24" : "w-14"}`}
                            aria-hidden="true"
                          />
                        </p>
                      )
                    )}
                  </>
                )}

                {!editing && (
                  <span
                    className={`text-[10px] leading-none text-black/45 dark:text-white/55 ${
                      m.content || deleted ? "absolute bottom-1 right-2" : "block text-right pb-0.5"
                    }`}
                  >
                    {stamp}
                  </span>
                )}
              </div>
              {!isMe && options}
            </div>
          </React.Fragment>
        );
      })}

      {toast && (
        <div className="pointer-events-none sticky bottom-2 mt-2 flex justify-center">
          <span className="rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white">
            {toast}
          </span>
        </div>
      )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-muted ${
        danger ? "text-destructive" : ""
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

// "Today" / "Yesterday" / "Wed, Oct 1" (year added when it isn't this year)
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}
