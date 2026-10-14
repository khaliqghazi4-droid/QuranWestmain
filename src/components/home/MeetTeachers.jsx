"use client";

import { motion } from "framer-motion";
import { TeacherCard, teacherCards } from "@/components/about/teacher-card";
import ScrollIn from "@/components/noor/ScrollIn";
import SectionCta from "@/components/noor/SectionCta";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, SectionHeading, Words } from "@/components/lux/effects";
import { withHighlights } from "@/components/with-highlights";

// The About page's "Meet Our Qualified Quran Teachers" cards (compact, so the
// section fits one laptop screen), with a way through to the Instructors page
export default function MeetTeachers() {
  return (
    <section className="relative flex flex-col justify-center bg-white py-[clamp(1.75rem,4.5vh,3.5rem)] lg:min-h-[calc(100svh-68px)] lg:snap-start">
      <div className="mx-auto w-full max-w-7xl px-[1rem] sm:px-[1.5rem] lg:px-[2rem]">
        <div className="flex flex-col gap-[1.25rem] lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[860px]">
            <Eyebrow>Our teachers</Eyebrow>
            <SectionHeading className="mt-[1rem]">
              <Words text="Meet Our Qualified" />
              <Accent text="Quran Teachers" delay={0.18} />
            </SectionHeading>
            <motion.div {...reveal(0.1)}>
              <Lead className="mt-[0.9rem] max-w-[640px]">
                {withHighlights(
                  "Your child learns with the same teacher every week. Our **Quran** teachers are from **Pakistan**, hold recognised qualifications and pass our checks before their first lesson.",
                )}
              </Lead>
            </motion.div>
          </div>
          <motion.div className="shrink-0" {...reveal(0.15)}>
            <SectionCta href="/instructors">Meet all our teachers</SectionCta>
          </motion.div>
        </div>

        <div className="mx-auto mt-[clamp(1.25rem,4vh,2.5rem)] grid max-w-[420px] grid-cols-1 gap-[1.25rem] md:max-w-none md:grid-cols-3 lg:gap-[1.75rem]">
          {teacherCards.map((t, i) => (
            // The outer cards swing in from their side, the middle one rises
            <ScrollIn key={t.name} side={i - 1}>
              <TeacherCard t={t} compact />
            </ScrollIn>
          ))}
        </div>
      </div>
    </section>
  );
}
