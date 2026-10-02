"use client";

import * as React from "react";
import {
  Send,
  Paperclip,
  Mic,
  StopCircle,
  Loader2,
  X,
  AlertCircle,
  FileText,
} from "lucide-react";
import type { MessageAttachment } from "@/components/messaging/message-attachment";

// Composer with text input + file picker (image/pdf/audio) + voice recorder.
// Calls onSend({ text, attachment? }) when user clicks send.
export function MessageComposer({
  placeholder,
  onSend,
  compact = false,
  replyTo,
  onCancelReply,
}: {
  placeholder?: string;
  onSend: (payload: { text: string; attachment: MessageAttachment | null }) => Promise<void>;
  // Slimmer bar: smaller buttons and padding (student/teacher chat box)
  compact?: boolean;
  // Message being replied to, shown as a strip above the input
  replyTo?: { label: string; text: string } | null;
  onCancelReply?: () => void;
}) {
  const btnSize = compact ? "h-9 w-9" : "h-11 w-11";
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Picking "Reply" puts the cursor straight in the input
  React.useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [pending, setPending] = React.useState<MessageAttachment | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Voice recording state
  const recRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const [recording, setRecording] = React.useState(false);
  const [recordSec, setRecordSec] = React.useState(0);
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/message", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Upload failed");
      return;
    }
    const att = (await res.json()) as MessageAttachment & { mime?: string; size?: number };
    setPending({
      url: att.url,
      type: att.type,
      name: att.name,
      mime: att.mime,
      size: att.size,
    });
  }

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) uploadFile(f);
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        uploadFile(file);
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setRecordSec(0);
      tickRef.current = setInterval(() => setRecordSec((n) => n + 1), 1000);
    } catch {
      setError("Microphone access denied");
    }
  }

  function stopRecording() {
    const r = recRef.current;
    if (r && r.state !== "inactive") r.stop();
    recRef.current = null;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setRecording(false);
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if (!body && !pending) return;
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend({ text: body, attachment: pending });
      setText("");
      setPending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="border-t border-border bg-card">
      {replyTo && (
        <div className={compact ? "px-3 pt-2" : "px-4 pt-3"}>
          <div className="flex items-start gap-2 rounded-lg border-l-4 border-primary bg-muted/60 px-3 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-primary">Replying to {replyTo.label}</p>
              <p className="truncate text-xs text-muted-foreground">{replyTo.text}</p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              title="Cancel reply"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      {(pending || error || uploading) && (
        <div className={`${compact ? "px-3 pt-2" : "px-4 pt-3"} flex items-center gap-2 flex-wrap`}>
          {pending && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs">
              {pending.type === "image" ? (
                <Paperclip className="h-3.5 w-3.5 text-primary" />
              ) : pending.type === "voice" ? (
                <Mic className="h-3.5 w-3.5 text-primary" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="font-semibold truncate max-w-[180px]">{pending.name}</span>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {uploading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
            </span>
          )}
          {error && (
            <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {error}
            </span>
          )}
        </div>
      )}

      <div className={`${compact ? "px-3 py-2" : "p-4"} flex items-center gap-2`}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf,audio/*"
          onChange={onFilePick}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={recording || sending || uploading}
          title="Attach a file or image"
          className={`grid ${btnSize} place-items-center rounded-full border border-border bg-card hover:bg-muted disabled:opacity-50`}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            title="Stop recording"
            className={`inline-flex items-center gap-1.5 rounded-full bg-destructive/15 text-destructive px-3 ${compact ? "h-9" : "h-11"} text-sm font-semibold border border-destructive/40`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
            </span>
            {formatRec(recordSec)}
            <StopCircle className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={sending || uploading || !!pending}
            title="Record a voice message"
            className={`grid ${btnSize} place-items-center rounded-full border border-border bg-card hover:bg-muted disabled:opacity-50`}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={pending ? "Add a caption (optional)…" : placeholder ?? "Type your message…"}
          className={`flex-1 rounded-full border border-border bg-muted/50 px-4 ${compact ? "py-2" : "py-2.5"} text-sm focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20`}
        />
        <button
          type="submit"
          disabled={sending || uploading || (!text.trim() && !pending)}
          className={`grid ${btnSize} place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}

function formatRec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
