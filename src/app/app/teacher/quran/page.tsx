import { QuranReader } from "@/components/quran/reader";

export const revalidate = 3600;

export default function TeacherQuranPage() {
  return <QuranReader basePath="/app/teacher/quran" />;
}
