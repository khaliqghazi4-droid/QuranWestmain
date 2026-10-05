"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  FileText,
  StickyNote,
  Loader2,
  X,
  AlertCircle,
  Save,
  Calendar,
  BookOpen,
} from "lucide-react";
import { PdfUploader } from "@/components/pdf-uploader";
import { PdfViewer } from "@/components/pdf-viewer";

export type CourseRef = { id: string; name: string };

export type NoteItem = {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  courseId: string | null;
  courseName: string | null;
  updatedAt: string;
};

export function NotesManager({
  initialNotes,
  courses,
}: {
  initialNotes: NoteItem[];
  courses: CourseRef[];
}) {
  const router = useRouter();
  const [notes, setNotes] = React.useState(initialNotes);
  const [query, setQuery] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState<string>("all");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NoteItem | null>(null);
  const [viewing, setViewing] = React.useState<NoteItem | null>(null);
  const [pdfViewing, setPdfViewing] = React.useState<{
    url: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const filtered = notes.filter((n) => {
    const q = query.toLowerCase();
    const matchesQ =
      n.title.toLowerCase().includes(q) ||
      (n.content?.toLowerCase().includes(q) ?? false) ||
      (n.courseName?.toLowerCase().includes(q) ?? false);
    const matchesCourse =
      courseFilter === "all" ||
      (courseFilter === "none" && !n.courseId) ||
      n.courseId === courseFilter;
    return matchesQ && matchesCourse;
  });

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete note "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/teacher/notes/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    router.refresh();
  }

  function handleSaved(saved: NoteItem) {
    setNotes((prev) => {
      const exists = prev.find((n) => n.id === saved.id);
      if (exists) return prev.map((n) => (n.id === saved.id ? saved : n));
      return [saved, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All notes ({notes.length})</option>
            <option value="none">
              No course ({notes.filter((n) => !n.courseId).length})
            </option>
            {courses.map((c) => {
              const count = notes.filter((n) => n.courseId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex-1" />
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full sm:w-64 rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <StickyNote className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-semibold">
            {notes.length === 0 ? "No notes yet" : "No notes match your filter"}
          </p>
          {notes.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Create your first note — text content + an optional PDF
              attachment.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors flex flex-col"
            >
              <div className="flex items-start gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0">
                  <StickyNote className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{n.title}</p>
                  {n.courseName && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary mt-0.5">
                      <BookOpen className="h-2.5 w-2.5" /> {n.courseName}
                    </span>
                  )}
                </div>
              </div>

              {n.content && (
                <p className="mt-3 text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {n.content}
                </p>
              )}

              {n.fileUrl && (
                <button
                  onClick={() =>
                    setPdfViewing({
                      url: n.fileUrl!,
                      title: n.fileName || n.title,
                    })
                  }
                  className="mt-3 inline-flex items-center gap-1 self-start rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold hover:bg-muted/70"
                >
                  <FileText className="h-3 w-3 text-primary" />
                  {n.fileName || "View PDF"}
                </button>
              )}

              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(n.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewing(n)}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/10 hover:text-primary"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(n);
                      setModalOpen(true);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/10 hover:text-primary"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id, n.title)}
                    disabled={deleting === n.id}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === n.id ? (
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

      {modalOpen && (
        <NoteEditorModal
          key={editing?.id ?? "new"}
          note={editing}
          courses={courses}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {viewing && (
        <NoteViewerModal
          note={viewing}
          onOpenPdf={(url, title) => setPdfViewing({ url, title })}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
            setModalOpen(true);
          }}
          onClose={() => setViewing(null)}
        />
      )}

      {pdfViewing && (
        <PdfViewer
          url={pdfViewing.url}
          title={pdfViewing.title}
          onClose={() => setPdfViewing(null)}
        />
      )}
    </div>
  );
}

function NoteEditorModal({
  note,
  courses,
  onClose,
  onSaved,
}: {
  note: NoteItem | null;
  courses: CourseRef[];
  onClose: () => void;
  onSaved: (n: NoteItem) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl my-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-card">
            <h2 className="text-base font-bold">
              {note ? "Edit Note" : "New Note"}
            </h2>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <NoteEditorForm
            note={note}
            courses={courses}
            onCancel={onClose}
            onSaved={onSaved}
          />
        </div>
      </div>
    </div>
  );
}

// The note form. Also used inside the class room's notes panel (`compact`),
// so the teacher can write notes mid-class without covering the meeting.
export function NoteEditorForm({
  note,
  courses,
  defaultCourseId,
  onCancel,
  onSaved,
  compact,
}: {
  note: NoteItem | null;
  courses: CourseRef[];
  // Course preselected for a new note
  defaultCourseId?: string | null;
  onCancel: () => void;
  onSaved: (n: NoteItem) => void;
  // Narrow layout for the class room's side panel
  compact?: boolean;
}) {
  const [title, setTitle] = React.useState(note?.title ?? "");
  const [content, setContent] = React.useState(note?.content ?? "");
  const [courseId, setCourseId] = React.useState(
    note?.courseId ?? defaultCourseId ?? "",
  );
  const [fileUrl, setFileUrl] = React.useState(note?.fileUrl ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Re-hydrate form state if the parent swaps in a different note while the
  // form is still mounted (e.g. after `router.refresh()` returned a server
  // copy with the fresh updatedAt). Without this, the form would keep showing
  // the version it originally mounted with — which is what "save ke
  // baad fresh dikhata" was reporting.
  React.useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setCourseId(note?.courseId ?? defaultCourseId ?? "");
    setFileUrl(note?.fileUrl ?? "");
    setError(null);
  }, [note?.id, note?.updatedAt, defaultCourseId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    const url = note ? `/api/teacher/notes/${note.id}` : "/api/teacher/notes";
    const method = note ? "PATCH" : "POST";
    const fileName = fileUrl
      ? (fileUrl.split("/").pop()?.replace(/^\d+-/, "") ?? null)
      : null;

    // Use the trimmed-or-null form values for both the request AND the
    // optimistic copy we hand back, so the on-screen card reflects what the
    // user actually typed even if the server response is delayed.
    const trimmedTitle = title.trim();
    const sentContent = content.trim() ? content : null;
    const sentCourseId = courseId || null;
    const sentFileUrl = fileUrl || null;

    if (!trimmedTitle) {
      setSaving(false);
      setError("Title is required");
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          title: trimmedTitle,
          content: sentContent,
          courseId: sentCourseId,
          fileUrl: sentFileUrl,
          fileName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      const n = data.note ?? {};
      onSaved({
        id: n.id ?? note?.id ?? `tmp-${Date.now()}`,
        title: n.title ?? trimmedTitle,
        content: n.content ?? sentContent,
        fileUrl: n.fileUrl ?? sentFileUrl,
        fileName: n.fileName ?? fileName,
        courseId: n.courseId ?? sentCourseId,
        courseName:
          n.course?.name ??
          (sentCourseId
            ? (courses.find((c) => c.id === sentCourseId)?.name ?? null)
            : null),
        updatedAt: n.updatedAt ?? new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  // Smaller controls in the class room's narrow panel
  const labelClass = `block font-semibold text-muted-foreground ${
    compact ? "text-[11px] mb-1" : "text-xs mb-1.5"
  }`;
  const fieldClass = `w-full rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
  }`;
  const buttonSize = compact ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm";

  return (
    <form
      onSubmit={submit}
      className={compact ? "p-3 space-y-2.5" : "p-5 space-y-4"}
    >
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Tajweed — Madd rules reference"
          className={fieldClass}
        />
      </div>

      {/* In class the note is filed under the class's course */}
      {!compact && (
        <div>
          <label className={labelClass}>Course (optional)</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={fieldClass}
          >
            <option value="">No specific course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Notes (text)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={compact ? 5 : 8}
          placeholder="Write your notes here..."
          className={`${fieldClass} resize-y font-mono`}
        />
      </div>

      <div>
        <label className={labelClass}>Attached PDF (optional)</label>
        <PdfUploader value={fileUrl} onChange={setFileUrl} folder="notes" />
      </div>

      <div
        className={
          compact
            ? "grid grid-cols-2 gap-2 pt-1"
            : "flex justify-end gap-2 pt-2"
        }
      >
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-full border border-border font-semibold hover:bg-muted ${buttonSize}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground shadow-md disabled:opacity-60 ${buttonSize}`}
        >
          {saving ? (
            <Loader2 className={compact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"} />
          ) : (
            <Save className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          )}
          {note ? "Update note" : compact ? "Save note" : "Create note"}
        </button>
      </div>
    </form>
  );
}

function NoteViewerModal({
  note,
  onOpenPdf,
  onEdit,
  onClose,
}: {
  note: NoteItem;
  onOpenPdf: (url: string, title: string) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl my-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-card">
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate">{note.title}</h2>
              {note.courseName && (
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                  <BookOpen className="h-3 w-3" /> {note.courseName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {note.content ? (
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {note.content}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                (No text content)
              </p>
            )}

            {note.fileUrl && (
              <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm font-semibold flex-1 truncate">
                  {note.fileName || "Attached PDF"}
                </p>
                <button
                  onClick={() =>
                    onOpenPdf(note.fileUrl!, note.fileName || note.title)
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  <Eye className="h-3 w-3" /> View PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
