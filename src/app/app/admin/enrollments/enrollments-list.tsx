"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Mail,
  MessageCircle,
  MapPin,
  CalendarClock,
  BookOpen,
  User,
  Baby,
  Users,
  Inbox,
  GraduationCap,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { WebsiteEnrollment } from "@/lib/enroll-source";

function waLink(num: string) {
  const digits = num.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function fmtDate(iso: string | null, withTime = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  });
}

export function EnrollmentsList({ enrollments }: { enrollments: WebsiteEnrollment[] }) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "adult" | "kid">("all");

  const filtered = enrollments.filter((e) => {
    const q = query.toLowerCase();
    const matchesQuery =
      e.fullName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.course.toLowerCase().includes(q) ||
      e.country.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q);
    const matchesFilter = filter === "all" || e.courseFor === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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
            <option value="all">All requests ({enrollments.length})</option>
            <option value="adult">
              Adults ({enrollments.filter((e) => e.courseFor === "adult").length})
            </option>
            <option value="kid">
              Kids ({enrollments.filter((e) => e.courseFor === "kid").length})
            </option>
          </select>
        </div>
        <div className="flex-1" />
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, course, country..."
            className="w-full sm:w-72 rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm font-semibold">No enrollment requests yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            When someone submits the &quot;Enroll Now&quot; form on the academy website, their
            request will appear here automatically with all their details.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">No requests match your filter</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((e) => (
            <EnrollmentCard key={e.id} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function EnrollmentCard({ e }: { e: WebsiteEnrollment }) {
  const isKid = e.courseFor === "kid";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar name={e.fullName} size={44} style="micah" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold truncate">{e.fullName}</p>
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
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Submitted {fmtDate(e.createdAt, true)}
          </p>
        </div>
      </div>

      {/* Course + preferences */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
          <BookOpen className="h-3 w-3" /> {e.course}
        </span>
        {e.tutorGender && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium">
            <GraduationCap className="h-3 w-3" /> {e.tutorGender === "male" ? "Male" : "Female"} tutor
          </span>
        )}
        {!isKid && e.gender && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium">
            <User className="h-3 w-3" /> {e.gender === "male" ? "Male" : "Female"}
          </span>
        )}
      </div>

      {/* Contact + location + trial */}
      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 truncate">
          <Mail className="h-3 w-3 shrink-0" /> {e.email || "—"}
        </span>
        <span className="inline-flex items-center gap-1.5 truncate">
          <MapPin className="h-3 w-3 shrink-0" /> {[e.city, e.country].filter(Boolean).join(", ") || "—"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3 w-3 shrink-0" /> Trial: {fmtDate(e.trialTime, true)}
        </span>
        <span className="inline-flex items-center gap-1.5 truncate">
          <MessageCircle className="h-3 w-3 shrink-0" /> {e.whatsapp || "—"}
        </span>
      </div>

      {/* Children (kids) */}
      {isKid && e.children.length > 0 && (
        <div className="mt-3 rounded-xl border border-border bg-background p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1 mb-2">
            <Users className="h-3 w-3" /> {e.children.length} child
            {e.children.length === 1 ? "" : "ren"}
          </p>
          <div className="space-y-1.5">
            {e.children.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <Baby className="h-3 w-3 text-[hsl(var(--gold))] shrink-0" />
                <span className="font-semibold">{c.name || "—"}</span>
                {c.age != null && <span className="text-muted-foreground">· {c.age} yrs</span>}
                {c.gender && (
                  <span className="text-muted-foreground">· {c.gender === "male" ? "Boy" : "Girl"}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {e.whatsapp ? (
          <a
            href={waLink(e.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs font-bold text-white shadow-md"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        ) : (
          <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">
            No WhatsApp
          </span>
        )}
        <a
          href={`mailto:${e.email}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
      </div>
    </div>
  );
}
