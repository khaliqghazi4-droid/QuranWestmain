"use client";

import * as React from "react";
import { Upload, FileText, X, Loader2, Eye, AlertCircle } from "lucide-react";
import { PdfViewer } from "@/components/pdf-viewer";

export function PdfUploader({
  value,
  onChange,
  folder = "uploads",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [viewing, setViewing] = React.useState(false);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload/pdf", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Upload failed");
      return;
    }
    const data = await res.json();
    onChange(data.url);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadFile(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  const filename = value ? value.split("/").pop()?.replace(/^\d+-/, "") ?? "file.pdf" : null;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={onPick}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold truncate flex-1">{filename}</p>
          <button
            type="button"
            onClick={() => setViewing(true)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold hover:bg-muted"
          >
            <Eye className="h-3 w-3" /> View
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold hover:bg-muted"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            title="Remove"
            className="grid h-7 w-7 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/40"
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-primary" />
              <p className="text-sm font-semibold">
                Drag &amp; drop a PDF here, or <span className="text-primary">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">Max 10 MB · PDF only</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {viewing && value && (
        <PdfViewer url={value} title={filename ?? "PDF"} onClose={() => setViewing(false)} />
      )}
    </div>
  );
}
