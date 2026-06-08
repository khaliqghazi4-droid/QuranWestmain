"use client";

import * as React from "react";
import {
  BookMarked,
  BookOpen,
  GraduationCap,
  FileText,
  Sparkles,
  ExternalLink,
  Maximize2,
} from "lucide-react";

type TabKey = "quran" | "fullquran" | "qaida" | "other";

const TABS: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "quran", label: "Surah Reader", icon: BookMarked },
  { key: "fullquran", label: "Full Quran (PDF)", icon: BookOpen },
  { key: "qaida", label: "Norani Qaida", icon: BookOpen },
  { key: "other", label: "Other Studies", icon: GraduationCap },
];

// Shared tab shell for the student + teacher Quran pages. The Quran Reader
// itself is heavy (loads 114 surahs server-side) so we render it once and
// just hide it when another tab is active — keeps scroll position + cache.
export function QuranTabs({ quranReader }: { quranReader: React.ReactNode }) {
  const [active, setActive] = React.useState<TabKey>("quran");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-1.5 inline-flex gap-1 flex-wrap">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Quran Reader stays mounted (just hidden) so the surah list + cache
          survive a tab switch. The PDF tabs are cheap iframes. */}
      <div className={active === "quran" ? "" : "hidden"}>{quranReader}</div>
      {active === "fullquran" && <FullQuranPdf />}
      {active === "qaida" && <NoraniQaidaPlaceholder />}
      {active === "other" && <OtherStudiesPlaceholder />}
    </div>
  );
}

// Full Mushaf PDF from archive.org — for students who want to read the
// whole Quran like a physical book (page-by-page navigation, zoom, etc.)
// instead of the verse-by-verse Surah Reader.
const FULL_QURAN_EMBED = "https://archive.org/embed/QuranArabic";
const FULL_QURAN_PAGE = "https://archive.org/details/QuranArabic";
const FULL_QURAN_PDF =
  "https://archive.org/download/QuranArabic/quran.pdf";

function FullQuranPdf() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white shadow-xl">
        <div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs text-white/80 font-semibold uppercase tracking-wide">
            Full Quran (PDF)
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            Read the complete Mushaf — page by page
          </h2>
          <p className="mt-3 text-sm text-white/90 max-w-2xl leading-relaxed">
            The full Quran in the traditional Mushaf layout. Use the Surah
            Reader tab for verse-by-verse audio + translations.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={FULL_QURAN_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/25 transition-all"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Open Fullscreen
            </a>
            <a
              href={FULL_QURAN_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/25 transition-all"
            >
              <FileText className="h-3.5 w-3.5" /> Download PDF
            </a>
            <a
              href={FULL_QURAN_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/25 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View on Archive.org
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold">Full Quran — Mushaf edition</p>
          <a
            href={FULL_QURAN_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[11px] text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            Open in new tab <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <iframe
          src={FULL_QURAN_EMBED}
          title="Full Quran"
          allow="fullscreen"
          loading="lazy"
          className="w-full bg-background"
          style={{ height: "80vh", minHeight: 600, border: 0 }}
        />
      </div>
    </div>
  );
}

// Default Norani Qaida edition embedded inline. Archive.org's `/embed/`
// endpoint reliably serves an in-page PDF viewer with page-by-page
// navigation, so a student can read the whole qa'idah without leaving
// the app. The download / open-in-new-tab buttons are provided so
// teachers can hand the source PDF to students for offline study.
const NORANI_QAIDA_EMBED = "https://archive.org/embed/noorani-qaida";
const NORANI_QAIDA_PAGE = "https://archive.org/details/noorani-qaida";
const NORANI_QAIDA_PDF =
  "https://archive.org/download/noorani-qaida/Noorani%20Qaida.pdf";

function NoraniQaidaPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-8 text-primary-foreground shadow-xl shadow-primary/20">
        <div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs text-primary-foreground/80 font-semibold uppercase tracking-wide">
            Norani Qaida
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            The first step to reading the Holy Quran
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/90 max-w-2xl leading-relaxed">
            Norani Qaida teaches the Arabic alphabet, harakat, madd, and tajweed
            basics — the classical primer every Quran learner starts with.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={NORANI_QAIDA_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-4 py-2 text-xs font-bold hover:bg-primary-foreground/25 transition-all"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Open Fullscreen
            </a>
            <a
              href={NORANI_QAIDA_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-4 py-2 text-xs font-bold hover:bg-primary-foreground/25 transition-all"
            >
              <FileText className="h-3.5 w-3.5" /> Download PDF
            </a>
            <a
              href={NORANI_QAIDA_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-4 py-2 text-xs font-bold hover:bg-primary-foreground/25 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View on Archive.org
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold">Norani Qaida — full edition</p>
          <a
            href={NORANI_QAIDA_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[11px] text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            Open in new tab <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <iframe
          src={NORANI_QAIDA_EMBED}
          title="Norani Qaida"
          allow="fullscreen"
          loading="lazy"
          className="w-full bg-background"
          style={{ height: "75vh", minHeight: 600, border: 0 }}
        />
      </div>
    </div>
  );
}

function OtherStudiesPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--gold))] to-amber-500 p-8 text-white shadow-xl">
        <div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs text-white/80 font-semibold uppercase tracking-wide">
            Other Studies
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            Islamic books &amp; supplementary reading
          </h2>
          <p className="mt-3 text-sm text-white/90 max-w-2xl leading-relaxed">
            Tajweed, Aqeedah, Hadith, Seerah, Duas — a growing library of books
            the academy will publish for students to read alongside their Quran
            lessons.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold">Upcoming</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          The academy will add books and reading material here as they become
          available. You&apos;ll see new entries on this page automatically.
        </p>
        <p className="mt-4 text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <FileText className="h-3 w-3" /> No books yet
        </p>
      </div>
    </div>
  );
}
