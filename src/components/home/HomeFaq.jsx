"use client";

import { motion } from "framer-motion";
import FaqAccordion from "@/components/faq-accordion";
import SectionCta from "@/components/noor/SectionCta";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, SectionHeading, Words } from "@/components/lux/effects";
import { faqGroups } from "@/app/(pages)/faqs/data";

// Questions from the FAQs page whose answers have no facts still to confirm
// ([..] in the text), so nothing unfinished shows on the home page
const HOME_QUESTIONS = [
  "How do online Quran classes work?",
  "Which countries do you teach?",
  "Is online Quran learning good for kids?",
  "Are female Quran teachers available?",
  "Where do your teachers teach from?",
];
const allItems = faqGroups.flatMap(({ items }) => items);
const items = HOME_QUESTIONS.map((q) => allItems.find((item) => item.q === q)).filter(Boolean);

// A few of the FAQs page's questions, with ways through to it and to Contact
export default function HomeFaq({ onEnroll }) {
  return (
    <section className="relative flex flex-col justify-center bg-[#FBF7EE] py-[clamp(2rem,5vh,4rem)] lg:min-h-[calc(100svh-68px)] lg:snap-start">
      <div className="mx-auto grid w-full max-w-7xl gap-[2rem] px-[1rem] sm:px-[1.5rem] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-[3.5rem] lg:px-[2rem]">
        <div>
          <Eyebrow>FAQs</Eyebrow>
          <SectionHeading className="mt-[1rem]">
            <Words text="Online Quran Classes:" />
            <Accent text="Your Questions Answered" delay={0.18} />
          </SectionHeading>
          <motion.div {...reveal(0.1)}>
            <Lead className="mt-[0.9rem] max-w-[520px]">
              Everything parents and adult learners ask before booking: ages, prices, teachers, safety and time zones.
            </Lead>
            <div className="mt-[clamp(1.25rem,3.5vh,2rem)] flex flex-wrap gap-[0.6rem] sm:gap-[0.75rem]">
              <SectionCta href="/faqs">View all FAQs</SectionCta>
              <SectionCta href="/contact" tone="outline">
                Contact Us
              </SectionCta>
            </div>
          </motion.div>
        </div>

        <FaqAccordion items={items} idPrefix="home-faq" onTrial={onEnroll} />
      </div>
    </section>
  );
}
