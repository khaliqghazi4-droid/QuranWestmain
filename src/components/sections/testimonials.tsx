import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ayesha Khan",
    role: "Parent, UK",
    text: "My son has been learning Hifz for 8 months now and his progress is remarkable. The teachers are patient, qualified, and incredibly kind. Highly recommended!",
  },
  {
    name: "Muhammad Ali",
    role: "Student, USA",
    text: "The Tajweed course completely transformed my recitation. The 1-on-1 attention and structured curriculum makes a huge difference compared to other academies.",
  },
  {
    name: "Fatima Hassan",
    role: "Parent, UAE",
    text: "What I love most is the parent dashboard — I can track my daughter's attendance and progress without disturbing her classes. Excellent system.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            Testimonials
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Loved by{" "}
            <span className="text-gradient-primary">Students & Parents</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="group relative rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              style={{
                animation: "fade-in 0.6s ease-out forwards",
                animationDelay: `${i * 120}ms`,
                opacity: 0,
              }}
            >
              <Quote
                className="absolute top-5 right-5 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors"
                aria-hidden="true"
              />

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-foreground/90">
                {t.text}
              </p>

              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
