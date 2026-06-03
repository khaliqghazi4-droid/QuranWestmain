"use client";

import * as React from "react";
import { upload } from "@vercel/blob/client";
import {
  Video,
  StopCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// Records the teacher's screen + mic via getDisplayMedia + MediaRecorder
// and uploads directly to Vercel Blob (so we can ship >4.5 MB videos that
// would otherwise be rejected by the Lambda body limit).
//
// On stop, the upload route inserts a ClassRecording row attributed to the
// signed-in teacher + roomId, which appears in the admin recordings page.
export function ScreenRecorder({
  roomId,
  courseName,
  studentName,
}: {
  roomId: string;
  courseName: string;
  studentName: string;
}) {
  const [recording, setRecording] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedUrl, setSavedUrl] = React.useState<string | null>(null);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamsRef = React.useRef<MediaStream[]>([]);
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = React.useRef<Date | null>(null);

  // Tear everything down — used on stop AND on unmount so we don't leak
  // mic / screen permission indicators after the teacher leaves the page.
  const cleanup = React.useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    for (const s of streamsRef.current) {
      s.getTracks().forEach((t) => t.stop());
    }
    streamsRef.current = [];
    recorderRef.current = null;
  }, []);

  React.useEffect(() => () => cleanup(), [cleanup]);

  async function start() {
    setError(null);
    setSavedUrl(null);
    try {
      // Browser requires a user gesture for both APIs.
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // tab / system audio — may be ignored on some browsers
      });
      // Add the teacher's microphone on top so their voice is captured
      // even when tab audio isn't shared.
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        micStream = null;
      }

      const tracks: MediaStreamTrack[] = [...display.getTracks()];
      if (micStream) tracks.push(...micStream.getAudioTracks());
      const composite = new MediaStream(tracks);

      streamsRef.current = micStream ? [display, micStream] : [display];

      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "";
      const rec = new MediaRecorder(
        composite,
        mime ? { mimeType: mime, videoBitsPerSecond: 1_500_000 } : undefined
      );
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      // If the teacher clicks "Stop sharing" from the browser bar, mirror
      // that into our state so the upload starts right away.
      display.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorderRef.current?.state === "recording") stopAndUpload();
      });

      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        cleanup();
        await uploadBlob(blob);
      };

      rec.start(1000); // gather 1s chunks so we can recover from a tab crash
      recorderRef.current = rec;
      startedAtRef.current = new Date();
      setRecording(true);
      setElapsed(0);
      tickRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't start recording";
      setError(msg.includes("Permission") ? "Screen share permission denied" : msg);
      cleanup();
    }
  }

  function stopAndUpload() {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    setRecording(false);
  }

  async function uploadBlob(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const startedAt = startedAtRef.current ?? new Date();
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 1000));
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      // Path is decided here on the client — the server `onBeforeGenerateToken`
      // can only set token policy (size, allowed types, payload), not pathname.
      const safeRoom = roomId.replace(/[^a-zA-Z0-9_-]/g, "-");
      const pathname = `recordings/${safeRoom}/${Date.now()}.${ext}`;

      const result = await upload(pathname, blob, {
        access: "public",
        handleUploadUrl: "/api/upload/recording",
        contentType: blob.type || "video/webm",
        clientPayload: JSON.stringify({
          roomId,
          startedAt: startedAt.toISOString(),
          durationSec,
        }),
      });

      setSavedUrl(result.url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
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
              <p className="font-semibold">Recording saved — admin can watch it from the Recordings tab.</p>
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
            onClick={stopAndUpload}
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg"
          >
            <Video className="h-4 w-4" />
            {savedUrl ? "Record again" : "Start Recording"}
          </button>
        )}

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Pick the meeting tab (or your whole screen) when prompted. Your mic is added
          automatically — share the meeting tab&apos;s audio if you want students&apos;
          voices in the recording too.
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
