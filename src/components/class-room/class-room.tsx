"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  StickyNote,
  FileText,
  Eye,
  Pencil,
  Plus,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  User,
  Info,
  RefreshCw,
  Play,
  Video,
  Loader2,
  PhoneOff,
} from "lucide-react";
import { DailyMeeting } from "./daily-meeting";
import { JitsiMeeting } from "./jitsi-meeting";
import { useClassRecorder } from "./use-class-recorder";
import { RecordingStatus, UploadProgressBar, percentOf } from "./recording-status";
import { PdfViewer } from "@/components/pdf-viewer";
import { NoteEditorForm, type NoteItem } from "@/app/app/teacher/notes/notes-manager";

// Same shape as My Notes, so the in-class panel can reuse its note editor
export type ClassRoomNote = NoteItem;

// In-app class room. When Daily.co is configured we mount Daily's prebuilt
// UI; otherwise Jitsi's External API (JaaS on 8x8.vc, or meet.jit.si with an
// auto-rejoin loop over its 5-minute embed cutoff).
//
// The teacher joins with a Start Class button: that one click joins the
// meeting and starts recording the class (browsers only allow screen capture
// from a click). The recording uploads when the class ends.
export function ClassRoom({
  roomId,
  dailyUrl,
  jitsiRoomName,
  jaas,
  courseName,
  courseId,
  studentName,
  displayName,
  isTeacher,
  isAdmin = false,
  notes,
  backHref,
  startUTC,
}: {
  roomId: string;
  dailyUrl: string | null;
  jitsiRoomName: string;
  // JaaS room token: joins on 8x8.vc so the teacher is moderator
  jaas?: { appId: string; jwt: string } | null;
  courseName: string;
  // The class's course; new notes from the panel are filed under it
  courseId: string | null;
  studentName: string;
  displayName: string;
  isTeacher: boolean;
  // Admin looking in: joins straight away with camera/mic off, no student
  // "waiting for teacher" hold, no recording or notes
  isAdmin?: boolean;
  notes: ClassRoomNote[];
  backHref: string;
  startUTC: number | null;
}) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = React.useState(isTeacher);
  const [fullscreen, setFullscreen] = React.useState(false);
  // Notes are added/edited from the panel without leaving the class
  const [noteList, setNoteList] = React.useState(notes);
  const [activeNote, setActiveNote] = React.useState<ClassRoomNote | null>(
    notes[0] ?? null
  );
  // Open note editor: `note` is null for a new note
  const [editor, setEditor] = React.useState<{ note: ClassRoomNote | null } | null>(null);
  const [pdf, setPdf] = React.useState<{ url: string; title: string } | null>(null);

  function noteSaved(saved: ClassRoomNote) {
    setNoteList((prev) => [saved, ...prev.filter((n) => n.id !== saved.id)]);
    setActiveNote(saved);
    setEditor(null);
  }

  // Students join straight away; the teacher joins with Start Class
  const [joined, setJoined] = React.useState(!isTeacher);
  const [ending, setEnding] = React.useState(false);
  const recorder = useClassRecorder(roomId);
  const recordingLive = recorder.status === "recording" || recorder.status === "uploading";

  const useDaily = !!dailyUrl;

  function startClass() {
    // start() opens the share prompt first thing, inside this click
    void recorder.start();
    setJoined(true);
  }

  // Stop + upload the recording, then leave
  async function endClass() {
    setEnding(true);
    const ok = await recorder.stop();
    if (
      ok ||
      window.confirm("The recording couldn't be saved. Leave anyway? The recording will be lost.")
    ) {
      router.push(backHref);
    } else {
      setEnding(false);
    }
  }

  // Wall-clock label so the teacher knows when class is supposed to end.
  const startLabel = startUTC
    ? new Date(startUTC).toLocaleTimeString("en-US", {
        timeZone: "Asia/Karachi",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    // Fills the dashboard's area under the header (or the whole window in
    // fullscreen), so the class fits one screen with no page scroll
    <div
      className={`flex flex-col min-w-0 bg-background ${
        fullscreen ? "fixed inset-0 z-50" : "flex-1 min-h-0"
      }`}
    >
      {/* Arbitrary spacing: the website's Bootstrap stylesheet overrides
          .px-4/.py-3/.gap-3 with !important */}
      <div className="flex items-center gap-[8px] sm:gap-[12px] px-[12px] sm:px-[16px] py-[10px] border-b border-border bg-card shrink-0">
        {isTeacher && recordingLive ? (
          // Leaving mid-recording goes through End Class so the recording saves
          <button
            onClick={endClass}
            disabled={ending}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-50"
            title="End class and save the recording"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href={backHref}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border hover:bg-muted"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        {/* Long names are cut with "…" instead of widening the page */}
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{courseName}</span>
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {studentName}
              {startLabel && ` · starts ${startLabel} PKT`}
            </span>
            {!isTeacher && !isAdmin && (
              <span className="hidden sm:inline-flex shrink-0 items-center gap-1">
                · <Video className="h-3 w-3" /> This class is recorded
              </span>
            )}
          </p>
        </div>
        {isTeacher && joined && (
          <>
            <RecordingStatus recorder={recorder} variant="pill" />
            <button
              onClick={endClass}
              disabled={ending}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-60"
              title="End the class and save the recording"
            >
              {ending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PhoneOff className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {!ending
                  ? "End Class"
                  : recorder.status === "uploading"
                    ? `Saving ${percentOf(recorder.progress)}%`
                    : "Saving…"}
              </span>
            </button>
          </>
        )}
        {isTeacher && (
          <button
            onClick={() => setPanelOpen((p) => !p)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            title={panelOpen ? "Hide notes" : "Show notes"}
          >
            {panelOpen ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
            <StickyNote className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {panelOpen ? "Hide" : "Show"} Notes
            </span>
          </button>
        )}
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border hover:bg-muted"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 relative bg-black">
          {!joined ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-white">
              <div className="max-w-sm text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10">
                  <Video className="h-6 w-6" />
                </div>
                <p className="mt-4 text-lg font-bold">{courseName}</p>
                <p className="text-xs text-white/70">{studentName}</p>
                <button
                  onClick={startClass}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:shadow-xl"
                >
                  <Play className="h-4 w-4" /> Start Class
                </button>
                <p className="mt-3 text-[11px] leading-relaxed text-white/60">
                  The class is recorded for the admin. When your browser asks to share this
                  tab, click <span className="font-bold text-white/80">Allow</span> /{" "}
                  <span className="font-bold text-white/80">Share</span>.
                </p>
              </div>
            </div>
          ) : useDaily ? (
            <DailyMeeting
              url={dailyUrl}
              displayName={displayName}
              onLeft={isTeacher ? () => void recorder.stop() : undefined}
            />
          ) : (
            <JitsiMeeting
              jitsiRoomName={jitsiRoomName}
              displayName={displayName}
              jaas={jaas}
              onHangup={isTeacher ? () => void recorder.stop() : undefined}
              onRejoin={isTeacher ? () => void recorder.start() : undefined}
              waitingLabel={isTeacher ? `Waiting for ${studentName} to join…` : undefined}
              enableLobby={isTeacher}
              waitForTeacherLabel={
                isTeacher || isAdmin ? undefined : "Waiting for your teacher to start the class…"
              }
              startMuted={isAdmin}
            />
          )}

          {/* After End Class: the teacher waits here while the recording uploads */}
          {ending && recorder.status === "uploading" && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/75 p-6 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white/10 p-5 text-white shadow-xl">
                <p className="text-sm font-bold inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving the class recording
                </p>
                <p className="mt-1 text-[11px] text-white/70">
                  Keep this page open until the upload finishes.
                </p>
                <div className="mt-4">
                  <UploadProgressBar progress={recorder.progress} tone="onDark" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel (teacher-only): notes + recorder */}
        {isTeacher && panelOpen && (
          <aside className="hidden sm:flex w-72 xl:w-80 shrink-0 flex-col border-l border-border bg-card overflow-hidden">
            <div className="p-2.5 border-b border-border">
              <RecordingStatus recorder={recorder} variant="card" />
            </div>

            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
              <StickyNote className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-bold">Notes</p>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {noteList.length}
              </span>
              {!editor && (
                <button
                  onClick={() => setEditor({ note: null })}
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20"
                  title="Write a new note"
                >
                  <Plus className="h-3 w-3" /> New
                </button>
              )}
            </div>

            {editor ? (
              // Written right here in the panel, so the meeting stays in view
              <div className="flex-1 overflow-y-auto">
                <p className="px-3 pt-2.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                  {editor.note ? "Edit note" : "New note"}
                </p>
                <NoteEditorForm
                  key={editor.note?.id ?? "new"}
                  compact
                  note={editor.note}
                  courses={courseId ? [{ id: courseId, name: courseName }] : []}
                  defaultCourseId={courseId}
                  onCancel={() => setEditor(null)}
                  onSaved={noteSaved}
                />
              </div>
            ) : noteList.length === 0 ? (
              <div className="p-4 text-center">
                <StickyNote className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  No notes for this course yet.
                </p>
                <button
                  onClick={() => setEditor({ note: null })}
                  className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                >
                  <Plus className="h-3 w-3" /> New note
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <ul className="max-h-40 shrink-0 overflow-y-auto border-b border-border">
                  {noteList.map((n) => {
                    const selected = activeNote?.id === n.id;
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => setActiveNote(n)}
                          className={`flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left text-xs transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 font-semibold text-primary"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <span className="flex-1 min-w-0 truncate">{n.title}</span>
                          {n.fileUrl && (
                            <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex-1 overflow-y-auto p-3">
                  {activeNote ? (
                    <>
                      <div className="flex items-start gap-2">
                        <p className="flex-1 min-w-0 text-sm font-semibold leading-snug">
                          {activeNote.title}
                        </p>
                        <button
                          onClick={() => setEditor({ note: activeNote })}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          title="Edit note"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                      {activeNote.content ? (
                        // m-0: the website stylesheet adds a bottom margin to <pre>
                        <pre className="m-0 mt-1.5 whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/90">
                          {activeNote.content}
                        </pre>
                      ) : (
                        <p className="mt-1.5 text-xs italic text-muted-foreground">(No text)</p>
                      )}
                      {activeNote.fileUrl && (
                        // Opens over the class instead of a new tab, so the
                        // teacher stays on the recorded class tab
                        <button
                          onClick={() =>
                            setPdf({
                              url: activeNote.fileUrl!,
                              title: activeNote.fileName || activeNote.title,
                            })
                          }
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                        >
                          <FileText className="h-3 w-3" />
                          {activeNote.fileName || "Attached PDF"}
                          <Eye className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">Pick a note</p>
                  )}
                </div>
              </div>
            )}

            <div className="px-3 py-2 border-t border-border flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0 text-primary" />
              <span>Use screen-share to show a note to the student.</span>
            </div>
          </aside>
        )}
      </div>

      {pdf &&<PdfViewer url={pdf.url} title={pdf.title} onClose={() => setPdf(null)} />}
      <RefreshCw className="hidden" /> {/* keep RefreshCw import valid for future use */}
    </div>
  );
}
