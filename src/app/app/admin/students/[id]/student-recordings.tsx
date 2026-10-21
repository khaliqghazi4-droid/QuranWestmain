"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { PlayCircle, Play, Download, Clock, X, Film, Eye } from "lucide-react";
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

// The class recordings of one student, on the admin's student page, as cards
// like the Recordings page's. Recordings are admin-only until the admin shows
// one to the student.
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
      <div className="flex items-center gap-[12px] rounded-xl border-[1px] border-dashed border-border px-[16px] py-[14px] text-[13px] leading-[18px] text-muted-foreground">
        <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
          <Film className="h-4 w-4" />
        </span>
        No class recordings yet. Classes the teacher records with Start Class show up here after the class ends.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((r) => (
          <div
            key={r.id}
            className="adm-tile flex flex-col overflow-hidden rounded-xl border-[1px] border-border bg-background/60"
          >
            <button
              onClick={() => setPlaying(r)}
              aria-label="Watch recording"
              className="group/thumb relative grid aspect-video place-items-center overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10"
            >
              <RecordingThumbnail url={r.url} durationSec={r.durationSec} />
              {sharedIds.has(r.id) && (
                <span className="absolute left-[8px] top-[8px] inline-flex items-center gap-[4px] rounded-md bg-emerald-600 px-[7px] py-[2px] text-[10.5px] font-bold leading-[15px] text-white shadow-md">
                  <Eye className="h-3 w-3" /> Shared
                </span>
              )}
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/90 text-primary shadow-[0_8px_20px_-6px_rgb(0_0_0/0.45)] transition-transform group-hover/thumb:scale-110">
                <Play className="ml-[2px] h-5 w-5 fill-current" />
              </span>
              {r.durationSec ? (
                <span className="absolute bottom-[8px] right-[8px] inline-flex items-center gap-[4px] rounded-md bg-black/70 px-[7px] py-[2px] text-[10.5px] font-bold leading-[15px] text-white">
                  <Clock className="h-3 w-3" />
                  {formatDuration(r.durationSec)}
                </span>
              ) : null}
            </button>
            <div className="flex flex-1 flex-col p-[12px]">
              <p className="truncate text-[13.5px] font-bold leading-[19px]">{r.courseName ?? "Class recording"}</p>
              {r.teacherName && (
                <p className="truncate text-[12px] leading-[17px] text-muted-foreground">with {r.teacherName}</p>
              )}
              <p className="truncate text-[12px] leading-[17px] text-muted-foreground">
                {when(r.startedAt)}
                {r.sizeBytes ? ` · ${formatSize(r.sizeBytes)}` : ""}
              </p>
              <div className="mt-auto flex items-center gap-[8px] pt-[10px]">
                <button
                  onClick={() => setPlaying(r)}
                  className="inline-flex flex-1 items-center justify-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[12px] py-[7px] text-[12.5px] font-bold leading-[17px] text-primary-foreground shadow-md"
                >
                  <PlayCircle className="h-3.5 w-3.5" /> Watch
                </button>
                <a
                  href={r.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Download"
                  aria-label="Download recording"
                  className="grid h-[31px] w-[38px] shrink-0 place-items-center rounded-full border-[1px] border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="pt-[8px]">
                <ShareRecordingButton
                  recordingId={r.id}
                  shared={r.shared}
                  onChange={(shared) => markShared(r.id, shared)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Portalled to the shell: the glass card's blur (backdrop-filter)
          would trap a fixed overlay inside the card. The shell keeps
          .admin-brand, so the admin colours still apply. */}
      {playing &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-[16px] backdrop-blur-sm"
            onClick={() => setPlaying(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl overflow-hidden rounded-2xl border-[1px] border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between gap-[12px] border-b border-border px-[16px] py-[12px]">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold leading-[20px]">
                    {playing.courseName ?? "Class recording"}
                  </p>
                  <p className="truncate text-[12px] leading-[17px] text-muted-foreground">
                    {[playing.teacherName && `with ${playing.teacherName}`, when(playing.startedAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => setPlaying(null)}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <video src={playing.url} controls autoPlay className="max-h-[75vh] w-full bg-black" />
            </div>
          </div>,
          document.querySelector(".admin-dashboard") ?? document.body
        )}
    </>
  );
}

// "Oct 6, 2:12 PM PKT": recordings are dated in Pakistan time, as the classes are
function when(iso: string) {
  return (
    new Date(iso).toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " PKT"
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
