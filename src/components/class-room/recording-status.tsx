"use client";

import * as React from "react";
import { Video, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import type { ClassRecorder, UploadProgress } from "./use-class-recorder";

// Shows the class recorder's state. "pill" sits in the class-room header,
// "card" at the top of the teacher's side panel. Recording starts by itself
// with Start Class; the only button here turns it back on after the teacher
// declined the prompt or recording stopped, or retries a failed upload.
export function RecordingStatus({
  recorder,
  variant,
}: {
  recorder: ClassRecorder;
  variant: "pill" | "card";
}) {
  const { status, elapsed, progress, error, canRetryUpload } = recorder;

  const state = (() => {
    switch (status) {
      case "recording":
        return { tone: "rec", label: `REC ${formatSec(elapsed)}`, text: "This class is being recorded. It saves to the admin when you end the class." };
      case "uploading":
        return {
          tone: "busy",
          label: `Saving ${percentOf(progress)}%`,
          text: "Uploading the recording — keep this page open.",
        };
      case "saved":
        return { tone: "ok", label: "Recording saved", text: "Saved — the admin can watch it from the Recordings tab." };
      case "declined":
        return { tone: "warn", label: "Not recording", text: "Screen sharing was not allowed, so this class isn't being recorded." };
      case "unsupported":
        return { tone: "muted", label: "Can't record here", text: "This browser can't record. Use Chrome or Edge on a computer to record classes." };
      case "error":
        return {
          tone: "error",
          label: canRetryUpload ? "Recording not saved" : "Recording failed",
          text: error ?? "Something went wrong with the recording.",
        };
      default:
        return { tone: "muted", label: "Not recording", text: "Recording starts when you start the class." };
    }
  })();

  const action = canRetryUpload
    ? { label: "Retry upload", icon: RefreshCw, run: () => void recorder.retryUpload() }
    : status === "declined" || status === "error" || status === "saved"
      ? { label: status === "saved" ? "Record again" : "Turn on recording", icon: Video, run: () => void recorder.start() }
      : null;

  const toneClass = {
    rec: "bg-red-500/15 text-red-600",
    busy: "bg-muted text-muted-foreground",
    ok: "bg-emerald-500/15 text-emerald-700",
    warn: "bg-amber-500/15 text-amber-700",
    error: "bg-destructive/15 text-destructive",
    muted: "bg-muted text-muted-foreground",
  }[state.tone];

  const badge = (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${toneClass}`}>
      {state.tone === "rec" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      )}
      {state.tone === "busy" && <Loader2 className="h-3 w-3 animate-spin" />}
      {state.tone === "ok" && <CheckCircle2 className="h-3 w-3" />}
      {(state.tone === "warn" || state.tone === "error") && <AlertCircle className="h-3 w-3" />}
      {state.label}
    </span>
  );

  if (variant === "pill") {
    return (
      <div className="inline-flex items-center gap-1.5" title={state.text}>
        {badge}
        {status === "uploading" && (
          <div className="hidden md:block w-20">
            <ProgressTrack percentage={percentOf(progress)} />
          </div>
        )}
        {action && (
          <button
            onClick={action.run}
            title={action.label}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold hover:bg-muted whitespace-nowrap"
          >
            {/* Icon only on narrow screens, so the class header doesn't overflow */}
            <action.icon className="h-3 w-3" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        )}
      </div>
    );
  }

  // Compact block for the narrow side panel (the page header already names
  // the course and student)
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white">
          <Video className="h-3.5 w-3.5" />
        </div>
        <p className="flex-1 min-w-0 text-xs font-bold">Recording</p>
        {badge}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{state.text}</p>
      {status === "uploading" && (
        <div className="mt-2">
          <UploadProgressBar progress={progress} />
        </div>
      )}
      {action && (
        <button
          onClick={action.run}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-primary/10 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
        >
          <action.icon className="h-3 w-3" /> {action.label}
        </button>
      )}
    </div>
  );
}

// Bar with "42% · 12.3 MB of 30.1 MB" under it
export function UploadProgressBar({
  progress,
  tone = "default",
}: {
  progress: UploadProgress | null;
  tone?: "default" | "onDark";
}) {
  const pct = percentOf(progress);
  const done = !!progress && progress.loaded >= progress.total;
  return (
    <div className="space-y-1.5">
      <ProgressTrack percentage={pct} tone={tone} />
      <div
        className={`flex items-center justify-between text-[11px] font-semibold ${
          tone === "onDark" ? "text-white/80" : "text-muted-foreground"
        }`}
      >
        <span>{done ? "Finishing…" : `${pct}% uploaded`}</span>
        {progress && progress.total > 0 && (
          <span>
            {formatBytes(progress.loaded)} of {formatBytes(progress.total)}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressTrack({ percentage, tone = "default" }: { percentage: number; tone?: "default" | "onDark" }) {
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full ${tone === "onDark" ? "bg-white/20" : "bg-muted"}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Whole percent, held below 100 until the upload has really finished
export function percentOf(progress: UploadProgress | null) {
  if (!progress || progress.total <= 0) return 0;
  if (progress.loaded >= progress.total) return 100;
  return Math.min(99, Math.floor(progress.percentage));
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatSec(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}
