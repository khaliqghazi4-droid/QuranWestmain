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

// Jitsi External API instance shape (subset we use).
type JitsiApi = {
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  dispose: () => void;
  executeCommand: (cmd: string, ...args: unknown[]) => void;
};
type JitsiApiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

// Jitsi External API global, loaded from meet.jit.si/external_api.js
declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiCtor;
  }
}

export type ClassRoomNote = {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
};

// In-app class room. Jitsi loads as an iframe in the same page so the teacher
// never leaves the academy site — they can keep their notes open on the right
// (teachers only) and start/stop a screen recording without switching tabs.
export function ClassRoom({
  roomId,
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
  jitsiRoomName: string;
  courseName: string;
  studentName: string;
  displayName: string;
  isTeacher: boolean;
  notes: ClassRoomNote[];
  backHref: string;
  startUTC: number | null;
  recorderSlot?: React.ReactNode;
}) {
  const [panelOpen, setPanelOpen] = React.useState(isTeacher);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [activeNote, setActiveNote] = React.useState<ClassRoomNote | null>(
    notes[0] ?? null
  );

  // Mount Jitsi via the official External API so we can listen for the
  // `readyToClose` event the free meet.jit.si fires after the 5-minute
  // embed cutoff — when it fires, we tear the instance down and re-mount
  // it, which the user perceives as a ~2s reconnect rather than a hard stop.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<JitsiApi | null>(null);
  const [reconnecting, setReconnecting] = React.useState(false);

  // Bump the version to force a remount of Jitsi (used by auto-rejoin and
  // by the manual "Reconnect" button).
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    function load(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-jitsi="external-api"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject(new Error("Jitsi script failed")));
          return;
        }
        const s = document.createElement("script");
        s.src = "https://meet.jit.si/external_api.js";
        s.async = true;
        s.dataset.jitsi = "external-api";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Jitsi script failed"));
        document.body.appendChild(s);
      });
    }

    (async () => {
      try {
        await load();
        if (cancelled || !container || !window.JitsiMeetExternalAPI) return;
        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName: jitsiRoomName,
          parentNode: container,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            requireDisplayName: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
          },
        });
        apiRef.current = api;
        // Jitsi fires `readyToClose` when the call is ending — including the
        // 5-min embed cutoff. Bump `version` to re-mount and rejoin.
        api.addEventListener("readyToClose", () => {
          if (cancelled) return;
          setReconnecting(true);
          // Brief pause to let Jitsi clean up before we re-create.
          setTimeout(() => {
            if (cancelled) return;
            setVersion((v) => v + 1);
          }, 1500);
        });
      } catch (e) {
        console.error("[class-room] Jitsi load failed", e);
      }
    })();

    return () => {
      cancelled = true;
      try {
        apiRef.current?.dispose();
      } catch {
        /* ignore */
      }
      apiRef.current = null;
      if (container) container.innerHTML = "";
    };
    // `version` re-runs the effect for auto-rejoin; the others are stable
    // identity for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, jitsiRoomName, displayName]);

  // Clear the reconnect banner once we're back in.
  React.useEffect(() => {
    if (reconnecting) {
      const t = setTimeout(() => setReconnecting(false), 4000);
      return () => clearTimeout(t);
    }
  }, [reconnecting, version]);

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
    <div className={`flex flex-col bg-background ${fullscreen ? "fixed inset-0 z-50" : "min-h-[calc(100vh-200px)]"}`}>
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
            {panelOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            <StickyNote className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{panelOpen ? "Hide" : "Show"} Notes</span>
          </button>
        )}
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Meeting mount — the Jitsi External API attaches its own iframe here */}
        <div className="flex-1 relative bg-black min-h-[60vh]">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
          {reconnecting && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 text-white px-4 py-2 text-xs font-semibold backdrop-blur">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Reconnecting…
            </div>
          )}
          <button
            onClick={() => setVersion((v) => v + 1)}
            title="Reconnect meeting"
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 text-[11px] font-semibold backdrop-blur"
          >
            <RefreshCw className="h-3 w-3" /> Reconnect
          </button>
        </div>

        {/* Side panel (teacher-only): notes + recorder */}
        {isTeacher && panelOpen && (
          <aside className="hidden sm:flex w-80 lg:w-96 shrink-0 flex-col border-l border-border bg-card overflow-hidden">
            {recorderSlot && <div className="p-3 border-b border-border">{recorderSlot}</div>}

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
                <p className="mt-3 text-xs font-semibold">No notes for this course yet</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Add notes from <Link href="/app/teacher/notes" className="text-primary underline">My Notes</Link> and they&apos;ll appear here.
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
                Tip: Use Jitsi&apos;s screen-share button to share your notes window
                with the student.
              </span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
