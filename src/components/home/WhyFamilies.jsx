"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Accent, Eyebrow, SectionHeading, Words } from "@/components/lux/effects";
import { useMinWidth } from "@/components/noor/motion";

const reasons = [
  {
    src: "/assets/images/landing/qurankid.webp",
    alt: "One teacher one student",
    position: "70% 40%",
    title: "One Teacher, One Student",
    desc: "Your child builds a real relationship with someone who knows their progress inside out.",
    fact: "1 : 1",
    factLabel: "every single lesson",
  },
  {
    src: "/assets/images/landing/classAround.jpg",
    alt: "Family scheduling classes",
    position: "50% 60%",
    title: "Classes Around Your Schedule",
    desc: "You pick the time that works for your family — morning before school, after homework, or weekends.",
    fact: "7 days",
    factLabel: "a week, at times you choose",
  },
  {
    src: "/assets/images/teacher.jpg",
    alt: "teacher",
    position: "50% 22%",
    title: "Qualified & Verified Teachers",
    desc: "All our teachers hold formal Ijazah certification. We verify every qualification.",
    fact: "Ijazah",
    factLabel: "certified, and checked by us",
  },
];

const HEADER = 68; // the slim sticky header, which the pinned panel sits under
// The page settles at the start, middle and end of the cards' scrolling
// (one screen per reason, so three screens in all): 0, 1.5 and 3 screens down
const TRAVEL = reasons.length;
const STOP = TRAVEL / (reasons.length - 1);
// Once the last card is up, the panel stays pinned for this many more screens
// of scrolling, so the card is seen before the page moves on
const HOLD = 0.5;
// Below lg there is no settling, only swiping, and a screen per reason felt
// slow: there the cards come up over 0.8 of a screen in all (0.4 each) and
// the hold is 0.15 of a screen. The section's height (in its classes)
// follows: 1 + 0.8 + 0.15 = 1.95 screens below lg, 1 + 3 + 0.5 = 4.5 from lg.
const PHONE_TRAVEL = 0.8;
const PHONE_HOLD = 0.15;

// How far card k has come up, 0..1, at scroll progress v. The first card is
// up from the start; each one after it comes up over its own share of the
// section's scrolling, starting the moment the one before it is fully up
// (with three: the second over the first half, the third over the second),
// so the scrolling never runs on with nothing moving. The page settles where
// one card is fully up and the next is about to start.
// `snap`: reduced motion, where a card is either down or up.
function arrival(v, k, snap = false) {
  if (k === 0) return 1;
  const span = 1 / (reasons.length - 1);
  const t = Math.min(1, Math.max(0, (v - (k - 1) * span) / span));
  return snap ? Math.round(t) : t;
}

// The reason's fact on a navy card
function Fact({ reason, className = "" }) {
  return (
    <div className={`inline-block rounded-[18px] bg-[#0B1A37] px-[1.1rem] py-[0.8rem] lg:rounded-[22px] lg:px-[1.5rem] lg:py-[1.1rem] ${className}`}>
      <span className="block text-[1.6rem] font-extrabold leading-none tracking-[-0.04em] text-[#EECC65] lg:text-[clamp(2rem,4.6vh,2.6rem)]">
        {reason.fact}
      </span>
      <span className="mt-[0.3rem] block text-[0.75rem] text-white/70 lg:text-[0.85rem]">{reason.factLabel}</span>
    </div>
  );
}

// One reason as a whole card: number, title, text and fact beside its photo
// (the photo on top on phones and tablets). It rides up from below the screen
// as the page scrolls, and once later cards come up over it, it shrinks back
// a little and darkens, its top edge still showing above them like the cards
// below in a pile.
function StackCard({ reason, index, progress }) {
  const reduceMotion = useReducedMotion();
  const up = useTransform(progress, (v) => arrival(v, index, reduceMotion));
  // How many cards lie over this one (fractions while they come up)
  const depth = useTransform(progress, (v) =>
    reasons.reduce((sum, _, k) => (k > index ? sum + arrival(v, k, reduceMotion) : sum), 0)
  );
  const y = useTransform(up, (a) => `${(1 - a) * 125}%`);
  const imageScale = useTransform(up, (a) => 1.15 - 0.15 * a);
  const scale = useTransform(depth, (d) => 1 - 0.05 * d);
  const filter = useTransform(depth, (d) => `brightness(${1 - 0.3 * d})`);

  return (
    <motion.article
      className="absolute inset-x-0 top-[calc(var(--peek)*var(--i))] h-[calc(100%-var(--peek)*2)] origin-top [--peek:10px] lg:[--peek:14px]"
      style={{ "--i": index, zIndex: index + 1, y, scale, filter }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_40px_90px_-40px_rgba(11,26,55,0.55)] ring-1 ring-[#0B1A37]/[0.06] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:rounded-[32px]">
        {/* The photo: on top on phones and tablets, on the right on laptops */}
        <div className="relative min-h-0 flex-1 overflow-hidden lg:order-2 lg:h-full">
          <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
            <Image
              src={reason.src}
              alt={reason.alt}
              fill
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 44rem, 100vw"
              className="object-cover"
              style={{ objectPosition: reason.position }}
            />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B1A37]/50 to-transparent lg:hidden" />
          <Fact reason={reason} className="absolute bottom-[0.75rem] left-[0.75rem] lg:hidden" />
        </div>

        {/* The words */}
        <div className="flex shrink-0 flex-col p-[1.1rem] sm:p-[1.5rem] lg:order-1 lg:justify-between lg:p-[clamp(1.75rem,5vh,3.25rem)]">
          <div>
            <div className="flex items-baseline gap-[0.75rem] lg:block">
              <span className="font-accent text-[1.6rem] italic leading-none text-[#9B7930] lg:text-[clamp(2.6rem,6.5vh,3.6rem)]">
                0{index + 1}
              </span>
              <h3 className="!mb-0 !text-[1.25rem] !font-extrabold !leading-tight !tracking-[-0.02em] text-[#0B1A37] lg:mt-[clamp(0.6rem,2vh,1.25rem)] lg:!text-[clamp(1.6rem,4vh,2.25rem)]">
                {reason.title}
              </h3>
            </div>
            <p className="!mb-0 mt-[0.5rem] !text-[0.95rem] !leading-[1.6] text-[#0B1A37]/70 lg:mt-[clamp(0.6rem,2vh,1.1rem)] lg:max-w-[28rem] lg:!text-[clamp(1rem,2.4vh,1.15rem)]">
              {reason.desc}
            </p>
          </div>
          <Fact reason={reason} className="mt-[1.5rem] hidden self-start lg:inline-block" />
        </div>
      </div>
    </motion.article>
  );
}

// The section is four and a half screens tall on laptops (under two
// below lg) and its panel stays pinned under the header, with the heading on
// top and the three reasons below as a pile of cards: scrolling brings each
// reason's card up over the last one (on laptops the page settles on each),
// and fills its bar. After the last card, the panel holds still for a moment
// before the page moves on.
export default function WhyFamilies() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const wide = useMinWidth(1024);
  const travel = wide ? TRAVEL : PHONE_TRAVEL;
  const hold = wide ? HOLD : PHONE_HOLD;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: [`start ${HEADER}px`, "end end"] });
  // How far the cards have come, 0..1: all up by the time the hold begins
  const progress = useTransform(scrollYProgress, (v) => Math.min(1, (v * (travel + hold)) / travel));
  // The counter moves on once a card is half way up
  useMotionValueEvent(progress, "change", (v) => {
    setActive(Math.min(reasons.length - 1, Math.max(0, Math.round(v * (reasons.length - 1)))));
  });
  // The cards follow the scroll through a light spring, so they glide
  const cardProgress = useSpring(progress, { stiffness: 120, damping: 26, mass: 0.4 });
  // Each reason's bar fills as its card comes up (the first one's is full)
  const bars = [
    useTransform(progress, (v) => arrival(v, 0)),
    useTransform(progress, (v) => arrival(v, 1)),
    useTransform(progress, (v) => arrival(v, 2)),
  ];

  // Scroll to the point where the page settles on a reason
  const goTo = (i) => {
    const el = sectionRef.current;
    if (!el) return;
    const screen = window.innerHeight - HEADER;
    const stop = travel / (reasons.length - 1);
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER + i * stop * screen;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    // Height in classes, not from `wide`, so it's right from the first paint
    <section
      ref={sectionRef}
      className="relative h-[calc((100svh-68px)*1.95)] bg-[#FBF7EE] lg:h-[calc((100svh-68px)*4.5)]"
    >
      {/* One snap point per reason (snapping is on laptops only) */}
      {reasons.map((r, k) => (
        <div
          key={r.title}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 hidden h-[calc(100svh-68px)] lg:block lg:snap-start"
          style={{ top: `calc((100svh - ${HEADER}px) * ${k * STOP})` }}
        />
      ))}

      <div className="sticky top-[68px] h-[calc(100svh-68px)] overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[88rem] flex-col px-[1rem] pb-[clamp(1rem,3vh,2rem)] pt-[clamp(1.25rem,3.5vh,2.5rem)] sm:px-[1.5rem] lg:px-[2.5rem]">
          {/* Heading, with the counter and one bar per reason beside it */}
          <div className="flex shrink-0 flex-col gap-[1rem] lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>The Quran West difference</Eyebrow>
              <SectionHeading className="mt-[0.75rem] lg:mt-[1rem]">
                <Words text="Why Families are" />
                <Accent text="Choosing Us" delay={0.2} />
              </SectionHeading>
            </div>
            <div className="flex items-center gap-[1rem] lg:w-[22rem]">
              <span className="shrink-0 text-[0.9rem] font-bold tabular-nums text-[#0B1A37]">
                0{active + 1} <span className="text-[#0B1A37]/35">/ 0{reasons.length}</span>
              </span>
              <div className="flex flex-1 gap-[6px]">
                {reasons.map((r, i) => (
                  <button
                    key={r.title}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={r.title}
                    aria-current={i === active}
                    className="group flex-1 py-[0.6rem]"
                  >
                    <span className="block h-[3px] overflow-hidden rounded-full bg-[#0B1A37]/10 transition-colors group-hover:bg-[#0B1A37]/20">
                      <motion.span className="block h-full origin-left rounded-full bg-[#EECC65]" style={{ scaleX: bars[i] }} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The pile of cards */}
          <div className="relative mt-[clamp(1rem,3vh,2rem)] min-h-0 flex-1">
            {reasons.map((r, i) => (
              <StackCard key={r.title} reason={r} index={i} progress={cardProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
