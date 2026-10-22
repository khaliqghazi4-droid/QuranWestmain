"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Download,
  Eye,
  Film,
  GraduationCap,
  Play,
  PlayCircle,
  Presentation,
  Search,
  X,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ShareRecordingButton } from "@/components/admin/share-recording-button";
import { RecordingThumbnail } from "@/components/recording-thumbnail";
import { RecordingVideo } from "@/components/recording-video";

export type Person = { id: string; name: string; image: string | null };

export type Recording = {
  id: string;
  teacherId: string;
  // the student's user id, or `name:<name>` when no account matches
  studentKey: string;
  courseName: string | null;
  url: string;
  durationSec: number | null;
  sizeBytes: number | null;
  startedAt: string;
  canShare: boolean;
  shared: boolean;
};

type By = "teacher" | "student";

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "Oct 6, 2:12 PM PKT": recordings are dated in Pakistan time, as the classes are
function when(iso: string) {
  return (
    new Date(iso).toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " PKT"
  );
}

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", month: "short", day: "numeric" });
}

function clock(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

// "1h 12m" / "26m" of recorded class time
function total(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${Math.max(m, sec > 0 ? 1 : 0)}m`;
}

function size(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Two ways in: pick a teacher or a student from their cards, then see their
// recordings grouped by the other person, A to Z. Where the admin is lives in
// the address (?by=teacher&id=…), so Back and refresh keep it; pushState
// updates useSearchParams without asking the server again.
export function RecordingsBrowser({
  teachers,
  students,
  recordings,
}: {
  teachers: Person[];
  students: Person[];
  recordings: Recording[];
}) {
  const params = useSearchParams();
  const by: By = params.get("by") === "student" ? "student" : "teacher";
  const selectedId = params.get("id");

  const [query, setQuery] = React.useState("");
  const [playing, setPlaying] = React.useState<Recording | null>(null);
  const [sharedIds, setSharedIds] = React.useState(() => new Set(recordings.filter((r) => r.shared).map((r) => r.id)));
  React.useEffect(() => setSharedIds(new Set(recordings.filter((r) => r.shared).map((r) => r.id))), [recordings]);

  const teacherById = React.useMemo(() => new Map(teachers.map((t) => [t.id, t])), [teachers]);
  const studentByKey = React.useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  // Each person's recordings, newest first (the server sends them that way)
  const byTeacher = React.useMemo(() => groupBy(recordings, (r) => r.teacherId), [recordings]);
  const byStudent = React.useMemo(() => groupBy(recordings, (r) => r.studentKey), [recordings]);

  const people = by === "teacher" ? teachers : students;
  const selected = selectedId ? (by === "teacher" ? teacherById : studentByKey).get(selectedId) ?? null : null;

  function go(next: By, id?: string) {
    const sp = new URLSearchParams({ by: next });
    if (id) sp.set("id", id);
    window.history.pushState(null, "", `?${sp}`);
    setQuery("");
    document.querySelector("main")?.scrollTo({ top: 0 });
  }

  function markShared(id: string, shared: boolean) {
    setSharedIds((prev) => {
      const next = new Set(prev);
      if (shared) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // The page behind the player stays put
  React.useEffect(() => {
    if (!playing) return;
    const locked = [document.querySelector("main"), document.documentElement, document.body].filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );
    locked.forEach((el) => (el.style.overflow = "hidden"));
    return () => locked.forEach((el) => (el.style.overflow = ""));
  }, [playing]);

  const q = query.trim().toLowerCase();
  const cards = people.filter((p) => !q || p.name.toLowerCase().includes(q)).sort(byName);

  return (
    <div className="space-y-6">
      {/* The two ways in. They stay on top, so the other is a click away;
          clicking the open one goes back to its full list. */}
      <div role="tablist" aria-label="Browse recordings" className="grid grid-cols-2 gap-[12px]">
        {(
          [
            { key: "teacher", icon: Presentation, title: "By teacher", sub: plural(teachers.length, "teacher") },
            { key: "student", icon: GraduationCap, title: "By student", sub: plural(students.length, "student") },
          ] as const
        ).map((o) => {
          const active = by === o.key;
          return (
            <button
              key={o.key}
              role="tab"
              aria-selected={active}
              onClick={() => go(o.key)}
              // phones: icon above the words, which were cut off beside it
              className={`flex min-w-0 flex-col items-start gap-[10px] rounded-2xl border-[1px] px-[14px] py-[14px] text-left transition-all sm:flex-row sm:items-center sm:gap-[12px] sm:px-[18px] ${
                active
                  ? "adm-badge border-transparent bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md"
                  : "adm-glass border-border bg-card hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`grid h-[40px] w-[40px] shrink-0 place-items-center rounded-xl sm:h-[44px] sm:w-[44px] ${
                  active
                    ? "bg-white/15 ring-1 ring-white/25"
                    : "adm-icon bg-gradient-to-br from-primary/15 to-accent/15 text-primary"
                }`}
              >
                <o.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold leading-[20px]">{o.title}</span>
                <span
                  className={`block truncate text-[12px] leading-[16px] ${
                    active ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {o.sub}
                  <span className="hidden sm:inline"> · {plural(recordings.length, "recording")}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <PersonRecordings
          by={by}
          person={selected}
          items={(by === "teacher" ? byTeacher : byStudent).get(selected.id) ?? []}
          lookup={by === "teacher" ? (r) => studentByKey.get(r.studentKey) : (r) => teacherById.get(r.teacherId)}
          groupKey={by === "teacher" ? (r) => r.studentKey : (r) => r.teacherId}
          sharedIds={sharedIds}
          onBack={() => go(by)}
          onPlay={setPlaying}
          onShared={markShared}
        />
      ) : (
        <>
          {/* Search over the cards */}
          <div className="adm-glass flex flex-wrap items-center gap-[12px] rounded-2xl border-[1px] border-border bg-card px-[16px] py-[12px] sm:px-[20px]">
            <div className="mr-auto min-w-0">
              <h2 className="text-[15px] font-bold leading-[20px]">{by === "teacher" ? "All teachers" : "All students"}</h2>
              <p className="text-[11.5px] leading-[16px] text-muted-foreground">
                A to Z · pick one to see their recordings
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={by === "teacher" ? "Search teachers" : "Search students"}
                aria-label={by === "teacher" ? "Search teachers" : "Search students"}
                className="w-full rounded-full border-[1px] border-border bg-background py-[8px] pl-[36px] pr-[16px] text-[13.5px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {cards.length === 0 ? (
            <Empty
              title={q ? `No ${by}s match “${query.trim()}”` : `No ${by}s yet`}
              text={q ? "Try another name." : by === "teacher" ? "Teachers you invite show here." : "Students you add show here."}
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-[12px]">
              {cards.map((p, i) => {
                const items = (by === "teacher" ? byTeacher : byStudent).get(p.id) ?? [];
                const others = new Set(items.map((r) => (by === "teacher" ? r.studentKey : r.teacherId))).size;
                return (
                  <button
                    key={p.id}
                    onClick={() => go(by, p.id)}
                    className="adm-glass group flex min-w-0 items-center gap-[14px] rounded-2xl border-[1px] border-border bg-card p-[16px] text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 stagger-item"
                    style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  >
                    <Avatar name={p.name} src={p.image} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold leading-[21px]">{p.name}</span>
                      <span className="block truncate text-[12.5px] leading-[18px] text-muted-foreground">
                        {items.length === 0
                          ? "No recordings yet"
                          : `${plural(items.length, "recording")} · ${plural(others, by === "teacher" ? "student" : "teacher")}`}
                      </span>
                      {items.length > 0 && (
                        <span className="block truncate text-[11.5px] leading-[16px] text-muted-foreground">
                          Latest {day(items[0].startedAt)}
                        </span>
                      )}
                    </span>
                    {/* fills with the navy gradient on hover (light mode: .adm-arrow) */}
                    <span className="adm-arrow relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {playing && (
        <Player
          recording={playing}
          teacher={teacherById.get(playing.teacherId)?.name}
          student={studentByKey.get(playing.studentKey)?.name}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}

function groupBy(list: Recording[], key: (r: Recording) => string) {
  const map = new Map<string, Recording[]>();
  for (const r of list) map.set(key(r), [...(map.get(key(r)) ?? []), r]);
  return map;
}

// One teacher's or student's recordings: a header with their totals, then a
// card per student (or teacher) in A to Z order, newest recording first
function PersonRecordings({
  by,
  person,
  items,
  lookup,
  groupKey,
  sharedIds,
  onBack,
  onPlay,
  onShared,
}: {
  by: By;
  person: Person;
  items: Recording[];
  lookup: (r: Recording) => Person | undefined;
  groupKey: (r: Recording) => string;
  sharedIds: Set<string>;
  onBack: () => void;
  onPlay: (r: Recording) => void;
  onShared: (id: string, shared: boolean) => void;
}) {
  const groups = Array.from(groupBy(items, groupKey).values())
    .map((list) => ({ person: lookup(list[0]) ?? { id: groupKey(list[0]), name: "Unknown", image: null }, list }))
    .sort((a, b) => byName(a.person, b.person));
  const seconds = items.reduce((sum, r) => sum + (r.durationSec ?? 0), 0);
  const other = by === "teacher" ? "student" : "teacher";

  return (
    <>
      <div className="adm-glass flex items-center gap-[14px] rounded-2xl border-[1px] border-border bg-card p-[16px] sm:p-[20px]">
        <button
          onClick={onBack}
          title={`All ${by}s`}
          aria-label={`Back to all ${by}s`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[1px] border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar name={person.name} src={person.image} size={52} />
        <div className="min-w-0 flex-1">
          {/* a p, not an h2: the glass card puts a bar before its h2 titles */}
          <p className="truncate text-[18px] font-bold leading-[24px]">{person.name}</p>
          <p className="text-[12.5px] leading-[18px] text-muted-foreground">
            {items.length === 0
              ? "No recordings yet"
              : `${plural(items.length, "recording")} · ${plural(groups.length, other)}${seconds ? ` · ${total(seconds)} recorded` : ""}`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty
          title={`No recordings for ${person.name} yet`}
          text="When a class is recorded in the academy room, it shows up here."
        />
      ) : (
        groups.map((g) => (
          <section key={g.person.id} className="adm-glass rounded-2xl border-[1px] border-border bg-card p-[16px] sm:p-[20px]">
            <div className="mb-[14px] flex items-center gap-[10px]">
              <Avatar name={g.person.name} src={g.person.image} size={32} />
              <h3 className="min-w-0 truncate text-[15px] font-bold leading-[20px]">{g.person.name}</h3>
              <span className="shrink-0 rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-semibold leading-[16px] text-primary">
                {g.list.length}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-[12px]">
              {g.list.map((r) => (
                <RecordingCard
                  key={r.id}
                  recording={r}
                  shared={sharedIds.has(r.id)}
                  onPlay={() => onPlay(r)}
                  onShared={(shared) => onShared(r.id, shared)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

function RecordingCard({
  recording: r,
  shared,
  onPlay,
  onShared,
}: {
  recording: Recording;
  shared: boolean;
  onPlay: () => void;
  onShared: (shared: boolean) => void;
}) {
  return (
    <div className="adm-tile flex flex-col overflow-hidden rounded-xl border-[1px] border-border bg-background/60">
      <button
        onClick={onPlay}
        aria-label="Watch recording"
        className="group/thumb relative grid aspect-video place-items-center overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10"
      >
        <RecordingThumbnail url={r.url} durationSec={r.durationSec} />
        {shared && (
          <span className="absolute left-[8px] top-[8px] inline-flex items-center gap-[4px] rounded-md bg-emerald-600 px-[7px] py-[2px] text-[10.5px] font-bold leading-[15px] text-white shadow-md">
            <Eye className="h-3 w-3" /> Shared
          </span>
        )}
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/90 text-primary shadow-[0_8px_20px_-6px_rgb(0_0_0/0.45)] transition-transform group-hover/thumb:scale-110">
          <Play className="ml-[2px] h-5 w-5 fill-current" />
        </span>
        {r.durationSec ? (
          <span className="absolute bottom-[8px] right-[8px] inline-flex items-center gap-[4px] rounded-md bg-black/70 px-[7px] py-[2px] text-[10.5px] font-bold leading-[15px] text-white">
            <Clock className="h-3 w-3" />
            {clock(r.durationSec)}
          </span>
        ) : null}
      </button>
      <div className="flex flex-1 flex-col p-[12px]">
        <p className="truncate text-[13.5px] font-bold leading-[19px]">{r.courseName ?? "Class recording"}</p>
        <p className="truncate text-[12px] leading-[17px] text-muted-foreground">
          {when(r.startedAt)}
          {r.sizeBytes ? ` · ${size(r.sizeBytes)}` : ""}
        </p>
        <div className="mt-auto flex items-center gap-[8px] pt-[10px]">
          <button
            onClick={onPlay}
            className="inline-flex flex-1 items-center justify-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[12px] py-[7px] text-[12.5px] font-bold leading-[17px] text-primary-foreground shadow-md"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Watch
          </button>
          <a
            href={r.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            title="Download"
            aria-label="Download recording"
            className="grid h-[31px] w-[38px] shrink-0 place-items-center rounded-full border-[1px] border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
        {r.canShare && (
          <div className="pt-[8px]">
            <ShareRecordingButton recordingId={r.id} shared={shared} onChange={onShared} />
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="adm-glass rounded-2xl border-[1px] border-border bg-card px-[24px] py-[48px] text-center">
      <span className="adm-icon mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
        <Film className="h-5 w-5" />
      </span>
      <p className="mt-[12px] text-[14px] font-semibold leading-[20px]">{title}</p>
      <p className="mx-auto mt-[2px] max-w-md text-[12.5px] leading-[18px] text-muted-foreground">{text}</p>
    </div>
  );
}

function Player({
  recording,
  teacher,
  student,
  onClose,
}: {
  recording: Recording;
  teacher?: string;
  student?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-[16px] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl overflow-hidden rounded-2xl border-[1px] border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between gap-[12px] border-b border-border px-[16px] py-[12px]">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold leading-[20px]">{recording.courseName ?? "Class recording"}</p>
            <p className="truncate text-[12px] leading-[17px] text-muted-foreground">
              {[teacher, student, when(recording.startedAt)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <RecordingVideo src={recording.url} durationSec={recording.durationSec} className="max-h-[75vh]" />
      </div>
    </div>
  );
}
