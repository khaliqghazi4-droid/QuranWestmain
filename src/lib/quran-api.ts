const BASE = "https://api.quran.com/api/v4";

export type Surah = {
  id: number;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  pages: [number, number];
  translated_name: { language_name: string; name: string };
};

export type Verse = {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  text_indopak?: string;
  translations?: { id: number; resource_id: number; text: string }[];
  audio?: { url: string };
};

export type RandomVerse = {
  verse_key: string;
  text_uthmani: string;
  translations: { text: string }[];
  chapter_id: number;
};

export async function getSurahs(): Promise<Surah[]> {
  try {
    const res = await fetch(`${BASE}/chapters?language=en`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.chapters as Surah[];
  } catch {
    return [];
  }
}

export async function getSurah(id: number): Promise<Surah | null> {
  try {
    const res = await fetch(`${BASE}/chapters/${id}?language=en`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.chapter as Surah;
  } catch {
    return null;
  }
}

export async function getVersesByChapter(
  id: number,
  page = 1,
  perPage = 50
): Promise<{ verses: Verse[]; pagination: { total_pages: number; current_page: number; total_records: number } } | null> {
  try {
    const res = await fetch(
      `${BASE}/verses/by_chapter/${id}?language=en&translations=131&fields=text_uthmani&per_page=${perPage}&page=${page}&audio=7`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { verses: data.verses as Verse[], pagination: data.pagination };
  } catch {
    return null;
  }
}

// Full chapter recitation by a reciter (id 7 = Mishary Rashid Alafasy)
export async function getChapterAudio(
  chapterId: number,
  recitationId = 7
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/chapter_recitations/${recitationId}/${chapterId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.audio_file?.audio_url ?? null;
  } catch {
    return null;
  }
}

// Quran.com returns verse audio paths like "Alafasy/mp3/001001.mp3"; the
// CDN base needs to be prepended for the browser to play them.
export function verseAudioUrl(rawUrl: string | undefined | null): string | null {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("http")) return rawUrl;
  return `https://verses.quran.com/${rawUrl.replace(/^\/+/, "")}`;
}

export async function getRandomVerse(): Promise<RandomVerse | null> {
  try {
    const res = await fetch(
      `${BASE}/verses/random?language=en&translations=131&fields=text_uthmani`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.verse as RandomVerse;
  } catch {
    return null;
  }
}
