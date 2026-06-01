"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Mail,
  MessageCircle,
  Baby,
  User,
  Inbox,
  UserPlus,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { WebsiteEnrollment } from "@/lib/enroll-source";

function addStudentHref(e: WebsiteEnrollment) {
  const params = new URLSearchParams({
    addName: e.fullName,
    addEmail: e.email,
    addPhone: e.whatsapp,
    addCountry: e.country,
    addCourse: e.course,
  });
  return `/app/admin/students?${params.toString()}`;
}

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

const COLUMNS = [
  "Applicant",
  "For",
  "Course",
  "Tutor",
  "Contact",
  "Location",
  "Trial Time",
  "Submitted",
  "Actions",
];

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

      {/* Table — columns always visible */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {COLUMNS.map((c) => (
                  <th
                    key={c}
                    className={`px-4 py-3 font-semibold whitespace-nowrap ${
                      c === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                    <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-semibold">
                      {enrollments.length === 0
                        ? "No enrollment requests yet"
                        : "No requests match your filter"}
                    </p>
                    {enrollments.length === 0 && (
                      <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                        When someone submits the &quot;Enroll Now&quot; form on the academy website,
                        their request appears here automatically.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => <EnrollmentRow key={e.id} e={e} />)
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-border p-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {enrollments.length} request
            {enrollments.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
}

function EnrollmentRow({ e }: { e: WebsiteEnrollment }) {
  const isKid = e.courseFor === "kid";

  return (
    <tr className="hover:bg-muted/20 transition-colors align-top">
      {/* Applicant */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={e.fullName} size={34} style="micah" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{e.fullName || "—"}</p>
            {isKid && e.children.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {e.children
                  .map((c) => `${c.name}${c.age != null ? ` (${c.age})` : ""}`)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* For */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isKid
              ? "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isKid ? <Baby className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
          {isKid ? `Kids · ${e.children.length}` : "Adult"}
        </span>
      </td>

      {/* Course */}
      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{e.course || "—"}</td>

      {/* Tutor */}
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {e.tutorGender ? (e.tutorGender === "male" ? "Male" : "Female") : "—"}
        {!isKid && e.gender ? ` · ${e.gender === "male" ? "M" : "F"}` : ""}
      </td>

      {/* Contact */}
      <td className="px-4 py-3 text-xs">
        <p className="truncate max-w-[180px]">{e.email || "—"}</p>
        <p className="text-muted-foreground">{e.whatsapp || "—"}</p>
      </td>

      {/* Location */}
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {[e.city, e.country].filter(Boolean).join(", ") || "—"}
      </td>

      {/* Trial Time */}
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {fmtDate(e.trialTime, true)}
      </td>

      {/* Submitted */}
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {fmtDate(e.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {e.whatsapp && (
            <a
              href={waLink(e.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={`mailto:${e.email}`}
            title="Email"
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
          <Link
            href={addStudentHref(e)}
            title="Add as student"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm whitespace-nowrap"
          >
            <UserPlus className="h-3 w-3" /> Add
          </Link>
        </div>
      </td>
    </tr>
  );
}
