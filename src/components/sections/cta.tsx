import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { IslamicPattern } from "@/components/islamic-pattern";

const perks = [
  "3 days free trial — no card required",
  "Cancel anytime, no hidden fees",
  "Money-back guarantee within 30 days",
];

export function CTA() {
  return (
    <section id="enroll" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-accent to-primary p-10 sm:p-16 shadow-2xl shadow-primary/30">
          <IslamicPattern className="text-primary-foreground" />

          <div
            className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[hsl(var(--gold)/0.30)] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground">
                Begin Your Journey with the{" "}
                <span className="text-[hsl(var(--gold))]">Holy Quran</span>{" "}
                Today
              </h2>
              <p className="mt-4 text-base text-primary-foreground/80 max-w-xl">
                Join thousands of students worldwide who have transformed their
                relationship with the Quran. Your first class is on us.
              </p>

              <ul className="mt-6 space-y-2">
                {perks.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-3 text-sm text-primary-foreground/90"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--gold))] px-8 py-4 text-base font-bold text-[hsl(220_32%_10%)] shadow-lg transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-md px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition-all"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
