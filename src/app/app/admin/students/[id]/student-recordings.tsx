"use client";

import * as React from "react";
import {
  PlayCircle,
  Download,
  Clock,
  User,
  BookOpen,
  X,
  Film,
  Calendar,
  Video,
  Eye,
} from "lucide-react";
import { RecordingThumbnail } from "@/components/recording-thumbnail";
import { ShareRecordingButton } from "@/components/admin/share-recording-button";

export type StudentRecordingItem = {
  id: string;
  teacherName: string | null;
  courseName: string | null;
  url: string;
  durationSec: number | null;
  sizeBytes: number | null;
  startedAt: string; // ISO
  shared: boolean; // visible on the student's Schedule page
};

// The class recordings of one student, on the admin's student page.
// Recordings are admin-only until the admin shows one to the student.
export function StudentRecordings({ items }: { items: StudentRecordingItem[] }) {
  const [playing, setPlaying] = React.useState<StudentRecordingItem | null>(null);
  const [sharedIds, setSharedIds] = React.useState(
    () => new Set(items.filter((r) => r.shared).map((r) => r.id))
  );
  React.useEffect(
    () => setSharedIds(new Set(items.filter((r) => r.shared).map((r) => r.id))),
    [items]
  );
  function markShared(id: string, shared: boolean) {
    setSharedIds((prev) => {
      const next = new Set(prev);
      if (shared) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 text-center">
        <Film className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-semibold">No class recordings for this student yet</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          Classes the teacher records with Start Class show up here after the class ends.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
          >
            <button
              onClick={() => setPlaying(r)}
              className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 grid place-items-center group"
            >
              <RecordingThumbnail url={r.url} durationSec={r.durationSec} />
              {sharedIds.has(r.id) && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  <Eye className="h-2.5 w-2.5" /> Shared with student
                </span>
              )}
              <div className="relative grid h-14 w-14 place-items-center rounded-full bg-white/90 text-primary shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="h-7 w-7" />
              </div>
              {r.durationSec && (
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(r.durationSec)}
                </span>
              )}
            </button>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <p className="text-sm font-bold truncate inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                {r.courseName ?? "Class recording"}
              </p>
              {r.teacherName && (
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                  <User className="h-3 w-3" /> {r.teacherName}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {new Date(r.startedAt).toLocaleString("en-US", {
                  timeZone: "Asia/Karachi",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                PKT
                {r.sizeBytes ? <span>· {formatSize(r.sizeBytes)}</span> : null}
              </p>
              <div className="mt-auto pt-2 flex items-center gap-2">
                <button
                  onClick={() => setPlaying(r)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md"
                >
                  <PlayCircle className="h-3.5 w-3.5" /> Watch
                </button>
                <a
                  href={r.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
              <ShareRecordingButton
                recordingId={r.id}
                shared={r.shared}
                onChange={(shared) => markShared(r.id, shared)}
              />
            </div>
          </div>
        ))}
      </div>

      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-card rounded-2xl overflow-hidden border border-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="min-w-0">
                <p className="text-sm font-bold truncate inline-flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-primary" />
                  {playing.courseName ?? "Class recording"}
                </p>
                {playing.teacherName && (
                  <p className="text-[11px] text-muted-foreground">
                    with {playing.teacherName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setPlaying(null)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <video
              src={playing.url}
              controls
              autoPlay
              className="w-full bg-black max-h-[75vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}

function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
