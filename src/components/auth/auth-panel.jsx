"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, MonitorPlay, TrendingUp } from "lucide-react";
import Goldenlines from "@/components/goldenlines";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, Words, wordsParent } from "@/components/lux/effects";

// What the student area holds
const POINTS = [
  { Icon: MonitorPlay, title: "Live 1-to-1 classes", text: "Join each lesson with your teacher from your dashboard." },
  { Icon: CalendarDays, title: "Your schedule", text: "Class times and lesson notes, all in one place." },
  { Icon: TrendingUp, title: "Your progress", text: "Follow every step, from the first letters to Hifz." },
];

// The column the panel's top bar and words share
const COLUMN = "mx-auto w-full max-w-[32rem] px-[3rem]";

// The sign-in pages' navy side (laptops and up): the logo and a way back to
// the website along the top, then a welcome in the home page's heading style
// and what the student area holds, on the site's gold lines. It fills the
// screen's height and stays in view. Not a heading: each page's own title is
// its h1.
export default function AuthPanel() {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-[#0B1A37] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:self-start">
      <Goldenlines />
      <div aria-hidden="true" className="pointer-events-none absolute -left-[8rem] -top-[8rem] h-[26rem] w-[26rem] rounded-full bg-[#EECC65] opacity-[0.1] blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[10rem] -right-[6rem] h-[24rem] w-[24rem] rounded-full bg-[#2B4A8C] opacity-[0.5] blur-[120px]" />

      <div className={`relative flex shrink-0 items-center justify-between gap-[1rem] pt-[clamp(1rem,3vh,1.75rem)] ${COLUMN}`}>
        <Link href="/" aria-label="Quran West home" className="shrink-0">
          {/* a fine white rim lifts the logo's navy letters off the navy, as in the footer */}
          <Image
            src="/quran-academy-logo.png"
            alt="Quran West Academy"
            width={140}
            height={57}
            className="h-auto w-[clamp(6.5rem,15vh,8.5rem)] [filter:drop-shadow(0_0_1px_rgba(255,255,255,0.85))_drop-shadow(0_0_8px_rgba(255,255,255,0.25))]"
            priority
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-[0.4rem] rounded-full border-[1px] border-white/25 px-[1rem] py-[0.5rem] text-[0.82rem] font-semibold !text-white !no-underline transition-colors duration-300 hover:border-[#EECC65] hover:bg-[#EECC65] hover:!text-[#0B1A37]"
        >
          <ArrowLeft className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
          Back to website
        </Link>
      </div>

      <div className="relative flex flex-1 items-center">
        <div className={`py-[clamp(1rem,3vh,2.5rem)] ${COLUMN}`}>
          <motion.div {...reveal(0)}>
            <Eyebrow tone="dark">Quran West Academy</Eyebrow>
          </motion.div>
          <motion.p
            initial="hidden"
            animate="shown"
            variants={wordsParent}
            className="!mb-0 mt-[clamp(0.6rem,2vh,1rem)] !text-[clamp(1.75rem,min(3vw,6vh),2.75rem)] !font-extrabold !leading-[1.1] !tracking-[-0.03em] text-white [text-wrap:balance]"
          >
            <Words text="Your Quran journey," />
            <Accent text="one lesson at a time" tone="dark" delay={0.2} />
          </motion.p>
          <motion.div {...reveal(0.3)}>
            <Lead tone="dark" className="mt-[clamp(0.6rem,2vh,1rem)] max-w-[26rem]">
              Sign in to join your classes, see your schedule and follow your progress.
            </Lead>
          </motion.div>

          <ul className="!mb-0 mt-[clamp(1.25rem,4vh,2.25rem)] grid list-none gap-[clamp(0.75rem,2.2vh,1.1rem)] !pl-0">
            {POINTS.map(({ Icon, title, text }, i) => (
              <motion.li key={title} {...reveal(0.4 + 0.08 * i, 16)} className="!m-0 flex items-start gap-[0.9rem]">
                <span className="grid h-[2.6rem] w-[2.6rem] shrink-0 place-items-center rounded-[12px] border-[1px] border-[#EECC65]/30 bg-white/[0.06] text-[#EECC65]">
                  <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
                </span>
                <div>
                  <p className="!mb-0 !text-[0.98rem] !font-bold !leading-[1.4] !text-white">{title}</p>
                  <p className="!mb-0 mt-[0.15rem] !text-[0.88rem] !leading-[1.55] !text-white/65">{text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
