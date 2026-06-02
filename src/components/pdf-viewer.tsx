"use client";

import * as React from "react";
import { X, ExternalLink, Download } from "lucide-react";

export function PdfViewer({
  url,
  title,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  // Lock body scroll while open
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm animate-fade-in flex flex-col"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full h-full max-w-6xl mx-auto my-4 sm:my-8 rounded-2xl overflow-hidden bg-card shadow-2xl border border-border"
      >
        <div className="flex items-center justify-between gap-3 p-3 border-b border-border bg-card">
          <p className="text-sm font-bold truncate flex-1">{title ?? "PDF"}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" /> Open
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <Download className="h-3 w-3" /> Download
          </a>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe
          src={url}
          title={title ?? "PDF"}
          className="flex-1 w-full bg-muted"
        />
      </div>
    </div>
  );
}
