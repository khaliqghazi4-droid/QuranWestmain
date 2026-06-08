import { QuranReader } from "@/components/quran/reader";
import { QuranTabs } from "@/components/quran/quran-tabs";

export const revalidate = 3600;

export default function TeacherQuranPage() {
  return (
    <QuranTabs quranReader={<QuranReader basePath="/app/teacher/quran" />} />
  );
}
