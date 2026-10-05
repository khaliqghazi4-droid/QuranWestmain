"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Play,
  Video,
  Loader2,
  PhoneOff,
} from "lucide-react";
import { DailyMeeting } from "./daily-meeting";
import { JitsiMeeting } from "./jitsi-meeting";
import { useClassRecorder } from "./use-class-recorder";
import { RecordingStatus, UploadProgressBar, percentOf } from "./recording-status";

export type ClassRoomNote = {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
};

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
  studentName,
  displayName,
  isTeacher,
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
  studentName: string;
  displayName: string;
  isTeacher: boolean;
  notes: ClassRoomNote[];
  backHref: string;
  startUTC: number | null;
}) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = React.useState(isTeacher);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [activeNote, setActiveNote] = React.useState<ClassRoomNote | null>(
    notes[0] ?? null
  );

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
    <div
      className={`flex flex-col bg-background ${
        fullscreen ? "fixed inset-0 z-50" : "min-h-[calc(100vh-200px)]"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        {isTeacher && recordingLive ? (
          // Leaving mid-recording goes through End Class so the recording saves
          <button
            onClick={endClass}
            disabled={ending}
            className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-50"
            title="End class and save the recording"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href={backHref}
            className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate inline-flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> {courseName}
          </p>
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
            <User className="h-3 w-3" /> {studentName}
            {startLabel && <span>· starts {startLabel} PKT</span>}
            {!isTeacher && (
              <span className="inline-flex items-center gap-1">
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
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-60"
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
                isTeacher ? undefined : "Waiting for your teacher to start the class…"
              }
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
          <aside className="hidden sm:flex w-80 lg:w-96 shrink-0 flex-col border-l border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border">
              <RecordingStatus
                recorder={recorder}
                variant="card"
                courseName={courseName}
                studentName={studentName}
              />
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
                Tip: Use the meeting&apos;s screen-share button to share your notes window
                with the student. Click End Class when you finish so the recording saves.
              </span>
            </div>
          </aside>
        )}
      </div>
      <RefreshCw className="hidden" /> {/* keep RefreshCw import valid for future use */}
    </div>
  );
}
