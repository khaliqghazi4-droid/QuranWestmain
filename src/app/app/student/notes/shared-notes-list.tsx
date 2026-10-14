"use client";

import * as React from "react";
import { BookOpen, Calendar, Eye, FileText, Search, StickyNote, User, X } from "lucide-react";
import { PdfViewer } from "@/components/pdf-viewer";
import { formatNoteDate, noteEditedLabel } from "@/app/app/teacher/notes/notes-manager";
import type { SharedNote } from "@/lib/note-shares";

export function SharedNotesList({ notes }: { notes: SharedNote[] }) {
  const [query, setQuery] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("all");
  const [viewing, setViewing] = React.useState<SharedNote | null>(null);
  const [pdf, setPdf] = React.useState<{ url: string; title: string } | null>(null);

  const courses = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const n of notes) if (n.courseId && n.courseName) map.set(n.courseId, n.courseName);
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [notes]);

  const q = query.toLowerCase();
  const filtered = notes.filter(
    (n) =>
      (courseFilter === "all" || n.courseId === courseFilter) &&
      (n.title.toLowerCase().includes(q) ||
        (n.content?.toLowerCase().includes(q) ?? false) ||
        n.teacherName.toLowerCase().includes(q))
  );

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <StickyNote className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-semibold">No notes yet</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          When your teacher shares a note with you, it shows up here and in your class.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        {courses.length > 1 && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Filter by course"
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All courses ({notes.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({notes.filter((n) => n.courseId === c.id).length})
              </option>
            ))}
          </select>
        )}
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
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <StickyNote className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-semibold">No notes match your search</p>
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
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {n.courseName && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <BookOpen className="h-2.5 w-2.5" /> {n.courseName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="h-2.5 w-2.5" /> {n.teacherName}
                    </span>
                  </div>
                </div>
              </div>

              {n.content && (
                <p className="mt-3 text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {n.content}
                </p>
              )}

              {n.fileUrl && (
                <button
                  onClick={() => setPdf({ url: n.fileUrl!, title: n.fileName || n.title })}
                  className="mt-3 inline-flex items-center gap-1 self-start rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold hover:bg-muted/70"
                >
                  <FileText className="h-3 w-3 text-primary" />
                  {n.fileName || "View PDF"}
                </button>
              )}

              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatNoteDate(n.createdAt)}
                </p>
                <button
                  onClick={() => setViewing(n)}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/10 hover:text-primary"
                  title="View"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewing(null)}
        >
          <div className="flex min-h-full items-start sm:items-center justify-center p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl my-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-5 border-b border-border bg-card">
                <div className="min-w-0">
                  <h2 className="text-base font-bold truncate">{viewing.title}</h2>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatNoteDate(viewing.createdAt)}
                      {noteEditedLabel(viewing) && ` · ${noteEditedLabel(viewing)}`}
                    </span>
                    {viewing.courseName && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {viewing.courseName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" /> {viewing.teacherName}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setViewing(null)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {viewing.content ? (
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {viewing.content}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground italic">(No text content)</p>
                )}

                {viewing.fileUrl && (
                  <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm font-semibold flex-1 truncate">
                      {viewing.fileName || "Attached PDF"}
                    </p>
                    <button
                      onClick={() =>
                        setPdf({ url: viewing.fileUrl!, title: viewing.fileName || viewing.title })
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
      )}

      {pdf && <PdfViewer url={pdf.url} title={pdf.title} onClose={() => setPdf(null)} />}
    </div>
  );
}
