import { QuranReader } from "@/components/quran/reader";
import { QuranTabs } from "@/components/quran/quran-tabs";

export const revalidate = 3600;

export default function StudentQuranPage() {
  return (
    <QuranTabs quranReader={<QuranReader basePath="/app/student/quran" />} />
  );
}
