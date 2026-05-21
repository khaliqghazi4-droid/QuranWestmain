import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, BarChart3 } from "lucide-react";

const courses = [
  {
    title: "Noorani Qaida",
    level: "Beginner",
    duration: "2 - 3 Months",
    description:
      "Foundation course for kids and beginners to learn the Arabic alphabet, vowel marks, and basic recitation rules.",
    image:
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=800&auto=format&fit=crop",
    tag: "Most Popular",
  },
  {
    title: "Tajweed Mastery",
    level: "Intermediate",
    duration: "6 - 8 Months",
    description:
      "Perfect your pronunciation and mastery over the rules of Tajweed with audio examples and live correction.",
    image:
      "https://images.unsplash.com/photo-1763965367087-589990c8f1a3?fm=jpg&q=80&w=800&auto=format&fit=crop",
    tag: "Recommended",
  },
  {
    title: "Hifz-ul-Quran",
    level: "Advanced",
    duration: "3 - 5 Years",
    description:
      "Structured memorization program with daily Sabaq, Sabqi, and Manzil review under expert Hafiz teachers.",
    image:
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=800&auto=format&fit=crop",
    tag: "Premium",
  },
];

export function Courses() {
  return (
    <section id="courses" className="relative py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              Our Courses
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Choose Your <span className="text-gradient-primary">Learning Path</span>
            </h2>
          </div>
          <Link
            href="#all-courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors group"
          >
            View All Courses
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-[hsl(var(--gold))] px-3 py-1 text-[11px] font-bold text-[hsl(220_32%_10%)] shadow-md">
                  {c.tag}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" /> {c.level}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {c.duration}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {c.description}
                </p>
                <Link
                  href={`#course-${c.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors group/link"
                >
                  Enroll Now
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
