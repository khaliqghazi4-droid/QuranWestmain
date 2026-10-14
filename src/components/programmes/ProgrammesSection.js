"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FileText, User } from "lucide-react";
import SectionCta from "@/components/noor/SectionCta";
import { EASE, reveal, useScrollEntrance } from "@/components/noor/motion";
import { Accent, Eyebrow, SectionHeading, TiltCard, Words } from "@/components/lux/effects";
import VelocityMarquee from "@/components/lux/VelocityMarquee";

const filters = [
  { label: "All", value: "" },
  { label: "Quran Reading", value: "filter_programming" },
  { label: "Hifz", value: "filter_graphic_design" },
  { label: "Tajweed", value: "filter_data_science" },
  { label: "Islamic Studies", value: "filter_marketing" },
  { label: "Arabic Language", value: "filter_management" },
];

const courses = [
  {
    id: 1,
    filter: "filter_programming",
    image: "/courses/Quran-Memorization.jpeg",
    imageAlt: "Quran Reading",
    title: "Quran Reading",
    level: "All ages · Beginner",
    priceSummary: "Start from beginning",
    meta: [
      { icon: "icon-user", text: "Learn letters to Surahs" },
      { icon: "icon-file-text", text: "Fluency & confidence" },
    ],
    hoverTitle: "Quran Reading",
    hoverDescription: "Students learn to recognise Arabic letters, form words and read complete Surahs fluently and with confidence.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 2,
    filter: "filter_graphic_design",
    image: "/courses/Quran-Recitation.jpeg",
    imageAlt: "Quran Memorisation",
    title: "Quran Memorisation",
    level: "Ages 7+ · All levels",
    priceSummary: "Structured memorisation",
    meta: [
      { icon: "icon-user", text: "Total Personal Hifz plan" },
      { icon: "icon-file-text", text: "Regular revision" },
    ],
    hoverTitle: "Quran Memorisation",
    hoverDescription: "A structured programme for children serious about memorising the Quran. Regular revision sessions keep students on track.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 3,
    filter: "filter_data_science",
    image: "/courses/tajweed.jpg",
    imageAlt: "Tajweed Rules",
    title: "Tajweed Rules",
    level: "Intermediate · Advanced",
    priceSummary: "Science of recitation",
    meta: [
      { icon: "icon-user", text: "Makhaarij & Sifaat" },
      { icon: "icon-file-text", text: "Perfect pronunciation" },
    ],
    hoverTitle: "Tajweed Rules",
    hoverDescription: "Learn the science of recitation — Makhaarij, Sifaat and the rules that make every letter sound exactly as it should.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 4,
    filter: "filter_programming",
    image: "/courses/islamic-studies.jpeg",
    imageAlt: "Islamic Studies",
    title: "Islamic Studies",
    level: "All ages · All levels",
    priceSummary: "Broad Islamic knowledge",
    meta: [
      { icon: "icon-user", text: "Five pillars & Seerah" },
      { icon: "icon-file-text", text: "Daily duas & halal/haram" },
    ],
    hoverTitle: "Islamic Studies",
    hoverDescription: "A broad grounding in Islamic knowledge: the five pillars, Seerah of the Prophet ﷺ, daily duas, halal and haram, and how to live as a Muslim in the modern world.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 5,
    filter: "filter_marketing",
    image: "/courses/arabiclanguage.jpg",
    imageAlt: "Arabic Language",
    title: "Arabic Language",
    level: "Ages 10+ · Beginner",
    priceSummary: "Understand Quran directly",
    meta: [
      { icon: "icon-user", text: "Vocabulary & grammar" },
      { icon: "icon-file-text", text: "Conversational Arabic" },
    ],
    hoverTitle: "Arabic Language",
    hoverDescription: "Understand the Quran directly, without translation. Our Arabic programme covers vocabulary, grammar and conversational Arabic at a steady, achievable pace.",
    hoverPrice: "Free Trial Available",
    hoverBtn: "Book Free Trial",
  },
  {
    id: 6,
    filter: "quran-tafseer",
    image: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Quran Tafseer",
    title: "Quran Tafseer",
    level: "Free trial available",
    priceSummary: "We'll assess child's level",
    meta: [
      { icon: "icon-user", text: "Recommend the right course" },
      { icon: "icon-file-text", text: "No commitment" },
    ],
    hoverTitle: "Book a Free Trial",
    hoverDescription: "This Tafseer course guides students through selected Surahs with detailed explanation of meanings, historical context (Asbab al-Nuzul), linguistic nuances, and scholarly commentary.",
    hoverPrice: "Free trial",
    hoverBtn: "Book Now",
  },
];

// Courses in the home page's row (laptops); the rest are named under it
const ROW = 4;

// Icons of the course meta rows (the keys are the old icon-font class names)
const metaIcons = { "icon-user": User, "icon-file-text": FileText };

function Stars({ size = 12, color = "#EECC65" }) {
  return (
    <span className="flex gap-[2px]" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} color={color} size={size} />
      ))}
    </span>
  );
}

function BookButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/btn inline-flex shrink-0 items-center gap-[0.55rem] !rounded-full bg-[#EECC65] py-[0.3rem] pl-[1rem] pr-[0.3rem] text-[0.85rem] font-bold text-[#0B1A37] transition-transform duration-300 hover:-translate-y-0.5"
    >
      Book Free Trial
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0B1A37] text-[#EECC65] transition-transform duration-300 group-hover/btn:-rotate-45">
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </button>
  );
}

// A course card: a gold spotlight follows the mouse across its surface and
// rim while it leans in 3D; hovering (or keyboard focus) slides the details up.
// forwardRef: AnimatePresence (popLayout) measures each card through its ref.
// Three layers, so nothing pulls at the same values: the outer one runs the
// filter's layout and exit animations, the middle the scroll entrance, the
// inner the tilt.
const CourseCard = forwardRef(function CourseCard({ course, index, onEnroll }, ref) {
  const cardRef = useRef(null);
  const setRefs = useCallback(
    (node) => {
      cardRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  // In a row of four the outer cards swing in furthest
  const entrance = useScrollEntrance(cardRef, { side: ((index % ROW) - (ROW - 1) / 2) / ((ROW - 1) / 2) });

  return (
    <motion.article
      ref={setRefs}
      layout
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="h-full"
    >
      <motion.div style={entrance} className="h-full">
        <TiltCard className="group relative h-full rounded-[26px] bg-white/[0.09] p-px">
          {/* The rim lights up where the pointer is */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[26px] opacity-[0] transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "radial-gradient(340px circle at var(--x) var(--y), rgba(238,204,101,0.75), transparent 45%)" }}
          />
          <div className="relative flex h-full flex-col overflow-hidden rounded-[25px] bg-[linear-gradient(165deg,#13254A,#0B1A37_72%)]">
            {/* ...and so does the surface, more softly */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 opacity-[0] transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(420px circle at var(--x) var(--y), rgba(238,204,101,0.12), transparent 50%)" }}
            />

            <div className="relative h-[clamp(9rem,21vh,13rem)] shrink-0 overflow-hidden">
              <Image
                src={course.image}
                alt={course.imageAlt}
                fill
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F2146] via-[#0B1A37]/20 to-transparent" />
              <span className="font-accent absolute bottom-[0.4rem] left-[1.1rem] text-[3.2rem] italic leading-none text-[#EECC65] [text-shadow:0_4px_24px_rgba(0,0,0,0.5)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="absolute right-[0.9rem] top-[0.9rem] rounded-full bg-[#0B1A37]/70 px-[0.6rem] py-[0.35rem] backdrop-blur-sm">
                <Stars size={11} />
              </span>
            </div>

            <div className="flex flex-1 flex-col px-[1.2rem] pb-[1.2rem] pt-[0.9rem]">
              <h3 className="!mb-0 !text-[clamp(1.15rem,2.7vh,1.35rem)] !font-bold !leading-tight !tracking-[-0.02em] text-white">
                {course.title}
              </h3>
              <div className="mt-[0.3rem] text-[0.82rem] leading-snug text-white/55">{course.level}</div>
              <div className="mt-[0.45rem] text-[0.92rem] font-semibold leading-snug text-[#EECC65]">{course.priceSummary}</div>
              <div className="mt-auto pt-[0.8rem]">
                <div className="flex flex-col gap-[0.35rem] border-t-[1px] border-white/10 pt-[0.7rem] text-[0.83rem] leading-snug text-white/70">
                  {course.meta.map((item, i) => {
                    const Icon = metaIcons[item.icon] ?? User;
                    return (
                      <span key={i} className="flex items-center gap-[0.5rem]">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-[#EECC65]" aria-hidden="true" />
                        {item.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Touch screens have no hover: the details sit at the bottom of the card */}
            <div className="hidden border-t-[1px] border-white/10 px-[1.2rem] py-[1rem] [@media(hover:none)]:block">
              <p className="!mb-0 !text-[0.88rem] !leading-[1.6] text-white/75">{course.hoverDescription}</p>
              <div className="mt-[0.75rem] flex items-center justify-between gap-[0.75rem]">
                <span className="text-[0.82rem] font-semibold text-[#EECC65]">{course.hoverPrice}</span>
                <BookButton onClick={onEnroll} />
              </div>
            </div>

            {/* With a mouse (or keyboard focus) the details slide up over the card */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-full flex-col bg-[#0B1A37]/95 px-[1.3rem] pb-[1.2rem] pt-[1.1rem] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:translate-y-0 group-hover:translate-y-0 [@media(hover:none)]:hidden">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#EECC65]/70 to-transparent" />
              <h3 className="!mb-0 !text-[1.3rem] !font-bold !leading-tight text-white">{course.hoverTitle}</h3>
              <div className="mt-[0.35rem] flex flex-wrap items-center gap-x-[0.6rem] gap-y-[0.25rem] text-[0.8rem] text-white/60">
                <Stars size={11} />
                <span>{course.level}</span>
              </div>
              <p className="!mb-0 mt-[0.6rem] !text-[0.88rem] !leading-[1.6] text-white/80">{course.hoverDescription}</p>
              <div className="mt-[0.9rem] flex items-center justify-between gap-[0.75rem]">
                <span className="text-[0.82rem] font-semibold text-[#EECC65]">{course.hoverPrice}</span>
                <BookButton onClick={onEnroll} />
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </motion.article>
  );
});

// Navy section opened by the course names in huge outlined letters, moving
// with the scroll. One row of four courses (two to a row on tablets, one on
// phones); the rest are named under it, with the way through to all courses.
export default function ProgrammesSection({ onEnroll }) {
  const [activeFilter, setActiveFilter] = useState("");
  const filteredCourses =
    activeFilter === "" ? courses : courses.filter((c) => c.filter === activeFilter);
  const shown = filteredCourses.slice(0, ROW);
  const more = filteredCourses.slice(ROW);

  return (
    <section className="relative isolate overflow-hidden bg-[#0B1A37] pb-[clamp(2.5rem,6vh,5rem)] pt-[clamp(1.25rem,3.5vh,2.5rem)] text-white lg:snap-start">
      <div aria-hidden="true" className="pointer-events-none absolute -left-[20%] top-[30%] -z-10 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(238,204,101,0.12),transparent_62%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[20%] bottom-[5%] -z-10 h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(41,72,140,0.5),transparent_62%)]" />

      <div aria-hidden="true">
        <VelocityMarquee speed={-0.9} className="select-none">
          {courses.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-[2.5rem] whitespace-nowrap px-[1.25rem] text-[clamp(3rem,7.5vw,6.5rem)] font-extrabold leading-[1.15] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1.5px_rgba(238,204,101,0.42)]"
            >
              {c.title}
              <span className="h-[0.16em] w-[0.16em] rotate-45 bg-[#EECC65]/60" />
            </span>
          ))}
        </VelocityMarquee>
      </div>

      <div className="mx-auto mt-[clamp(1.25rem,4vh,2.5rem)] w-full max-w-[88rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        {/* The heading, with the course filter across from it on wide
            screens (under it on smaller ones) */}
        <div className="flex flex-col gap-[clamp(1.25rem,3.5vh,2rem)] xl:flex-row xl:items-end xl:justify-between xl:gap-[2rem]">
          <div className="shrink-0 max-sm:text-center">
            <Eyebrow tone="dark">Courses for every age</Eyebrow>
            <SectionHeading tone="dark" className="mt-[1rem]">
              <Words text="Our" />
              <Accent text="Programmes" tone="dark" delay={0.08} />
            </SectionHeading>
          </div>

          {/* Phones: separate tags that wrap onto as many lines as they
              need, so every filter shows. Wider: one bar, scrolling sideways
              if it runs out of room. */}
          <motion.div className="min-w-0 overflow-x-auto [scrollbar-width:none] xl:pb-[0.3rem] [&::-webkit-scrollbar]:hidden" {...reveal(0.2)}>
            <ul className="!mb-0 flex list-none flex-wrap justify-center gap-[0.45rem] sm:inline-flex sm:min-w-max sm:flex-nowrap sm:gap-[0.2rem] sm:rounded-full sm:border-[1px] sm:border-white/10 sm:bg-white/[0.05] sm:p-[0.3rem]">
              {filters.map((filter) => {
                const active = activeFilter === filter.value;
                return (
                  <li key={filter.value} className="relative">
                    {active && (
                      <motion.span
                        layoutId="programme-filter"
                        className="absolute inset-0 rounded-full bg-[#EECC65] shadow-[0_8px_24px_-8px_rgba(238,204,101,0.7)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      aria-pressed={active}
                      className={`relative !rounded-full px-[0.95rem] py-[0.5rem] text-[0.85rem] font-semibold transition-colors duration-300 max-sm:border-[1px] max-sm:border-solid sm:px-[1.1rem] sm:py-[0.55rem] sm:text-[0.9rem] ${
                        active
                          ? "text-[#0B1A37] max-sm:border-transparent"
                          : "text-white/65 hover:text-white max-sm:border-white/15 max-sm:bg-white/[0.05]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>

        <div className="relative mt-[clamp(1.25rem,3.5vh,2rem)] grid gap-[1.25rem] sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} onEnroll={onEnroll} />
            ))}
          </AnimatePresence>
        </div>

        {/* The courses that don't fit the row, and the way to see them all */}
        <motion.div
          className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-col items-center gap-[0.9rem] text-center sm:flex-row sm:justify-center sm:gap-[1.5rem]"
          {...reveal(0.1)}
        >
          {more.length > 0 && (
            <p className="!mb-0 !text-[0.95rem] !leading-snug text-white/60 [text-wrap:balance]">
              {more.length} more {more.length === 1 ? "course" : "courses"}:{" "}
              <span className="font-semibold text-white">{more.map((c) => c.title).join(" & ")}</span>
            </p>
          )}
          <SectionCta href="/coursesGrid" tone="dark">
            View all courses
          </SectionCta>
        </motion.div>

        {/* A capsule with a light running round its rim */}
        <motion.div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex justify-center" {...reveal(0.1)}>
          <div className="relative overflow-hidden rounded-full p-px">
            <span
              aria-hidden="true"
              className="absolute -inset-[200%] animate-[noor-spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#EECC65_60deg,transparent_120deg,transparent_360deg)] motion-reduce:animate-none"
            />
            <div className="relative rounded-full bg-[#0F2146] px-[1.6rem] py-[0.7rem] text-center text-[0.95rem] text-white/80">
              Up and Running in <strong className="text-[#EECC65]">24 Hours</strong> — No lengthy forms, no waiting weeks
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
