"use client";

import * as React from "react";
import { upload } from "@vercel/blob/client";

// Records the class tab (meeting video + the student's voice) mixed with the
// teacher's mic, then uploads it to Vercel Blob for the admin's Recordings tab.
// Lives in ClassRoom, which stays mounted for the whole class, so hiding the
// notes panel doesn't stop it.
//
// start() must run straight from a click: browsers only open the screen-share
// prompt on a user gesture.

export type RecorderStatus =
  | "idle"
  | "recording"
  | "uploading"
  | "saved"
  | "declined" // teacher dismissed the share prompt
  | "error"
  | "unsupported"; // no screen capture in this browser (phones)

export type UploadProgress = { loaded: number; total: number; percentage: number };

export type ClassRecorder = {
  status: RecorderStatus;
  elapsed: number; // seconds recorded so far
  // While status is "uploading"
  progress: UploadProgress | null;
  error: string | null;
  // A finished recording failed to save and is still held in memory
  canRetryUpload: boolean;
  start: () => Promise<void>;
  // Resolves once the recording is uploaded; false if saving failed
  stop: () => Promise<boolean>;
  retryUpload: () => Promise<boolean>;
};

type Pending = { blob: Blob; startedAt: Date; durationSec: number; url?: string };

export function useClassRecorder(roomId: string): ClassRecorder {
  const [status, setStatus] = React.useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = React.useState(0);
  const [progress, setProgress] = React.useState<UploadProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [canRetryUpload, setCanRetryUpload] = React.useState(false);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const streamsRef = React.useRef<MediaStream[]>([]);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = React.useRef(new Date());
  // Settles once the running recording has stopped and its upload finished
  const doneRef = React.useRef<Promise<boolean> | null>(null);
  const pendingRef = React.useRef<Pending | null>(null);

  // Turn off the share / mic indicators
  const releaseDevices = React.useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    for (const s of streamsRef.current) s.getTracks().forEach((t) => t.stop());
    streamsRef.current = [];
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  // Upload the pending recording (once) and save its ClassRecording row
  const save = React.useCallback(async (): Promise<boolean> => {
    const p = pendingRef.current;
    if (!p) return true;
    setStatus("uploading");
    setError(null);
    setCanRetryUpload(false);
    const total = p.blob.size;
    setProgress({ loaded: p.url ? total : 0, total, percentage: p.url ? 100 : 0 });
    const meta = {
      roomId,
      startedAt: p.startedAt.toISOString(),
      durationSec: p.durationSec,
    };
    try {
      if (!p.url) {
        const safeRoom = roomId.replace(/[^a-zA-Z0-9_-]/g, "-");
        const result = await upload(`recordings/${safeRoom}/${p.startedAt.getTime()}.webm`, p.blob, {
          access: "public",
          handleUploadUrl: "/api/upload/recording",
          contentType: p.blob.type,
          multipart: true,
          clientPayload: JSON.stringify(meta),
          onUploadProgress: ({ loaded, percentage }) =>
            setProgress({ loaded: Math.min(loaded, total), total, percentage: Math.min(100, percentage) }),
        });
        p.url = result.url;
        setProgress({ loaded: total, total, percentage: 100 });
      }
      const res = await fetch("/api/upload/recording/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meta, url: p.url, sizeBytes: p.blob.size, mimeType: p.blob.type }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Couldn't save the recording");
      }
      pendingRef.current = null;
      setStatus("saved");
      return true;
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
      setCanRetryUpload(true);
      return false;
    }
  }, [roomId]);

  const start = React.useCallback(async () => {
    // Already recording, or a finished recording still has to be saved first
    if (recorderRef.current || pendingRef.current) return;
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!md?.getDisplayMedia || typeof MediaRecorder === "undefined") {
      setStatus("unsupported");
      return;
    }
    setError(null);

    let display: MediaStream;
    try {
      // Chrome/Edge preselect this tab, so the prompt is a single "Allow"
      display = await md.getDisplayMedia({
        video: { frameRate: 15 },
        audio: true,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      } as DisplayMediaStreamOptions);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      if (name === "NotAllowedError" || name === "AbortError") {
        setStatus("declined");
      } else {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Couldn't start recording");
      }
      return;
    }

    let mic: MediaStream | null = null;
    try {
      mic = await md.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      mic = null; // record without the teacher's voice rather than not at all
    }
    streamsRef.current = mic ? [display, mic] : [display];

    // MediaRecorder keeps only the first audio track, so mix the tab audio
    // (the student's voice) and the mic into one
    const tracks: MediaStreamTrack[] = [...display.getVideoTracks()];
    const audioSources = streamsRef.current.filter((s) => s.getAudioTracks().length > 0);
    if (audioSources.length > 0) {
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      for (const s of audioSources) ctx.createMediaStreamSource(s).connect(dest);
      void ctx.resume();
      audioCtxRef.current = ctx;
      tracks.push(...dest.stream.getAudioTracks());
    }

    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((t) =>
      MediaRecorder.isTypeSupported(t)
    );
    let rec: MediaRecorder;
    try {
      // ~1 Mbps keeps an hour-long class around 450 MB
      rec = new MediaRecorder(new MediaStream(tracks), {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 1_000_000,
        audioBitsPerSecond: 64_000,
      });
    } catch (e) {
      releaseDevices();
      setStatus("error");
      setError(e instanceof Error ? e.message : "Couldn't start recording");
      return;
    }

    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    let resolveDone: (ok: boolean) => void = () => {};
    doneRef.current = new Promise<boolean>((r) => (resolveDone = r));
    rec.onstop = async () => {
      const startedAt = startedAtRef.current;
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 1000));
      recorderRef.current = null;
      releaseDevices();
      let ok = true;
      if (chunks.length === 0) {
        setStatus("idle");
      } else {
        const type = (rec.mimeType || "video/webm").split(";")[0];
        pendingRef.current = { blob: new Blob(chunks, { type }), startedAt, durationSec };
        ok = await save();
      }
      doneRef.current = null;
      resolveDone(ok);
    };
    // The teacher pressed the browser's "Stop sharing"
    display.getVideoTracks()[0]?.addEventListener("ended", () => {
      if (rec.state !== "inactive") rec.stop();
    });

    rec.start(1000);
    recorderRef.current = rec;
    startedAtRef.current = new Date();
    setElapsed(0);
    setStatus("recording");
    tickRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
  }, [releaseDevices, save]);

  const stop = React.useCallback(async (): Promise<boolean> => {
    const rec = recorderRef.current;
    const done = doneRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    if (done) return done;
    return save(); // retries a recording that failed to save; true if none
  }, [save]);

  // Leaving the room mid-class (e.g. a sidebar link): stop and keep uploading
  // in the background instead of dropping the recording
  React.useEffect(
    () => () => {
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      else releaseDevices();
    },
    [releaseDevices]
  );

  // Closing or reloading the tab would lose the recording
  const unsaved = status === "recording" || status === "uploading" || canRetryUpload;
  React.useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  return { status, elapsed, progress, error, canRetryUpload, start, stop, retryUpload: save };
}
