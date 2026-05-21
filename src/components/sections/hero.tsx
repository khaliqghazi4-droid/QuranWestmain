"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Star, Users, BookOpen, Sparkles } from "lucide-react";
import { IslamicPattern } from "@/components/islamic-pattern";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28"
    >
      <IslamicPattern className="text-primary" />

      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[hsl(var(--gold)/0.20)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by 5,000+ Students Worldwide
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Learn the <span className="text-gradient-primary">Holy Quran</span>{" "}
              from Certified Scholars
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              One-on-one live classes for Nazra, Tajweed, Hifz, and Tafseer —
              taught by qualified Qaris from the comfort of your home. Free trial,
              flexible timings, and personalized progress tracking.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:bg-card transition-all"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Login to Dashboard
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-accent/60"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-semibold text-foreground">4.9/5</span>{" "}
                    from 1,200+ reviews
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="relative aspect-[4/5] max-w-md mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-accent blur-2xl opacity-30 scale-95" />
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                  alt="Open Holy Quran"
                  fill
                  priority
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              <div
                className="absolute -left-6 top-12 glass-card rounded-2xl p-4 shadow-xl animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Students</p>
                    <p className="text-lg font-bold">5,000+</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -right-6 bottom-16 glass-card rounded-2xl p-4 shadow-xl animate-fade-in"
                style={{ animationDelay: "550ms" }}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Live Classes</p>
                    <p className="text-lg font-bold">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
