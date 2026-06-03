"use client";

import * as React from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import { PdfViewer } from "@/components/pdf-viewer";
import { ImageLightbox } from "@/components/image-lightbox";

export type MessageAttachment = {
  url: string;
  type: "image" | "file" | "voice";
  name: string;
  mime?: string;
  size?: number;
};

// Renders an attachment inside a chat bubble. `isMe` flips styling
// so file chips have a contrasting background on the sender's own bubble.
//
// Click behaviour: image → in-app <ImageLightbox>, PDF → in-app <PdfViewer>,
// voice → inline <audio controls>. Nothing opens in a new tab anymore —
// the lightbox / viewer themselves still have an "Open" button if the user
// wants to pop the file out.
export function MessageAttachmentView({
  attachment,
  isMe,
}: {
  attachment: MessageAttachment;
  isMe: boolean;
}) {
  const { url, type, name, mime, size } = attachment;
  const [open, setOpen] = React.useState(false);

  if (type === "image") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block mb-1 cursor-zoom-in"
          title="View image"
        >
          <Image
            src={url}
            alt={name}
            width={320}
            height={240}
            unoptimized
            className="rounded-lg max-h-60 w-auto object-cover"
          />
        </button>
        {open && <ImageLightbox url={url} alt={name} onClose={() => setOpen(false)} />}
      </>
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

  // PDFs (and anything else uploaded as "file") open in the in-app PDF viewer
  // — the upload API only accepts PDFs in this branch today, but the viewer
  // also has a fallback "Open" button if the browser can't render it inline.
  const isPdf = mime === "application/pdf" || name.toLowerCase().endsWith(".pdf");

  return (
    <>
      <button
        type="button"
        onClick={() => isPdf && setOpen(true)}
        disabled={!isPdf}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 mb-1 w-full text-left ${
          isMe ? "bg-white/20" : "bg-muted"
        } ${isPdf ? "cursor-pointer hover:opacity-90" : ""}`}
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
      </button>
      {open && isPdf && (
        <PdfViewer url={url} title={name} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
