"use client";

import * as React from "react";
import { X, ExternalLink, Download } from "lucide-react";

// Full-screen in-app image viewer used by chat attachments. Same shell
// pattern as <PdfViewer>: blurred overlay, dismissable by clicking outside
// or pressing Esc, with download + open-in-new-tab affordances in the
// header so the user keeps the option to leave the app if they want.
export function ImageLightbox({
  url,
  alt,
  onClose,
}: {
  url: string;
  alt?: string;
  onClose: () => void;
}) {
  // Lock body scroll while open + close on Esc, matching the PdfViewer UX.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm animate-fade-in flex flex-col"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full h-full max-w-6xl mx-auto my-4 sm:my-8 rounded-2xl overflow-hidden bg-card shadow-2xl border border-border"
      >
        <div className="flex items-center justify-between gap-3 p-3 border-b border-border bg-card">
          <p className="text-sm font-bold truncate flex-1">{alt ?? "Image"}</p>
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
        <div className="flex-1 grid place-items-center bg-black/90 overflow-auto p-4">
          {/* Use plain <img> instead of next/image so the lightbox can render
              the natural aspect ratio without forcing a layout-shifting box. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt ?? "Image"}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

