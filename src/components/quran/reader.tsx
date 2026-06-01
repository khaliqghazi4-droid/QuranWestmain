import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Play, Search, Bookmark, Volume2, ArrowRight } from "lucide-react";
import { getSurahs, getRandomVerse } from "@/lib/quran-api";

// Shared list/reader. `basePath` controls where surah links navigate
// (e.g. /app/student/quran or /app/teacher/quran) so middleware doesn't
// reject the link with a role mismatch.
export async function QuranReader({ basePath }: { basePath: string }) {
  const [surahs, verseOfDay] = await Promise.all([getSurahs(), getRandomVerse()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quran Reader"
        description="Read, listen, and bookmark verses of the Holy Quran"
      />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-8 text-primary-foreground shadow-xl shadow-primary/20">
        <div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-xs text-primary-foreground/80 font-semibold uppercase tracking-wide">
            Verse of the Day
          </p>
          <p
            dir="rtl"
            className="mt-4 text-3xl sm:text-4xl leading-relaxed animate-fade-in"
            style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
          >
            {verseOfDay?.text_uthmani ?? "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ"}
          </p>
          <p
            className="mt-4 text-base text-primary-foreground/90 italic animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            &ldquo;
            {verseOfDay?.translations?.[0]?.text?.replace(/<[^>]*>/g, "") ??
              "And my success is not but through Allah."}
            &rdquo;
          </p>
          <p className="mt-2 text-xs text-primary-foreground/70">
            — Verse {verseOfDay?.verse_key ?? "11:88"}
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-5 py-2 text-sm font-semibold hover:bg-primary-foreground/25 transition-all">
            <Volume2 className="h-4 w-4" /> Listen
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold">Browse All Surahs</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {surahs.length > 0
                ? `${surahs.length} chapters · powered by Quran.com API`
                : "Loading from Quran.com..."}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search surah..."
              className="rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {surahs.map((s, i) => (
            <Link
              key={s.id}
              href={`${basePath}/${s.id}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:shadow-md transition-all stagger-item"
              style={{ animationDelay: `${Math.min(i * 20, 600)}ms` }}
            >
              <div className="relative grid h-12 w-12 place-items-center shrink-0">
                <svg
                  viewBox="0 0 48 48"
                  className="absolute inset-0 text-primary group-hover:rotate-12 transition-transform duration-500"
                >
                  <path
                    d="M24 4 L30 14 L42 16 L33 26 L35 38 L24 32 L13 38 L15 26 L6 16 L18 14 Z"
                    fill="currentColor"
                    fillOpacity="0.1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="relative text-sm font-bold text-primary">{s.id}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold group-hover:text-primary transition-colors truncate">
                    {s.name_simple}
                  </p>
                  <p
                    dir="rtl"
                    className="text-lg text-primary shrink-0"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {s.name_arabic}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                  <span className="truncate">
                    {s.verses_count} verses ·{" "}
                    {s.revelation_place === "makkah" ? "Meccan" : "Medinan"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Bookmark className="h-3 w-3" />
                    <Play className="h-3 w-3" />
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>

        {surahs.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Unable to load surahs. Please check your internet connection.
          </div>
        )}
      </div>
    </div>
  );
}
