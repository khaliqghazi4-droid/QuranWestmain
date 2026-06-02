"use client";

import Image from "next/image";
import { FileText } from "lucide-react";

export type MessageAttachment = {
  url: string;
  type: "image" | "file" | "voice";
  name: string;
  mime?: string;
  size?: number;
};

// Renders an attachment inside a chat bubble. `isMe` flips styling
// so file chips have a contrasting background on the sender's own bubble.
export function MessageAttachmentView({
  attachment,
  isMe,
}: {
  attachment: MessageAttachment;
  isMe: boolean;
}) {
  const { url, type, name, size } = attachment;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mb-1">
        <Image
          src={url}
          alt={name}
          width={320}
          height={240}
          unoptimized
          className="rounded-lg max-h-60 w-auto object-cover"
        />
      </a>
    );
  }

  if (type === "voice") {
    return (
      <audio
        src={url}
        controls
        preload="none"
        className="max-w-full mb-1 h-9 rounded-lg"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 mb-1 ${
        isMe ? "bg-white/20" : "bg-muted"
      }`}
    >
      <FileText className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{name}</p>
        {size && size > 0 && (
          <p className={`text-[10px] ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
            {(size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>
    </a>
  );
}
