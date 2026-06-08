"use client";

import * as React from "react";
import {
  BookMarked,
  BookOpen,
  GraduationCap,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

type TabKey = "quran" | "qaida" | "other";

const TABS: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "quran", label: "Quran Reader", icon: BookMarked },
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
          survive a tab switch. The other two are cheap placeholders. */}
      <div className={active === "quran" ? "" : "hidden"}>{quranReader}</div>
      {active === "qaida" && <NoraniQaidaPlaceholder />}
      {active === "other" && <OtherStudiesPlaceholder />}
    </div>
  );
}

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
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Clock className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold">Coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          The full Norani Qaida — page-by-page, with audio for every lesson —
          will be added here shortly. Check back soon.
        </p>
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
