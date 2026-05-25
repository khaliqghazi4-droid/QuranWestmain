"use client";

import * as React from "react";
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
} from "lucide-react";
import { Avatar } from "@/components/avatar";

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
  teacherName: string | null;
  teacherGender: "MALE" | "FEMALE" | null;
  meetingLink: string | null;
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
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "past">("upcoming");

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
      (filter === "past" && ts < now);
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
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            Free trial requests submitted on the academy website appear here with the course&apos;s
            teacher and a class link to share.
          </p>
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
  const [copied, setCopied] = React.useState(false);
  const isKid = t.courseFor === "kid";

  const message =
    `Assalamu Alaikum ${t.fullName},\n\n` +
    `Your FREE trial class for "${t.course}" is confirmed.\n\n` +
    `When: ${fmt(t.trialTime)} (PKT)\n` +
    (t.teacherName ? `Teacher: ${t.teacherName}\n` : "") +
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

  const genderMatch =
    t.tutorGender && t.teacherGender
      ? t.tutorGender.toUpperCase() === t.teacherGender
      : null;

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
        <div className="flex items-center gap-2 flex-wrap">
          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {t.teacherName ? (
            <>
              <span>
                Teacher: <span className="font-semibold text-foreground">{t.teacherName}</span>
              </span>
              {t.tutorGender && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    genderMatch === false
                      ? "bg-destructive/10 text-destructive"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                  title={`Requested ${t.tutorGender} tutor`}
                >
                  wants {t.tutorGender} {genderMatch === false ? "⚠" : "✓"}
                </span>
              )}
            </>
          ) : (
            <span className="text-[hsl(var(--gold))] inline-flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> No teacher assigned to this course
            </span>
          )}
        </div>
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
    </div>
  );
}
