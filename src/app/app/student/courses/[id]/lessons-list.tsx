"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Video,
  Music,
  Paperclip,
  Clock,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Trophy,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  fileUrl: string | null;
  duration: number | null;
  order: number;
  completed: boolean;
};

function getYoutubeEmbed(url: string): string | null {
  // Handle youtube.com/watch?v=ID and youtu.be/ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function LessonsList({ lessons }: { lessons: Lesson[] }) {
  const router = useRouter();
  const [openId, setOpenId] = React.useState<string | null>(
    lessons.find((l) => !l.completed)?.id ?? lessons[0]?.id ?? null
  );
  const [marking, setMarking] = React.useState<string | null>(null);
  const [localLessons, setLocalLessons] = React.useState(lessons);

  React.useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  async function toggleComplete(lesson: Lesson) {
    setMarking(lesson.id);
    const res = await fetch(`/api/lessons/${lesson.id}/complete`, { method: "POST" });
    setMarking(null);
    if (res.ok) {
      const data = await res.json();
      setLocalLessons(
        localLessons.map((l) => (l.id === lesson.id ? { ...l, completed: data.completed } : l))
      );
      router.refresh();
    }
  }

  if (localLessons.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-base font-bold">No lessons yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your teacher hasn&apos;t published any lessons yet. Check back soon.
        </p>
      </div>
    );
  }

  const completedCount = localLessons.filter((l) => l.completed).length;
  const allDone = completedCount === localLessons.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Course Lessons</h2>
        <div className="flex items-center gap-2 text-xs">
          {allDone && <Trophy className="h-4 w-4 text-[hsl(var(--gold))]" />}
          <span className={`font-bold ${allDone ? "text-[hsl(var(--gold))]" : ""}`}>
            {completedCount} / {localLessons.length} completed
          </span>
        </div>
      </div>

      {localLessons.map((lesson, i) => {
        const isOpen = openId === lesson.id;
        const embed = lesson.videoUrl ? getYoutubeEmbed(lesson.videoUrl) : null;
        return (
          <div
            key={lesson.id}
            className={`rounded-2xl border bg-card overflow-hidden transition-all stagger-item ${
              isOpen ? "border-primary/40 shadow-md" : "border-border hover:border-primary/30"
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : lesson.id)}
              className="w-full flex items-center gap-4 p-5 text-left"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComplete(lesson);
                }}
                disabled={marking === lesson.id}
                className="shrink-0"
                title={lesson.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {marking === lesson.id ? (
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                ) : lesson.completed ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-500 hover:text-emerald-600" />
                ) : (
                  <Circle className="h-7 w-7 text-muted-foreground hover:text-primary" />
                )}
              </button>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
                {lesson.order}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${lesson.completed ? "text-muted-foreground line-through" : ""}`}>
                  {lesson.title}
                </p>
                {lesson.description && !isOpen && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{lesson.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  {lesson.videoUrl && (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Video className="h-3 w-3" /> Video
                    </span>
                  )}
                  {lesson.audioUrl && (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Music className="h-3 w-3" /> Audio
                    </span>
                  )}
                  {lesson.fileUrl && (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Paperclip className="h-3 w-3" /> File
                    </span>
                  )}
                  {lesson.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {lesson.duration} min
                    </span>
                  )}
                </div>
              </div>

              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-border p-5 space-y-4 bg-background/40">
                {lesson.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lesson.description}
                  </p>
                )}

                {embed && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-border">
                    <iframe
                      src={embed}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                {lesson.audioUrl && (
                  <audio controls className="w-full">
                    <source src={lesson.audioUrl} />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {lesson.content && (
                  <div className="rounded-xl bg-card border border-border p-4">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">
                      Lesson Notes
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {lesson.content}
                    </p>
                  </div>
                )}

                {(lesson.videoUrl && !embed) && (
                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    <Video className="h-3.5 w-3.5" /> Open Video <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {lesson.fileUrl && (
                  <a
                    href={lesson.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    <Paperclip className="h-3.5 w-3.5" /> Download Attached File <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    onClick={() => toggleComplete(lesson)}
                    disabled={marking === lesson.id}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-md transition-all disabled:opacity-60 ${
                      lesson.completed
                        ? "bg-muted text-foreground hover:bg-muted/70"
                        : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
                    }`}
                  >
                    {marking === lesson.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : lesson.completed ? (
                      "Mark as Incomplete"
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
