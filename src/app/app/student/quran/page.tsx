import { QuranReader } from "@/components/quran/reader";

export const revalidate = 3600;

export default function StudentQuranPage() {
  return <QuranReader basePath="/app/student/quran" />;
}
