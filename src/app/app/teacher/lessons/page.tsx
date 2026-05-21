import { PageHeader } from "@/components/dashboard/page-header";
import { FileText, Plus, Edit2, Copy, MoreVertical, BookOpen } from "lucide-react";

const lessons = [
  { title: "Introduction to Tajweed", course: "Tajweed Mastery", students: 12, duration: "45m", status: "published" },
  { title: "Madd Rules - Detailed Practice", course: "Tajweed Mastery", students: 12, duration: "60m", status: "published" },
  { title: "Surah Al-Mulk Recitation", course: "Hifz-ul-Quran", students: 8, duration: "45m", status: "published" },
  { title: "Noorani Qaida - Lesson 5", course: "Noorani Qaida", students: 4, duration: "30m", status: "draft" },
  { title: "Tafseer Surah Al-Baqarah (1-10)", course: "Tafseer", students: 6, duration: "60m", status: "published" },
];

export default function TeacherLessons() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Plans"
        description="Create and manage your teaching materials"
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md">
            <Plus className="h-4 w-4" /> New Lesson
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((l) => (
          <div key={l.title} className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                l.status === "published"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-[hsl(var(--gold)/0.10)] text-[hsl(var(--gold))]"
              }`}>
                {l.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
              {l.title}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {l.course}
            </p>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">
                {l.students} students · {l.duration}
              </div>
              <div className="flex items-center gap-1">
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
