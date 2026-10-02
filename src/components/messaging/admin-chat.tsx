"use client";

import * as React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { MessageComposer } from "@/components/messaging/message-composer";
import { ChatThread } from "@/components/messaging/chat-thread";
import { useChatMessages } from "@/components/messaging/use-chat-messages";
import { messagePreview, type ChatMessage } from "@/lib/chat-message";

export function AdminChat({
  currentUserId,
  admin,
  initialMessages,
  heightClassName,
}: {
  currentUserId: string;
  admin: { id: string; name: string };
  initialMessages: ChatMessage[];
  // Overrides the default fixed height (used by pages without a PageHeader)
  heightClassName?: string;
}) {
  const { messages, replyTo, setReplyTo, send, editMessage, deleteMessage } = useChatMessages({
    initialMessages,
    currentUserId,
    receiverId: admin.id,
  });
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Jump to the bottom when a message is added, not when one is edited/deleted
  const lastCount = React.useRef(0);
  React.useEffect(() => {
    if (messages.length > lastCount.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
    lastCount.current = messages.length;
  }, [messages]);

  return (
    <div
      className={`rounded-2xl border border-border bg-card overflow-hidden flex flex-col ${heightClassName ?? ""}`}
      style={heightClassName ? undefined : { height: "calc(100vh - 240px)" }}
    >
      <div className="flex items-center gap-2.5 px-4 py-2 border-b border-border bg-muted/30">
        <div className="relative">
          <Avatar name={admin.name} size={32} style="micah" />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground ring-2 ring-card">
            <ShieldCheck className="h-2 w-2" />
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">{admin.name}</p>
          <p className="text-[10px] leading-tight text-emerald-600 inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Academy Administration
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
          <Lock className="h-2.5 w-2.5" /> Verified Channel
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 bg-[#efeae2] dark:bg-[#0b141a]"
      >
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
          <ChatThread
            messages={messages}
            currentUserId={currentUserId}
            partnerName={admin.name}
            onReply={setReplyTo}
            onEdit={editMessage}
            onDelete={deleteMessage}
          />
        )}
      </div>

      <MessageComposer
        placeholder="Type your message to admin…"
        onSend={send}
        compact
        replyTo={
          replyTo
            ? {
                label: replyTo.senderId === currentUserId ? "yourself" : admin.name,
                text: messagePreview(replyTo),
              }
            : null
        }
        onCancelReply={() => setReplyTo(null)}
      />
      <p className="px-4 pb-1.5 text-[10px] leading-tight text-muted-foreground text-center">
        🔒 Secure channel · text, images, PDFs, voice notes
      </p>
    </div>
  );
}
