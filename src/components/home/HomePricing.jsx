"use client";

import { motion } from "framer-motion";
import { Clock, Gift, UserRound } from "lucide-react";
import Goldenlines from "@/components/goldenlines";
import PricingPlans from "@/components/pricing/pricing-plans";
import SectionCta from "@/components/noor/SectionCta";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, SectionHeading, Words } from "@/components/lux/effects";

// What every plan includes, as in the Pricing page's banner
const POINTS = [
  { Icon: Clock, text: "30-minute lessons" },
  { Icon: UserRound, text: "One-to-one with a teacher" },
  { Icon: Gift, text: "Free trial class" },
];

// The Pricing page in brief: its navy banner as a slim band (heading, what
// every plan includes, and the way through to the full page), then the same
// course tabs, currency picker and plan table. `onChoose(course)` opens the
// enrolment form on that course.
export default function HomePricing({ onChoose }) {
  return (
    <section className="flex flex-col bg-[#F8F9FA] lg:min-h-[calc(100svh-68px)] lg:snap-start">
      {/* Banner: the site's gold lines, soft glows and a dot grid */}
      <div className="relative overflow-hidden bg-[#0B1A37] py-[clamp(0.9rem,2.2vh,2.5rem)] max-lg:py-[2.5rem]">
        <div className="pointer-events-none opacity-60">
          <Goldenlines />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(238,204,101,0.07)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-60%] h-[120%] w-[50%] -translate-x-1/2 rounded-full bg-[#EECC65] opacity-[0.10] blur-[120px]" />
          <div className="absolute bottom-[-60%] right-[-10%] h-[120%] w-[40%] rounded-full bg-[#2B4A8C] opacity-50 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[84rem] flex-col items-center gap-[1.1rem] px-[1rem] max-lg:text-center sm:px-[1.5rem] lg:flex-row lg:items-end lg:justify-between lg:px-[2.5rem]">
          <div>
            <Eyebrow tone="dark">Pricing</Eyebrow>
            <SectionHeading tone="dark" className="mt-[0.8rem]">
              <Words text="Our Courses &" />
              <Accent text="Plans" tone="dark" delay={0.15} />
            </SectionHeading>
          </div>

          <motion.div {...reveal(0.12)} className="flex flex-col items-center gap-[1rem] lg:flex-row lg:gap-[1.5rem]">
            {/* Beside the heading on wide screens; on laptops the table shows the same */}
            <ul className="!m-0 flex list-none flex-wrap items-center justify-center gap-[10px] !p-0 lg:hidden xl:flex">
              {POINTS.map(({ Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-[8px] rounded-full bg-white/[0.06] px-[14px] py-[7px] text-[13px] font-medium text-white/85 ring-1 ring-white/10"
                >
                  <Icon size={15} aria-hidden="true" className="text-[#EECC65]" />
                  {text}
                </li>
              ))}
            </ul>
            <SectionCta href="/pricing" tone="dark" className="shrink-0">
              See full pricing
            </SectionCta>
          </motion.div>
        </div>
      </div>

      {/* The plans, exactly as on the Pricing page */}
      <div className="mx-auto flex w-full max-w-[84rem] flex-1 flex-col justify-center px-[1rem] py-[clamp(0.9rem,2.2vh,2.5rem)] max-lg:py-[2.5rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        <PricingPlans onChoose={onChoose} />
      </div>
    </section>
  );
}
