import { SurahDetail } from "@/components/quran/surah-detail";

export const revalidate = 86400;

export default function TeacherSurahPage({ params }: { params: { id: string } }) {
  return <SurahDetail basePath="/app/teacher/quran" surahId={params.id} />;
}
