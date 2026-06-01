import { SurahDetail } from "@/components/quran/surah-detail";

export const revalidate = 86400;

export default function StudentSurahPage({ params }: { params: { id: string } }) {
  return <SurahDetail basePath="/app/student/quran" surahId={params.id} />;
}
