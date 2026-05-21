"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Video,
  Clock,
  Calendar,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  AlertCircle,
  ClipboardCheck,
  Users,
} from "lucide-react";

type ClassItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  duration: number;
  meetingUrl: string | null;
  course: { id: string; name: string; level: string };
  attendanceCount: number;
};

type Course = { id: string; name: string };

export function ClassesManager({
  initialClasses,
  courses,
}: {
  initialClasses: ClassItem[];
  courses: Course[];
}) {
  const router = useRouter();
  const [classes, setClasses] = React.useState(initialClasses);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const now = Date.now();
  const upcoming = classes.filter((c) => new Date(c.startTime).getTime() >= now);
  const past = classes.filter((c) => new Date(c.startTime).getTime() < now);

  async function handleDelete(id: string) {
    if (!confirm("Delete this class? Students will no longer see it.")) return;
    setDeleting(id);
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setClasses(classes.filter((c) => c.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
  }

  function handleCreated(c: ClassItem) {
    setClasses([...classes, c].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    setModalOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            You need at least one assigned course to schedule classes
          </p>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" /> Schedule Class
          </button>
        )}
      </div>

      <Section title="Upcoming Classes" classes={upcoming} empty="No upcoming classes scheduled" onDelete={handleDelete} deleting={deleting} />

      {past.length > 0 && (
        <Section title="Past Classes" classes={past} empty="" onDelete={handleDelete} deleting={deleting} isPast />
      )}

      {modalOpen && (
        <CreateClassModal
          courses={courses}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function Section({
  title,
  classes,
  empty,
  onDelete,
  deleting,
  isPast,
}: {
  title: string;
  classes: ClassItem[];
  empty: string;
  onDelete: (id: string) => void;
  deleting: string | null;
  isPast?: boolean;
}) {
  if (classes.length === 0 && !empty) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {classes.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c, i) => {
            const start = new Date(c.startTime);
            const isToday = start.toDateString() === new Date().toDateString();
            return (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-all stagger-item"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`grid h-12 w-12 place-items-center rounded-xl shadow-md shrink-0 ${
                  isPast
                    ? "bg-muted text-muted-foreground"
                    : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                }`}>
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{c.title}</p>
                    {isToday && !isPast && (
                      <span className="rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--gold))]">
                        TODAY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.course.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {start.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {c.duration}m
                    </span>
                    {c.attendanceCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {c.attendanceCount} marked
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.meetingUrl && !isPast && (
                    <a
                      href={c.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg"
                    >
                      Start <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Link
                    href={`/app/teacher/attendance?classId=${c.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    <ClipboardCheck className="h-3 w-3" /> Mark
                  </Link>
                  <button
                    onClick={() => onDelete(c.id)}
                    disabled={deleting === c.id}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateClassModal({
  courses,
  onClose,
  onCreated,
}: {
  courses: Course[];
  onClose: () => void;
  onCreated: (c: ClassItem) => void;
}) {
  // Default to tomorrow at 5pm
  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, []);

  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState(tomorrow);
  const [duration, setDuration] = React.useState(45);
  const [meetingUrl, setMeetingUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title,
        description: description || undefined,
        startTime: new Date(startTime).toISOString(),
        duration: Number(duration),
        meetingUrl: meetingUrl || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create class");
      return;
    }

    onCreated({
      id: data.class.id,
      title: data.class.title,
      description: data.class.description,
      startTime: data.class.startTime,
      duration: data.class.duration,
      meetingUrl: data.class.meetingUrl,
      course: data.class.course,
      attendanceCount: 0,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold">Schedule New Class</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Course *</label>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Class Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tajweed Lesson 18 - Madd Rules"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What will be covered in this class?"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Start Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Duration (minutes) *</label>
              <input
                required
                type="number"
                min={5}
                max={300}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Meeting URL (Zoom/Meet)</label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Schedule Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
