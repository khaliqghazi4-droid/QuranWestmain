"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { VIEWPORT, reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, SectionHeading, Words } from "@/components/lux/effects";

// The steps of the original home page: front title and line, then the
// title and promise on the card's back
const steps = [
  { icon: "/icons/icons.svg", title: "Tell us about your child", sub: "Fill out the enrolment form of your child", backTitle: "Tell us about your child", tag: "No commitment required" },
  { icon: "/icons/icon.svg", title: "We match you with right teacher", sub: "Based on age & course", backTitle: "We match you with the right teacher", tag: "Verified panel" },
  { icon: "/icons/icon1.svg", title: "Attend three free trial classes", sub: "No charge, no credit card", backTitle: "Attend three free trial classes", tag: "Real classes" },
  { icon: "/icons/icon-2.svg", title: "Enrol and continue learning", sub: "Same teacher, same time", backTitle: "Enrol and continue learning", tag: "No disruption" },
  { icon: "/icons/icon-4.svg", title: "Limited Spots Available", sub: "Three Free Classes available", backTitle: "Three Free Classes", tag: "No strings attached" },
  { icon: "/icons/icon5.svg", title: "Claim Your Free Trial", sub: "Live session with qualified teacher", backTitle: "Claim Your Free Trial", tag: "No payment info required" },
];

// A step card as on the original home page (the template's .categories-card,
// styles.css): navy with the icon, title and a line; hovering turns it over to
// its gold back. The cards turn in edgewise, one after another, as they come
// into view.
function StepCard({ step, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <div className="categories-card !mb-0">
        <div className="categories-card-inner">
          {/* Phones (two narrow cards a row): shorter, everything from the
              top so a row's icons line up, and a smaller line under the title */}
          <div className="categories-card-front !h-[17.5rem] max-sm:!h-[14.5rem] max-sm:!justify-start">
            <img className="card-icon" src={step.icon} alt="" aria-hidden="true" loading="lazy" />
            <h5 className="categorie-title !text-balance">{step.title}</h5>
            <h5 className="text-white !font-extralight max-sm:!mb-0 max-sm:!text-[13px] max-sm:!leading-snug">{step.sub}</h5>
          </div>
          <div className="categories-card-back !h-[17.5rem] max-sm:!h-[14.5rem]">
            <img className="card-icon !invert" src={step.icon} alt="" aria-hidden="true" loading="lazy" />
            <h5 className="categorie-title">{step.backTitle}</h5>
            <p>{step.tag}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// How it works: the six steps side by side on laptops (three to a row on
// tablets, two on phones), and the button that starts the first one
export default function StepsTimeline({ onEnroll }) {
  return (
    <section className="relative flex flex-col justify-center bg-white py-[clamp(2rem,5vh,4rem)] lg:min-h-[calc(100svh-68px)] lg:snap-start">
      <div className="mx-auto w-full max-w-[88rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        <div className="text-center">
          <Eyebrow>Getting started</Eyebrow>
          <SectionHeading className="mt-[1rem]">
            <Words text="Up and Running in" />
            {/* no-break space: "24" and "Hours" stay on one line */}
            <Accent text={"24\u00A0Hours"} delay={0.2} />
          </SectionHeading>
          <motion.div {...reveal(0.1)}>
            <Lead className="mx-auto mt-[0.9rem] max-w-[34rem]">
              Six simple steps, from your first message to your child&apos;s first lesson.
            </Lead>
          </motion.div>
        </div>

        <div className="mt-[clamp(1.5rem,4vh,2.5rem)] grid grid-cols-2 gap-[1rem] md:grid-cols-3 lg:gap-[1.25rem] xl:grid-cols-6">
          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} delay={0.1 + i * 0.1} />
          ))}
        </div>

        <motion.div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex justify-center" {...reveal(0.2)}>
          <button
            type="button"
            onClick={onEnroll}
            className="group inline-flex items-center gap-[0.9rem] !rounded-full bg-[#0B1A37] py-[0.4rem] pl-[1.5rem] pr-[0.4rem] text-[0.95rem] font-bold text-white transition-shadow duration-300 hover:shadow-[0_10px_24px_-10px_rgba(11,26,55,0.7)]"
          >
            Claim Your Free Trial
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] transition-transform duration-300 group-hover:-rotate-45">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
