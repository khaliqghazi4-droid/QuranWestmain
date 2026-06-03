"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  StickyNote,
  FileText,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  User,
  Info,
  RefreshCw,
} from "lucide-react";
import { DailyMeeting } from "./daily-meeting";
import { JitsiMeeting } from "./jitsi-meeting";
import { DailyRecorder } from "./daily-recorder";
import { ScreenRecorder } from "./screen-recorder";

export type ClassRoomNote = {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
};

// In-app class room. When Daily.co is configured we mount Daily's prebuilt
// UI (no embed cutoff, supports local recording natively). Otherwise we fall
// back to Jitsi's External API with an auto-rejoin loop so the free
// meet.jit.si 5-minute cutoff becomes a 2-second hiccup.
export function ClassRoom({
  roomId,
  dailyUrl,
  jitsiRoomName,
  courseName,
  studentName,
  displayName,
  isTeacher,
  notes,
  backHref,
  startUTC,
  recorderSlot,
}: {
  roomId: string;
  dailyUrl: string | null;
  jitsiRoomName: string;
  courseName: string;
  studentName: string;
  displayName: string;
  isTeacher: boolean;
  notes: ClassRoomNote[];
  backHref: string;
  startUTC: number | null;
  // Optional pre-rendered recorder (used only when Daily isn't configured —
  // with Daily we use the integrated DailyRecorder instead).
  recorderSlot?: React.ReactNode;
}) {
  const [panelOpen, setPanelOpen] = React.useState(isTeacher);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [activeNote, setActiveNote] = React.useState<ClassRoomNote | null>(
    notes[0] ?? null
  );

  // When Daily is wired up we own the call object here so the integrated
  // recorder can start/stop recording on the live meeting.
  const [dailyCallObject, setDailyCallObject] = React.useState<unknown>(null);

  const useDaily = !!dailyUrl;

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
    <div
      className={`flex flex-col bg-background ${
        fullscreen ? "fixed inset-0 z-50" : "min-h-[calc(100vh-200px)]"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <Link
          href={backHref}
          className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate inline-flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> {courseName}
          </p>
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
            <User className="h-3 w-3" /> {studentName}
            {startLabel && <span>· starts {startLabel} PKT</span>}
          </p>
        </div>
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
          className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-black min-h-[60vh]">
          {useDaily ? (
            <DailyMeeting
              url={dailyUrl}
              displayName={displayName}
              onCallObject={setDailyCallObject}
            />
          ) : (
            <JitsiMeeting jitsiRoomName={jitsiRoomName} displayName={displayName} />
          )}
        </div>

        {/* Side panel (teacher-only): notes + recorder */}
        {isTeacher && panelOpen && (
          <aside className="hidden sm:flex w-80 lg:w-96 shrink-0 flex-col border-l border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border">
              {useDaily ? (
                <DailyRecorder
                  roomId={roomId}
                  courseName={courseName}
                  studentName={studentName}
                  callObject={dailyCallObject}
                />
              ) : (
                recorderSlot ?? (
                  <ScreenRecorder
                    roomId={roomId}
                    courseName={courseName}
                    studentName={studentName}
                  />
                )
              )}
            </div>

            <div className="p-3 border-b border-border flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
                <StickyNote className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-bold">My Notes</p>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="p-6 text-center">
                <StickyNote className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-xs font-semibold">
                  No notes for this course yet
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Add notes from{" "}
                  <Link
                    href="/app/teacher/notes"
                    className="text-primary underline"
                  >
                    My Notes
                  </Link>{" "}
                  and they&apos;ll appear here.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <ul className="w-32 lg:w-36 shrink-0 border-r border-border overflow-y-auto">
                  {notes.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => setActiveNote(n)}
                        className={`w-full text-left px-3 py-2 text-[11px] font-semibold border-b border-border/60 transition-colors line-clamp-2 ${
                          activeNote?.id === n.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {n.title}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex-1 overflow-y-auto p-3 text-xs">
                  {activeNote ? (
                    <>
                      <p className="font-bold text-sm mb-2">{activeNote.title}</p>
                      {activeNote.content ? (
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">
                          {activeNote.content}
                        </pre>
                      ) : (
                        <p className="italic text-muted-foreground">(No text)</p>
                      )}
                      {activeNote.fileUrl && (
                        <a
                          href={activeNote.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                        >
                          <FileText className="h-3 w-3" />
                          {activeNote.fileName || "Attached PDF"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="italic text-muted-foreground">Pick a note</p>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-border text-[10px] text-muted-foreground inline-flex items-start gap-1.5">
              <Info className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
              <span>
                {useDaily
                  ? "Tip: Click Record above when class starts — the lecture saves to the admin automatically when you stop."
                  : "Tip: Use the meeting's screen-share button to share your notes window with the student."}
              </span>
            </div>
          </aside>
        )}
      </div>
      <RefreshCw className="hidden" /> {/* keep RefreshCw import valid for future use */}
    </div>
  );
}
