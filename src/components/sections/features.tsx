import {
  Video,
  Calendar,
  Users2,
  ShieldCheck,
  LineChart,
  Globe2,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live 1-on-1 Classes",
    description:
      "Personalized live video sessions with certified Qaris using Zoom integration for focused learning.",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description:
      "Choose class timings that fit your routine. Reschedule easily with full timezone support.",
  },
  {
    icon: Users2,
    title: "Parent Dashboard",
    description:
      "Parents can monitor attendance, progress, and communicate directly with the admin team.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "Detailed Sabaq, Sabqi, and Manzil tracking with weekly performance reports.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Qaris",
    description:
      "Every teacher is rigorously vetted, certified, and trained in modern teaching methodology.",
  },
  {
    icon: Globe2,
    title: "Multi-Timezone",
    description:
      "Serving students across USA, UK, Canada, Australia, UAE, and more — anytime, anywhere.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            Why Choose Us
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-gradient-primary">Master the Quran</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete learning experience designed for students of every age and
            level — backed by modern technology and timeless Islamic teaching
            traditions.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              style={{
                animation: "fade-in 0.6s ease-out forwards",
                animationDelay: `${i * 80}ms`,
                opacity: 0,
              }}
            >
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <f.icon className="h-6 w-6" />
              </div>

              <h3 className="relative mt-5 text-lg font-bold tracking-tight">
                {f.title}
              </h3>
              <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
