"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Edit2,
  Trash2,
  Video,
  Music,
  Paperclip,
  Clock,
  Users,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { PdfUploader } from "@/components/pdf-uploader";
import { PdfViewer } from "@/components/pdf-viewer";

type Course = {
  id: string;
  name: string;
  level: string;
  lessonCount: number;
};

type StudentRef = { id: string; name: string };

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
  isPublished: boolean;
  completionsCount: number;
  assignedTo: StudentRef[];
};

type EnrolledStudent = { id: string; name: string; email: string };

export function LessonsManager({
  courses,
  activeCourseId,
  initialLessons,
  enrolledStudents,
}: {
  courses: Course[];
  activeCourseId: string | null;
  initialLessons: Lesson[];
  enrolledStudents: EnrolledStudent[];
}) {
  const router = useRouter();
  const [lessons, setLessons] = React.useState(initialLessons);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Lesson | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = React.useState<{ url: string; title: string } | null>(null);

  React.useEffect(() => {
    setLessons(initialLessons);
  }, [initialLessons]);

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-base font-bold">No courses assigned</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin needs to assign you a course before you can create lessons
        </p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson? Student progress will be recalculated.")) return;
    setDeleting(id);
    const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setLessons(lessons.filter((l) => l.id !== id));
      router.refresh();
    } else {
      alert("Delete failed");
    }
  }

  async function togglePublish(lesson: Lesson) {
    const res = await fetch(`/api/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !lesson.isPublished }),
    });
    if (res.ok) {
      setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, isPublished: !l.isPublished } : l)));
      router.refresh();
    }
  }

  function handleSaved(lesson: Lesson) {
    if (editing) {
      setLessons(lessons.map((l) => (l.id === lesson.id ? lesson : l)));
    } else {
      setLessons([...lessons, lesson]);
    }
    setModalOpen(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Course tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {courses.map((c) => {
          const isActive = c.id === activeCourseId;
          return (
            <Link
              key={c.id}
              href={`/app/teacher/lessons?courseId=${c.id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {c.name}
              <span className="rounded-full bg-current/10 px-2 py-0.5 text-[10px] opacity-70">
                {c.lessonCount}
              </span>
            </Link>
          );
        })}
        <div className="flex-1" />
        {activeCourseId && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md"
          >
            <Plus className="h-4 w-4" /> Add Lesson
          </button>
        )}
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-bold">No lessons yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &quot;Add Lesson&quot; to create your first lesson
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l, i) => (
            <div
              key={l.id}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all stagger-item"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0 font-bold">
                  {l.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold">{l.title}</h3>
                    {!l.isPublished && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold)/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--gold))]">
                        <EyeOff className="h-2.5 w-2.5" /> Draft
                      </span>
                    )}
                  </div>
                  {l.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px] text-muted-foreground">
                    {l.videoUrl && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Video className="h-3 w-3" /> Video
                      </span>
                    )}
                    {l.audioUrl && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Music className="h-3 w-3" /> Audio
                      </span>
                    )}
                    {l.fileUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setViewingPdf({ url: l.fileUrl!, title: l.title });
                        }}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        title="View PDF in app"
                      >
                        <Paperclip className="h-3 w-3" /> View PDF
                      </button>
                    )}
                    {l.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {l.duration}m
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {l.completionsCount} completed
                    </span>
                  </div>
                  {l.assignedTo.length > 0 ? (
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Assigned:
                      </span>
                      {l.assignedTo.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-destructive italic">
                      ⚠ Not assigned to any student — no one sees this lesson
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublish(l)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    title={l.isPublished ? "Unpublish" : "Publish"}
                  >
                    {l.isPublished ? (
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(l);
                      setModalOpen(true);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    disabled={deleting === l.id}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === l.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && activeCourseId && (
        <LessonModal
          courseId={activeCourseId}
          lesson={editing}
          enrolledStudents={enrolledStudents}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {viewingPdf && (
        <PdfViewer
          url={viewingPdf.url}
          title={viewingPdf.title}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </div>
  );
}

function LessonModal({
  courseId,
  lesson,
  enrolledStudents,
  onClose,
  onSaved,
}: {
  courseId: string;
  lesson: Lesson | null;
  enrolledStudents: EnrolledStudent[];
  onClose: () => void;
  onSaved: (lesson: Lesson) => void;
}) {
  const [title, setTitle] = React.useState(lesson?.title ?? "");
  const [description, setDescription] = React.useState(lesson?.description ?? "");
  const [content, setContent] = React.useState(lesson?.content ?? "");
  const [videoUrl, setVideoUrl] = React.useState(lesson?.videoUrl ?? "");
  const [audioUrl, setAudioUrl] = React.useState(lesson?.audioUrl ?? "");
  const [fileUrl, setFileUrl] = React.useState(lesson?.fileUrl ?? "");
  const [duration, setDuration] = React.useState<number | "">(lesson?.duration ?? "");
  const [studentIds, setStudentIds] = React.useState<Set<string>>(
    () => new Set(lesson?.assignedTo.map((s) => s.id) ?? [])
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleStudent(id: string) {
    setStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setStudentIds((prev) =>
      prev.size === enrolledStudents.length
        ? new Set()
        : new Set(enrolledStudents.map((s) => s.id))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (studentIds.size === 0) {
      setError("Pick at least one student to assign this lesson to");
      return;
    }
    setLoading(true);

    const url = lesson ? `/api/lessons/${lesson.id}` : "/api/lessons";
    const method = lesson ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title,
        description: description || null,
        content: content || null,
        videoUrl: videoUrl || null,
        audioUrl: audioUrl || null,
        fileUrl: fileUrl || null,
        duration: typeof duration === "number" ? duration : null,
        studentIds: Array.from(studentIds),
      }),
    });
    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    const assignedTo: StudentRef[] = Array.isArray(data.lesson.assignments)
      ? data.lesson.assignments.map((a: { student: StudentRef }) => a.student)
      : Array.from(studentIds).map((id) => ({
          id,
          name: enrolledStudents.find((s) => s.id === id)?.name ?? "Student",
        }));

    onSaved({
      id: data.lesson.id,
      title: data.lesson.title,
      description: data.lesson.description,
      content: data.lesson.content,
      videoUrl: data.lesson.videoUrl,
      audioUrl: data.lesson.audioUrl,
      fileUrl: data.lesson.fileUrl,
      duration: data.lesson.duration,
      order: data.lesson.order,
      isPublished: data.lesson.isPublished,
      completionsCount: lesson?.completionsCount ?? 0,
      assignedTo,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">{lesson ? "Edit Lesson" : "Create New Lesson"}</h2>
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lesson 1 - Introduction to Tajweed"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Assign to students (required) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-muted-foreground">
                Assign to students * ({studentIds.size}/{enrolledStudents.length})
              </label>
              {enrolledStudents.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-[11px] font-semibold text-primary hover:text-accent"
                >
                  {studentIds.size === enrolledStudents.length ? "Clear all" : "Select all"}
                </button>
              )}
            </div>
            {enrolledStudents.length === 0 ? (
              <p className="rounded-xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold)/0.08)] p-3 text-xs">
                No students enrolled in this course yet. Lessons need at least one student to assign to.
              </p>
            ) : (
              <div className="rounded-xl border border-border bg-background p-2 max-h-44 overflow-y-auto space-y-1">
                {enrolledStudents.map((s) => {
                  const checked = studentIds.has(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
                        checked ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(s.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm font-semibold flex-1">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{s.email}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              Only selected students will see this lesson in their panel.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Short Description</label>
            <input
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One-line summary for the lesson card"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Lesson Content (text)</label>
            <textarea
              value={content ?? ""}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Notes, instructions, references..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                <Video className="h-3 w-3" /> Video URL (YouTube/Vimeo)
              </label>
              <input
                type="url"
                value={videoUrl ?? ""}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                <Music className="h-3 w-3" /> Audio URL
              </label>
              <input
                type="url"
                value={audioUrl ?? ""}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1">
              <Paperclip className="h-3 w-3" /> Attached PDF
            </label>
            <PdfUploader value={fileUrl ?? ""} onChange={setFileUrl} folder="lessons" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> Estimated Duration (min)
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")}
                placeholder="15"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {lesson ? "Save Changes" : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
