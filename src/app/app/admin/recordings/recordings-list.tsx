"use client";

import * as React from "react";
import {
  Video,
  PlayCircle,
  Download,
  Clock,
  User,
  BookOpen,
  Search,
  X,
  Film,
  Calendar,
  Eye,
} from "lucide-react";
import { ShareRecordingButton } from "@/components/admin/share-recording-button";
import { RecordingThumbnail } from "@/components/recording-thumbnail";

export type RecordingItem = {
  id: string;
  teacherName: string;
  studentName: string | null;
  courseName: string | null;
  url: string;
  mimeType: string | null;
  durationSec: number | null;
  sizeBytes: number | null;
  startedAt: string;
  createdAt: string;
  // A booked class's recording can be shown to its student; trials can't
  canShare: boolean;
  shared: boolean;
};

export function RecordingsList({ items }: { items: RecordingItem[] }) {
  const [query, setQuery] = React.useState("");
  const [playing, setPlaying] = React.useState<RecordingItem | null>(null);
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

  React.useLayoutEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    const html = document.documentElement;
    if (main) main.style.overflow = playing ? "hidden" : "";
    html.style.overflow = playing ? "hidden" : "";
    document.body.style.overflow = playing ? "hidden" : "";
    return () => {
      if (main) main.style.overflow = "";
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [playing]);

  const filtered = items.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.teacherName.toLowerCase().includes(q) ||
      (r.studentName ?? "").toLowerCase().includes(q) ||
      (r.courseName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by teacher, student, or course…"
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <p className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {items.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Film className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-semibold">
            {items.length === 0 ? "No recordings yet" : "No recordings match your search"}
          </p>
          {items.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              When a teacher records a class from inside the academy room, the file
              uploads here automatically.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
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
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                  <User className="h-3 w-3" /> {r.teacherName}
                  {r.studentName && <span>· {r.studentName}</span>}
                </p>
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
                {r.canShare && (
                  <ShareRecordingButton
                    recordingId={r.id}
                    shared={r.shared}
                    onChange={(shared) => markShared(r.id, shared)}
                  />
                )}
                {r.sizeBytes && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(r.sizeBytes)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                <p className="text-[11px] text-muted-foreground">
                  {playing.teacherName}
                  {playing.studentName && ` · ${playing.studentName}`}
                </p>
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
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
