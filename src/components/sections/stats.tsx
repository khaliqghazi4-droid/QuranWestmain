import { Users, GraduationCap, Globe2, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "5,000+", label: "Active Students" },
  { icon: GraduationCap, value: "120+", label: "Certified Qaris" },
  { icon: Globe2, value: "40+", label: "Countries Served" },
  { icon: Award, value: "98%", label: "Satisfaction Rate" },
];

export function Stats() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-muted/50 p-8 sm:p-12 shadow-xl">
          <div
            className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.10)] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center group">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-transform group-hover:scale-110">
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gradient-primary">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
