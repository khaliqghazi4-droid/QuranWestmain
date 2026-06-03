"use client";

import * as React from "react";
import type { DailyCall, DailyEventObject } from "@daily-co/daily-js";
import { upload } from "@vercel/blob/client";
import {
  Video,
  StopCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// Recording driver that uses Daily.co's built-in **local** recording. The
// teacher just clicks one button — no screen-share permission prompt — and
// when they stop, Daily emits `recording-data` chunks which we assemble
// into a webm Blob and upload directly to Vercel Blob. The recording row
// in the admin's table is created by /api/upload/recording exactly the
// same way as before.
export function DailyRecorder({
  roomId,
  courseName,
  studentName,
  callObject,
}: {
  roomId: string;
  courseName: string;
  studentName: string;
  callObject: unknown; // the live DailyCall handed down from <DailyMeeting>
}) {
  const call = callObject as DailyCall | null;

  const [recording, setRecording] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedUrl, setSavedUrl] = React.useState<string | null>(null);

  // Collected chunks from `recording-data` events; flushed to a Blob on stop.
  const chunksRef = React.useRef<Uint8Array[]>([]);
  const startedAtRef = React.useRef<Date | null>(null);
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Wire up Daily event handlers once we have a call object.
  React.useEffect(() => {
    if (!call) return;

    const onStarted = () => {
      chunksRef.current = [];
      startedAtRef.current = new Date();
      setRecording(true);
      setElapsed(0);
      setSavedUrl(null);
      setError(null);
      tickRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    };

    const onData = (ev: DailyEventObject<"recording-data">) => {
      if (ev.data && ev.data.byteLength > 0) {
        chunksRef.current.push(ev.data);
      }
      if (ev.finished) {
        void flushUpload();
      }
    };

    const onStopped = () => {
      setRecording(false);
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      // The final `recording-data` (with `finished: true`) does the upload;
      // but if it never arrives — e.g. teacher unplugs mid-record — make sure
      // we still attempt with whatever chunks we have.
      setTimeout(() => {
        if (chunksRef.current.length > 0 && !uploading) {
          void flushUpload();
        }
      }, 1500);
    };

    const onError = (ev: DailyEventObject<"recording-error">) => {
      const msg = (ev as unknown as { errorMsg?: string }).errorMsg
        ?? "Daily recording error";
      setError(msg);
      setRecording(false);
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    call.on("recording-started", onStarted);
    call.on("recording-data", onData);
    call.on("recording-stopped", onStopped);
    call.on("recording-error", onError);

    return () => {
      call.off("recording-started", onStarted);
      call.off("recording-data", onData);
      call.off("recording-stopped", onStopped);
      call.off("recording-error", onError);
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // We intentionally don't depend on `uploading` here — handlers read it
    // through closure but its currency doesn't matter for this guardrail.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  async function flushUpload() {
    if (uploading) return;
    const chunks = chunksRef.current;
    chunksRef.current = [];
    if (chunks.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      // `Uint8Array` is a BlobPart in modern browsers; cast satisfies TS DOM
      // lib variations across versions.
      const parts = chunks as unknown as BlobPart[];
      const blob = new Blob(parts, { type: "video/webm" });
      const startedAt = startedAtRef.current ?? new Date();
      const durationSec = Math.max(
        1,
        Math.round((Date.now() - startedAt.getTime()) / 1000)
      );
      const safeRoom = roomId.replace(/[^a-zA-Z0-9_-]/g, "-");
      const pathname = `recordings/${safeRoom}/${Date.now()}.webm`;
      const result = await upload(pathname, blob, {
        access: "public",
        handleUploadUrl: "/api/upload/recording",
        contentType: "video/webm",
        clientPayload: JSON.stringify({
          roomId,
          startedAt: startedAt.toISOString(),
          durationSec,
        }),
      });
      setSavedUrl(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function start() {
    if (!call) {
      setError("Meeting not ready yet — wait a moment and try again");
      return;
    }
    try {
      call.startRecording({ type: "local" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start recording");
    }
  }

  function stop() {
    if (!call) return;
    try {
      call.stopRecording();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't stop recording");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white">
          <Video className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Lecture Recording</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {courseName} · {studentName}
          </p>
        </div>
        {recording && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 text-red-600 px-2.5 py-1 text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            REC {formatSec(elapsed)}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {savedUrl && !recording && !uploading && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">
                Recording saved — admin can watch it from the Recordings tab.
              </p>
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline truncate inline-block max-w-full"
              >
                Open recording
              </a>
            </div>
          </div>
        )}

        {recording ? (
          <button
            onClick={stop}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg"
          >
            <StopCircle className="h-4 w-4" /> Stop & Save Recording
          </button>
        ) : uploading ? (
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-bold text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading to admin…
          </button>
        ) : (
          <button
            onClick={start}
            disabled={!call}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-60"
          >
            <Video className="h-4 w-4" />
            {!call
              ? "Waiting for meeting…"
              : savedUrl
                ? "Record again"
                : "Start Recording"}
          </button>
        )}

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          One click — no screen-share prompt. The lecture records inside the
          meeting and uploads to the admin&apos;s Recordings tab when you stop.
        </p>
      </div>
    </div>
  );
}

function formatSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
