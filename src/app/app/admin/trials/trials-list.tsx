"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Mail,
  MessageCircle,
  Baby,
  User,
  CalendarClock,
  BookOpen,
  GraduationCap,
  Video,
  Copy,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Loader2,
  Undo2,
  UserPlus,
  X,
  KeyRound,
  Lock,
  RotateCcw,
  Ban,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { addStudentHref } from "../enrollments/enrollments-list";
import { LoginCredentialsModal } from "@/components/admin/login-credentials-modal";

export type TeacherChoice = {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | null;
  shift: "DAY" | "NIGHT" | null;
  free: boolean;
  reason: string | null;
};

export type TrialSession = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  country: string;
  city: string;
  courseFor: "adult" | "kid";
  course: string;
  tutorGender: "male" | "female" | null;
  trialTime: string | null;
  children: { name: string; age: number | null; gender: "male" | "female" | null }[];
  createdAt: string | null;
  courseMatched: boolean;
  teacherChoices: TeacherChoice[];
  assignedTeacherId: string | null;
  assignedTeacherName: string | null;
  meetingLink: string | null;
  isStudent: boolean;
  // Time-limited free-trial login (null when none, e.g. already a full student)
  account: {
    id: string;
    phone: string | null;
    loginPassword: string | null;
    accessExpiresAt: string;
    suspendedAt: string | null;
  } | null;
};

function fmt(iso: string | null) {
  if (!iso) return "Not set";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TrialsList({ trials }: { trials: TrialSession[] }) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "past" | "needs-assign">(
    "upcoming"
  );

  const now = Date.now();
  const filtered = trials.filter((t) => {
    const q = query.toLowerCase();
    const matchesQuery =
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.course.toLowerCase().includes(q);
    const ts = t.trialTime ? new Date(t.trialTime).getTime() : 0;
    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && ts >= now) ||
      (filter === "past" && ts < now) ||
      (filter === "needs-assign" && !t.assignedTeacherId && ts >= now);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="upcoming">Upcoming</option>
            <option value="needs-assign">Needs teacher</option>
            <option value="past">Past</option>
            <option value="all">All ({trials.length})</option>
          </select>
        </div>
        <div className="flex-1" />
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, course..."
            className="w-full sm:w-72 rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm font-semibold">No trial sessions</p>
          {trials.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Use &quot;Free Trial&quot; on{" "}
              <Link href="/app/admin/enrollments" className="font-semibold text-primary hover:underline">
                Enrollment Requests
              </Link>{" "}
              to schedule one.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((t) => (
            <TrialCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrialCard({ t }: { t: TrialSession }) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [picker, setPicker] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const isKid = t.courseFor === "kid";

  async function assign(teacherId: string) {
    if (!t.trialTime) return;
    setError(null);
    setBusy(teacherId);
    const res = await fetch(`/api/trials/${t.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, trialTime: t.trialTime }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Assign failed");
      return;
    }
    setPicker(false);
    router.refresh();
  }

  async function backToRequests() {
    if (!confirm("Move this back to Enroll Requests? Any assigned teacher is removed.")) return;
    setError(null);
    setBusy("back");
    const res = await fetch(`/api/trials/${t.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not move it back");
      return;
    }
    router.refresh();
  }

  async function unassign() {
    if (!confirm("Remove the assigned teacher from this trial?")) return;
    setError(null);
    setBusy("unassign");
    const res = await fetch(`/api/trials/${t.id}/assign`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Remove failed");
      return;
    }
    router.refresh();
  }

  const message =
    `Assalamu Alaikum ${t.fullName},\n\n` +
    `Your FREE trial class for "${t.course}" is confirmed.\n\n` +
    `When: ${fmt(t.trialTime)} (PKT)\n` +
    (t.assignedTeacherName ? `Teacher: ${t.assignedTeacherName}\n` : "") +
    (t.meetingLink ? `Join link: ${t.meetingLink}\n` : "") +
    `\nPlease join 5 minutes early. JazakAllah Khair.`;

  function copyMsg() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waDigits = (t.whatsapp ?? "").replace(/[^\d]/g, "");
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${t.email}?subject=${encodeURIComponent(
    `Your free trial class — ${t.course}`
  )}&body=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar name={t.fullName} size={44} style="micah" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold truncate">{t.fullName}</p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isKid
                  ? "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isKid ? <Baby className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
              {isKid ? "Kids" : "Adult"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.email}</p>
        </div>
        <button
          type="button"
          onClick={backToRequests}
          disabled={busy === "back"}
          title="Move back to Enroll Requests"
          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
        >
          {busy === "back" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
          Back to requests
        </button>
      </div>

      {/* Trial details */}
      <div className="mt-4 space-y-2 text-[11px]">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-semibold">{t.course}</span>
          {!t.courseMatched && (
            <span className="text-destructive inline-flex items-center gap-0.5">
              <AlertCircle className="h-3 w-3" /> not in LMS
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground">{fmt(t.trialTime)}</span>
          <span className="text-muted-foreground">PKT</span>
        </div>
        {t.tutorGender && (
          <div className="text-muted-foreground">
            Wants <span className="font-semibold text-foreground">{t.tutorGender}</span> tutor
          </div>
        )}
        {t.whatsapp && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{t.whatsapp}</span>
          </div>
        )}
      </div>

      {/* Children */}
      {isKid && t.children.length > 0 && (
        <div className="mt-3 rounded-xl border border-border bg-background p-2.5 text-[11px]">
          {t.children.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 mr-3">
              <Baby className="h-3 w-3 text-[hsl(var(--gold))]" />
              {c.name}
              {c.age != null ? ` (${c.age})` : ""}
            </span>
          ))}
        </div>
      )}

      {/* Assigned teacher OR picker */}
      <div className="mt-3 rounded-xl border border-border bg-background p-3">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-[11px] text-destructive mb-2">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {t.assignedTeacherId && !picker ? (
          <div className="flex items-center gap-2 flex-wrap">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[12px] font-semibold">
              Assigned: <span className="text-foreground">{t.assignedTeacherName}</span>
            </span>
            <span className="ml-auto flex gap-2">
              <button
                onClick={() => setPicker(true)}
                className="text-[11px] font-semibold text-primary hover:text-accent"
              >
                Change
              </button>
              <button
                onClick={unassign}
                disabled={busy === "unassign"}
                className="text-[11px] font-semibold text-destructive hover:opacity-80 disabled:opacity-50"
              >
                {busy === "unassign" ? "..." : "Remove"}
              </button>
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {t.assignedTeacherId ? "Change teacher" : "Assign teacher"}
              </p>
              {picker && t.assignedTeacherId && (
                <button onClick={() => setPicker(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {t.teacherChoices.length === 0 ? (
              <p className="text-[11px] text-[hsl(var(--gold))]">
                ⚠ No teachers on this course. Assign teachers in the Courses tab first.
              </p>
            ) : (
              <div className="space-y-1.5">
                {t.teacherChoices.map((ch) => {
                  const isCurrent = ch.id === t.assignedTeacherId;
                  const wantMatch =
                    t.tutorGender && ch.gender
                      ? t.tutorGender.toUpperCase() === ch.gender
                      : null;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => assign(ch.id)}
                      disabled={busy === ch.id || isCurrent}
                      className={`w-full flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] text-left transition-all disabled:opacity-60 ${
                        isCurrent
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : ch.free
                          ? "border-border hover:border-primary/40 hover:bg-primary/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <span className="font-semibold">{ch.name}</span>
                      {ch.gender && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            ch.gender === "MALE"
                              ? "bg-sky-500/10 text-sky-600"
                              : "bg-pink-500/10 text-pink-600"
                          }`}
                        >
                          {ch.gender === "MALE" ? "♂" : "♀"}
                        </span>
                      )}
                      {ch.shift && (
                        <span className="text-muted-foreground">{ch.shift.toLowerCase()}</span>
                      )}
                      {wantMatch === false && (
                        <span className="text-[hsl(var(--gold))]">≠ tutor pref</span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1">
                        {ch.free ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Free
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-0.5 text-destructive font-bold"
                            title={ch.reason ?? "Conflict"}
                          >
                            <AlertCircle className="h-3 w-3" /> {ch.reason ?? "Conflict"}
                          </span>
                        )}
                        {busy === ch.id && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Meeting link */}
      {t.meetingLink && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
          <Video className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate flex-1">{t.meetingLink}</span>
          <a
            href={t.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-primary hover:text-accent shrink-0"
          >
            Open
          </a>
        </div>
      )}

      {/* Share actions */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {waDigits ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs font-bold text-white shadow-md"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        ) : (
          <span className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">
            No WA
          </span>
        )}
        <a
          href={mailHref}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted"
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
        <button
          onClick={copyMsg}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted"
        >
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {!t.isStudent &&
        (t.account ? <TrialLogin t={t} account={t.account} /> : <CreateTrialLogin t={t} />)}

      {t.isStudent ? (
        <Link
          href="/app/admin/students"
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Added as student
        </Link>
      ) : (
        <Link
          href={addStudentHref(t)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-2 text-xs font-bold text-primary-foreground shadow-md"
        >
          <UserPlus className="h-3.5 w-3.5" /> Add Student
        </Link>
      )}
    </div>
  );
}

// Trials sent before trial logins existed have none; this creates it (same call as "Free Trial")
function CreateTrialLogin({ t }: { t: TrialSession }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function create() {
    if (!t.trialTime) return;
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/trials/${t.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trialTime: t.trialTime }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not create the trial login");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-border bg-background p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground">No trial login yet</span>
        <button
          onClick={create}
          disabled={busy || !t.trialTime}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-2.5 py-1 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
          Create trial login
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function TrialLogin({
  t,
  account,
}: {
  t: TrialSession;
  account: NonNullable<TrialSession["account"]>;
}) {
  const router = useRouter();
  const [password, setPassword] = React.useState(account.loginPassword);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const locked = new Date(account.accessExpiresAt).getTime() <= Date.now();
  const suspended = !!account.suspendedAt;

  async function post(path: string, body: unknown, fallbackError: string) {
    setError(null);
    setBusy(true);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? fallbackError);
      return;
    }
    router.refresh();
  }

  const allow = () => post(`/api/trials/${t.id}/allow`, {}, "Could not allow access");

  function setSuspended(suspend: boolean) {
    if (
      suspend &&
      !confirm(`Suspend ${t.fullName}'s account? They will be signed out and can't log in until you reactivate it.`)
    )
      return;
    post(`/api/trials/${t.id}/suspend`, { suspend }, suspend ? "Could not suspend" : "Could not reactivate");
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2 flex-wrap">
        {suspended ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
            <Ban className="h-3 w-3" /> Suspended by admin
          </span>
        ) : locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
            <Lock className="h-3 w-3" /> Locked · trial ended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Trial login · until {fmt(account.accessExpiresAt)} PKT
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            title="View / share trial login"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--primary))] hover:underline"
          >
            <KeyRound className="h-3 w-3" /> Login
          </button>
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {suspended ? (
          <button
            onClick={() => setSuspended(false)}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-2.5 py-1 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
          >
            <ShieldCheck className="h-3 w-3" /> Reactivate account
          </button>
        ) : (
          <>
            {locked && (
              <button
                onClick={allow}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-2.5 py-1 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
              >
                <RotateCcw className="h-3 w-3" /> Allow 3 more days
              </button>
            )}
            <button
              onClick={() => setSuspended(true)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-2.5 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60"
            >
              <Ban className="h-3 w-3" /> Suspend account
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      {open && (
        <LoginCredentialsModal
          target={{
            id: account.id,
            name: t.fullName,
            email: t.email,
            phone: account.phone ?? t.whatsapp,
            password,
          }}
          onClose={() => setOpen(false)}
          onUpdated={setPassword}
        />
      )}
    </div>
  );
}
