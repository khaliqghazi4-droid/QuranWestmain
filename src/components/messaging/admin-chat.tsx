"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send, ShieldCheck, Loader2, Lock } from "lucide-react";
import { Avatar } from "@/components/avatar";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
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
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      content: text.trim(),
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, optimistic]);
    setText("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: admin.id, content: optimistic.content }),
    });
    setSending(false);

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id
            ? {
                id: data.message.id,
                content: data.message.content,
                senderId: data.message.senderId,
                createdAt: data.message.createdAt,
              }
            : m
        )
      );
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to send");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 240px)" }}>
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
              Send a message to the academy administration. They will get back to you soon.
            </p>
          </div>
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
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
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

      <form onSubmit={send} className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to admin..."
            className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          🔒 This is a secure channel between you and the academy administration only
        </p>
      </form>
    </div>
  );
}
