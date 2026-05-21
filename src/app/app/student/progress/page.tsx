import { PageHeader } from "@/components/dashboard/page-header";
import { Trophy, BookMarked, TrendingUp, Award, Target, Flame } from "lucide-react";

const milestones = [
  { surah: "Al-Fatiha", status: "complete", date: "Dec 5, 2025" },
  { surah: "Al-Baqarah (Part)", status: "complete", date: "Dec 18, 2025" },
  { surah: "An-Naas", status: "complete", date: "Dec 22, 2025" },
  { surah: "Al-Falaq", status: "complete", date: "Dec 24, 2025" },
  { surah: "Al-Ikhlas", status: "complete", date: "Dec 28, 2025" },
  { surah: "Al-Masad", status: "complete", date: "Jan 2, 2026" },
  { surah: "An-Nasr", status: "complete", date: "Jan 5, 2026" },
  { surah: "Al-Kafirun", status: "complete", date: "Jan 7, 2026" },
  { surah: "Al-Kawthar", status: "complete", date: "Jan 9, 2026" },
  { surah: "Al-Maun", status: "complete", date: "Jan 11, 2026" },
  { surah: "Quraysh", status: "complete", date: "Jan 12, 2026" },
  { surah: "Al-Fil", status: "complete", date: "Jan 13, 2026" },
  { surah: "Al-Humazah", status: "in-progress", date: "—" },
];

const badges = [
  { name: "First Lesson", icon: "🎓", earned: true },
  { name: "Week Warrior", icon: "🔥", earned: true },
  { name: "Hifz Beginner", icon: "📖", earned: true },
  { name: "Consistent Learner", icon: "⭐", earned: true },
  { name: "Tajweed Pro", icon: "🏆", earned: false },
  { name: "Surah Master", icon: "👑", earned: false },
];

export default function StudentProgress() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Progress"
        description="Track your Quran learning journey and achievements"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: "Surahs Memorized", value: "12", trend: "+2 this week" },
          { icon: BookMarked, label: "Lessons Completed", value: "47", trend: "Avg 5/week" },
          { icon: Flame, label: "Current Streak", value: "23", trend: "Days in a row" },
          { icon: Target, label: "Goal Progress", value: "78%", trend: "On track" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-[11px] text-primary mt-2 font-medium">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Hifz Journey</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Surahs memorized so far
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-primary">12 Surahs</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-2">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  m.status === "complete"
                    ? "border-primary/30 bg-primary/5"
                    : "border-dashed border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.05)]"
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full font-bold text-xs shrink-0 ${
                    m.status === "complete"
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                      : "bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)]"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{m.surah}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {m.status === "complete" ? `Memorized · ${m.date}` : "In Progress"}
                  </p>
                </div>
                {m.status === "complete" && (
                  <Trophy className="h-4 w-4 text-[hsl(var(--gold))] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-amber-500 text-[hsl(220_32%_10%)]">
                <Award className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold">Badges</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div
                  key={b.name}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
                    b.earned
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <p className="text-[10px] font-semibold leading-tight">{b.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Goal</p>
                <h3 className="text-sm font-bold">Memorize 4 more Surahs</h3>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[50%] rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">2 of 4</span> completed · 15 days left
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
