"use client";

import { motion } from "framer-motion";
import TeachMap from "@/components/about/teach-map";
import SectionCta from "@/components/noor/SectionCta";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, SectionHeading, Words } from "@/components/lux/effects";

// The About page's "Who We Teach" map, with a way through to that page
export default function WhoWeTeach() {
  return (
    <section className="relative isolate flex flex-col justify-center overflow-hidden bg-[#0B1A37] py-[clamp(2rem,5vh,4rem)] lg:min-h-[calc(100svh-68px)] lg:snap-start">
      {/* Soft gold glow behind the heading */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.08),transparent_65%)]"
      />
      <div className="mx-auto w-full max-w-7xl px-[1rem] sm:px-[1.5rem] lg:px-[2rem]">
        {/* No width limit: on laptops the heading takes one line, leaving the map more room */}
        <div className="text-center">
          <Eyebrow tone="dark">Who we teach</Eyebrow>
          <SectionHeading tone="dark" className="mt-[1rem]">
            <Words text="Online Quran Classes for" />
            <Accent text="Families Across the West" tone="dark" delay={0.2} />
          </SectionHeading>
        </div>

        {/* Always full size: the info boxes beside the points are sized for a
            map this wide, and on a narrower one they run into each other. The
            gap above leaves room for the Canada box, which sits above the map. */}
        <div className="mx-auto mt-[clamp(1.75rem,4.5vh,2.75rem)] max-w-[980px]">
          <TeachMap />
        </div>

        <motion.div className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex justify-center" {...reveal(0.2)}>
          <SectionCta href="/about" tone="dark">
            More about us
          </SectionCta>
        </motion.div>
      </div>
    </section>
  );
}
