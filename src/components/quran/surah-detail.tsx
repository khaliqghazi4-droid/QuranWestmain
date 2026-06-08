import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Bookmark, Share2 } from "lucide-react";
import {
  getSurah,
  getAllVersesByChapter,
  getChapterAudio,
  verseAudioUrl,
} from "@/lib/quran-api";
import { AudioPlayer } from "@/components/quran/audio-player";

export async function SurahDetail({
  basePath,
  surahId,
}: {
  basePath: string;
  surahId: string;
}) {
  const id = parseInt(surahId, 10);
  if (isNaN(id) || id < 1 || id > 114) notFound();

  // Fetch the surah meta, *all* of its verses, and the chapter recitation
  // audio in parallel. getAllVersesByChapter handles the multi-page round
  // trips needed for long surahs (e.g. Al-Baqarah's 286 verses).
  const [surah, verses, chapterAudio] = await Promise.all([
    getSurah(id),
    getAllVersesByChapter(id),
    getChapterAudio(id),
  ]);

  if (!surah) notFound();

  const prevId = id > 1 ? id - 1 : null;
  const nextId = id < 114 ? id + 1 : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all Surahs
        </Link>
        <SurahPager basePath={basePath} prevId={prevId} nextId={nextId} />
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-8 text-primary-foreground shadow-xl shadow-primary/20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.3)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-3 py-1 text-[11px] font-semibold">
                Chapter {surah.id} · {surah.verses_count} verses
              </div>
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
                {surah.name_simple}
              </h1>
              <p className="text-base text-primary-foreground/80 mt-1">
                {surah.translated_name.name} ·{" "}
                {surah.revelation_place === "makkah"
                  ? "Revealed in Makkah"
                  : "Revealed in Madinah"}
              </p>
            </div>
            <p
              dir="rtl"
              className="text-5xl sm:text-6xl text-[hsl(var(--gold))]"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {surah.name_arabic}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {chapterAudio ? (
              <AudioPlayer src={chapterAudio} label="Play Audio" variant="primary" />
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-5 py-2 text-sm font-semibold text-primary-foreground/70">
                Audio unavailable
              </span>
            )}
            <button className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-5 py-2 text-sm font-semibold hover:bg-primary-foreground/25 transition-all">
              <Bookmark className="h-4 w-4" /> Bookmark
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 px-5 py-2 text-sm font-semibold hover:bg-primary-foreground/25 transition-all">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {surah.bismillah_pre && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p
            dir="rtl"
            className="text-3xl text-primary"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </div>
      )}

      <div className="space-y-4">
        {verses.map((v, i) => (
          <div
            key={v.id}
            className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all stagger-item"
            style={{ animationDelay: `${Math.min(i * 15, 600)}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xs shadow-md shrink-0">
                {v.verse_number}
              </div>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {(() => {
                  const vAudio = verseAudioUrl(v.audio?.url);
                  return vAudio ? <AudioPlayer src={vAudio} variant="ghost" /> : null;
                })()}
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <p
              dir="rtl"
              className="text-2xl sm:text-3xl leading-loose text-foreground"
              style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
            >
              {v.text_uthmani}
            </p>

            {v.translations?.[0]?.text && (
              <p
                className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4"
                dangerouslySetInnerHTML={{ __html: v.translations[0].text }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bottom nav so the reader can flow into the next surah without
          scrolling all the way back to the top. */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          End of {surah.name_simple} · {verses.length} of {surah.verses_count}{" "}
          verses
        </p>
        <SurahPager basePath={basePath} prevId={prevId} nextId={nextId} />
      </div>
    </div>
  );
}

function SurahPager({
  basePath,
  prevId,
  nextId,
}: {
  basePath: string;
  prevId: number | null;
  nextId: number | null;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      {prevId ? (
        <Link
          href={`${basePath}/${prevId}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/40 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Previous Surah
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground/50">
          <ArrowLeft className="h-3.5 w-3.5" /> Previous
        </span>
      )}
      {nextId ? (
        <Link
          href={`${basePath}/${nextId}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all"
        >
          Next Surah <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground/50">
          Next <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}
