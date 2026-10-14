"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { ArrowRight, BookOpen, Check, Users } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { courses } from "@/app/(pages)/(courses)/data";
import { EASE, reveal, useMinWidth } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, PageTitle, TiltCard, Words } from "@/components/lux/effects";
import { CourseIcon, QuranBackdrop, RoadmapNode } from "./roadmap-art";

// The journey, in the order a student takes it. On laptops the cards take
// turns, left then right; a left card's node is on its right and a right
// card's on its left, so the path zig-zags down the middle between them.
// `imagePos` moves the crop of a course picture whose subject isn't central.
const STEPS = [
  { id: "quran-reading-nazra", title: "Qaida & Foundations", icon: "qaida", node: "orbit" },
  { id: "tajweed-mastery", title: "Tajweed & Pronunciation", icon: "tajweed", node: "star" },
  { id: "quran-memorization", title: "Hifz & Memorization", icon: "hifz", node: "starOrbit" },
  { id: "arabic-for-quran", title: "Arabic & Vocabulary", icon: "arabic", node: "orbit" },
  { id: "islamic-studies-fundamentals", title: "Islamic Studies & Fiqh", icon: "studies", node: "star" },
  { id: "quran-tafseer", title: "Tafseer & Understanding", icon: "tafseer", node: "starOrbit", imagePos: "object-[center_22%]" },
].map((step, i) => ({
  ...step,
  course: courses.find((c) => c.id === step.id),
  side: i % 2 === 0 ? "right" : "left",
}));

// The roadmap runs off the scroll from when its top passes START down the
// screen (0) to when its bottom passes LINE (1). The badge reaches each node
// as that node comes up to LINE, a little over halfway down the screen.
const START = 0.85;
const LINE = 0.55;

// Where each card's node is, measured off the page so it follows the cards
// whatever their text does: `points` are the nodes' centres in the roadmap,
// `size` a node's width, and `at` the scroll progress (0–1) at which the
// badge reaches each node. Measured again whenever the roadmap, a card or
// the window changes size.
function useRoadmapPath(containerRef, nodeRefs) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = container.getBoundingClientRect();
        const points = nodeRefs.current.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
        });
        // a node at y is at LINE when the scroll has gone (START - LINE) of
        // the screen plus y, out of the window's whole run
        const lead = (START - LINE) * window.innerHeight;
        setGeometry({
          points,
          size: nodeRefs.current[0].getBoundingClientRect().width,
          at: points.map((p) => (p.y + lead) / (box.height + lead)),
          // how much scroll progress one screen height is
          screen: window.innerHeight / (box.height + lead),
        });
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    nodeRefs.current.forEach((el) => el?.parentElement && observer.observe(el.parentElement));
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, nodeRefs]);

  return geometry;
}

// 0 → 1 as v goes from a to b, clamped
const ramp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// A smooth start and a smooth stop
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Of the scroll between two nodes, the share the badge spends resting on the
// first before it travels on (it lands on the second as that one's time comes)
const REST = 0.4;

// Laptops: one numbered badge that travels the roadmap with the scroll: it pops in on
// the first card's node showing 1 as the roadmap comes into view, rests there, then moves straight on to the
// next node, lifting a little on the way, and lands there showing the next
// number (the node's gold pulse goes off as it lands). Scrolling back up
// sends it back. `at` says when it reaches each node (see useRoadmapPath).
function TravellingBadge({ points, size, at, progress }) {
  // the node it has last reached, and how far on towards the next (0–1)
  const placeAt = (v) => {
    for (let i = 1; i < points.length; i++) {
      if (v < at[i]) {
        const leave = at[i - 1] + REST * (at[i] - at[i - 1]);
        return { from: i - 1, t: easeInOut(ramp(v, leave, at[i])) };
      }
    }
    return { from: points.length - 1, t: 0 };
  };
  const coord = (v, axis) => {
    const { from, t } = placeAt(v);
    const a = points[from];
    const b = points[from + 1] ?? a;
    return a[axis] + (b[axis] - a[axis]) * t - size / 2;
  };
  const x = useTransform(progress, (v) => coord(v, "x"));
  const y = useTransform(progress, (v) => coord(v, "y"));
  const opacity = useTransform(progress, (v) => (v > 0 ? ramp(v, 0, 0.06) : 0));
  // pops in at the start (0.5 → 1.12 → 1), and lifts a little mid-journey
  const scale = useTransform(progress, (v) => {
    const p = ramp(v, 0, 0.06);
    const pop = p < 0.6 ? 0.5 + (p / 0.6) * 0.62 : 1.12 - ((p - 0.6) / 0.4) * 0.12;
    return pop * (1 + 0.14 * Math.sin(Math.PI * placeAt(v).t));
  });
  // the number changes as it lands, the new one rolling up into place
  const [number, setNumber] = useState(() => placeAt(progress.get()).from + 1);
  useMotionValueEvent(progress, "change", (v) => setNumber(placeAt(v).from + 1));

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[5] max-lg:hidden"
      style={{ x, y, width: size, height: size, opacity }}
    >
      <motion.div className="relative h-full w-full" style={{ scale }}>
        <RoadmapNode variant="starOrbit" className="h-full w-full" />
        {/* over the node, so it stays upright while the orbit turns, with a
            navy halo to keep it clear of the orbit passing behind */}
        <span className="absolute inset-[18%] overflow-hidden rounded-full">
          <AnimatePresence initial={false}>
            <motion.span
              key={number}
              className="font-accent absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#F6E39A_0%,#D4AF37_55%,#C39A32_100%)] bg-clip-text pb-[0.06em] pr-[0.06em] text-[1.15rem] italic leading-none text-transparent [filter:drop-shadow(0_0_2px_#0B1E36)_drop-shadow(0_0_1px_#0B1E36)] lg:text-[1.7rem]"
              initial={{ y: "80%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-80%", opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {number}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>
    </motion.div>
  );
}

// Phones and tablets: no travelling badge (each node shows its own number)
// but a fine gold line that runs down the rail with the scroll, from the
// first node to the last over a faint track, reaching each node when the
// badge would have landed on it. Behind the nodes, which sit over it.
function RoadmapLine({ points, at, progress }) {
  const first = points[0];
  const last = points[points.length - 1];
  // how far down the line has come from the first node, in px
  const reach = (v) => {
    if (v <= at[0]) return 0;
    for (let i = 1; i < points.length; i++) {
      if (v < at[i]) return points[i - 1].y + (points[i].y - points[i - 1].y) * ramp(v, at[i - 1], at[i]) - first.y;
    }
    return last.y - first.y;
  };
  const height = useTransform(progress, reach);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-0 w-[2px] lg:hidden"
      style={{ left: first.x - 1, top: first.y, height: last.y - first.y }}
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#D4AF37]/20" />
      <motion.span
        className="absolute left-0 top-0 w-[2px] rounded-full bg-[linear-gradient(180deg,#F1D67E,#D4AF37)] shadow-[0_0_6px_rgba(212,175,55,0.55)]"
        style={{ height }}
      />
    </div>
  );
}

// The gold pill button that opens the enrolment form
function EnrollButton({ course, onEnroll, className = "", ...rest }) {
  return (
    <button
      {...rest}
      type="button"
      onClick={() => onEnroll(course)}
      className={`group/btn relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-[linear-gradient(180deg,#F6E39A_0%,#D4AF37_50%,#B38A2C_100%)] px-[1.7rem] py-[0.6rem] text-[0.74rem] !font-extrabold uppercase tracking-[0.14em] !text-[#0B1E36] shadow-[0_6px_16px_-6px_rgba(212,175,55,0.75),inset_0_1px_0_rgba(255,255,255,0.55)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_24px_-8px_rgba(212,175,55,0.9),inset_0_1px_0_rgba(255,255,255,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#F1D67E] ${className}`}
    >
      {/* a sheen that sweeps across on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-[40%] w-[30%] -skew-x-12 bg-white/45 blur-[2px] transition-transform duration-700 group-hover/btn:translate-x-[480%] motion-reduce:hidden"
      />
      <span className="relative">Enroll Now</span>
    </button>
  );
}

// A course's details, rising from below over its card on hover or focus (the
// old course cards' reveal; laptops only). The card holds it with `group`.
// `small` scales it down for the strip's small cards, and `focus` carries
// their repeats' tabIndex -1.
function CourseDetails({ course, onEnroll, small = false, focus = {} }) {
  const size = (big, sm) => (small ? sm : big);
  return (
    <div
      className={`absolute inset-0 z-[2] hidden [visibility:hidden] flex-col justify-between bg-[linear-gradient(180deg,#10284A_0%,#0B1E36_70%)] text-left opacity-[0] transition-[transform,opacity,visibility] duration-300 ease-out group-focus-within:translate-y-0 group-focus-within:[visibility:visible] group-focus-within:opacity-[1] group-hover:translate-y-0 group-hover:[visibility:visible] group-hover:opacity-[1] lg:flex ${size("translate-y-[12rem] px-[1.15rem] pb-[1.1rem] pt-[1.15rem]", "translate-y-[9rem] px-[0.8rem] pb-[0.8rem] pt-[0.85rem]")}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#D4AF37,transparent)]" />
      <div>
        <h3 className={`!mb-0 !font-extrabold !leading-[1.22] !tracking-[-0.01em] ${size("!text-[1.08rem]", "!text-[0.85rem]")}`}>
          <Link href={`/coursesGrid/${course.id}`} tabIndex={-1} className="!text-white">
            {course.title}
          </Link>
        </h3>
        <div className={`flex items-center ${size("mt-[0.45rem] gap-[0.45rem]", "mt-[0.35rem] gap-[0.35rem]")}`}>
          <span className={`flex gap-[0.12rem] text-[#D4AF37] ${size("text-[0.72rem]", "text-[0.58rem]")}`}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </span>
          <span className={`font-semibold text-white/75 ${size("text-[0.7rem]", "text-[0.56rem]")}`}>
            {course.rating} ({course.ratingCount} ratings)
          </span>
        </div>
        <p className={`!mb-0 !font-normal !leading-[1.5] !text-white/75 ${size("mt-[0.6rem] line-clamp-3 !text-[0.8rem]", "mt-[0.4rem] line-clamp-2 !text-[0.66rem]")}`}>{course.subtitle}</p>
        <div className={`flex flex-wrap gap-y-[0.3rem] font-semibold text-white/80 ${size("mt-[0.7rem] gap-x-[0.85rem] text-[0.68rem]", "mt-[0.45rem] gap-x-[0.6rem] text-[0.58rem]")}`}>
          <span className="inline-flex items-center gap-[0.3rem]">
            <Users className={`text-[#D4AF37] ${size("h-[0.8rem] w-[0.8rem]", "h-[0.68rem] w-[0.68rem]")}`} aria-hidden="true" />
            {course.students.toLocaleString()} students
          </span>
          <span className="inline-flex items-center gap-[0.3rem]">
            <BookOpen className={`text-[#D4AF37] ${size("h-[0.8rem] w-[0.8rem]", "h-[0.68rem] w-[0.68rem]")}`} aria-hidden="true" />
            {course.lessons} lessons
          </span>
        </div>
        <ul className={`!mb-0 space-y-[0.2rem] !pl-0 ${size("mt-[0.55rem]", "mt-[0.4rem]")}`}>
          {course.features.slice(0, small ? 1 : 2).map((feature) => (
            <li key={feature} className={`flex items-center gap-[0.35rem] text-white/80 ${size("text-[0.72rem]", "text-[0.6rem]")}`}>
              <Check className={`shrink-0 text-[#D4AF37] ${size("h-[0.75rem] w-[0.75rem]", "h-[0.65rem] w-[0.65rem]")}`} aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className={`flex items-center justify-between ${size("gap-[0.5rem]", "gap-[0.35rem]")}`}>
        <EnrollButton
          course={course}
          onEnroll={onEnroll}
          {...focus}
          className={size("!px-[1.2rem]", "!px-[0.8rem] !py-[0.4rem] !text-[0.56rem] !tracking-[0.1em]")}
        />
        <Link
          href={`/coursesGrid/${course.id}`}
          {...focus}
          className={`inline-flex items-center gap-[0.25rem] whitespace-nowrap font-bold uppercase !text-[#D4AF37] transition-colors hover:!text-[#F1D67E] ${size("text-[0.72rem] tracking-[0.1em]", "text-[0.58rem] tracking-[0.08em]")}`}
        >
          Details
          <ArrowRight className={size("h-[0.85rem] w-[0.85rem]", "h-[0.7rem] w-[0.7rem]")} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// One course on the roadmap. The outer box stays put and holds the spot for
// its node, so the badge can find it. The card is timed with the scroll: `at`
// is when the travelling badge lands on its node (0–1); as it nears, the card
// slides in from its side, and a gold pulse goes off as it lands, all driven
// by the scroll, so scrolling back up rewinds them. Below lg, and with reduced
// motion, there is no badge: each card shows its own numbered node. The card shows the
// course's picture, icon and title, and tilts; hovering it brings up the
// details from below, as the old course cards did (laptops; on phones the
// line about the course shows on the card itself).
function StepCard({ step, index, nodeRef, onEnroll, progress, at, staticNode, phone, screen }) {
  const { course } = step;
  // When the card shows. Laptops: as the badge nears its node. Below lg the
  // cards stack one under another, so waiting for the line would leave a card
  // blank on screen: there it comes in as it scrolls into view, from when its
  // node is at the bottom of the screen till it's four fifths of the way down
  // (`screen` is one screen height in scroll progress).
  const cardIn = (v) => {
    if (v <= 0) return 0;
    return phone
      ? ramp(v, at - (0.98 - LINE) * screen, at - (0.8 - LINE) * screen)
      : ramp(v, Math.max(0, at - 0.05), at + 0.05);
  };
  // a gold ring that spreads out and fades as the badge lands
  const pulseOpacity = useTransform(progress, (v) => {
    const t = ramp(v, at, at + 0.16);
    return v > 0 && t > 0 && t < 1 ? 0.5 * (1 - t) : 0;
  });
  const pulseScale = useTransform(progress, (v) => 1 + 0.8 * ramp(v, at, at + 0.16));
  const cardOpacity = useTransform(progress, cardIn);
  const cardX = useTransform(progress, (v) => (step.side === "right" ? -28 : 28) * (1 - cardIn(v)));
  const left = step.side === "right";
  // On laptops: a fixed width, in from the edge on its own side, and from the
  // second card on, raised to sit beside the one before (they're on opposite
  // sides; the cards' min height keeps two on the same side apart)
  const place = `${left ? "lg:self-start lg:ml-[3%] xl:ml-[9%]" : "lg:self-end lg:mr-[3%] xl:mr-[9%]"} ${index > 0 ? "lg:-mt-[7.5rem]" : ""}`;
  const nodeSide = left ? "lg:left-[calc(100%+1rem)]" : "lg:left-auto lg:right-[calc(100%+1rem)]";
  const title = step.title.replace(" & ", " & "); // the "&" stays at the end of the first line

  return (
    <div className={`relative z-[1] lg:w-[15rem] xl:w-[15.75rem] ${place}`}>
      <div
        ref={nodeRef}
        className={`absolute -left-[3.6rem] top-[1.75rem] h-[2.9rem] w-[2.9rem] lg:top-1/2 lg:h-[4.5rem] lg:w-[4.5rem] lg:-translate-y-1/2 ${nodeSide}`}
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-[12%] rounded-full bg-[#D4AF37]"
          style={{ opacity: pulseOpacity, scale: pulseScale }}
        />
        {/* its own number: below lg always, on laptops only with reduced motion */}
        <div className={`relative h-full w-full ${staticNode ? "" : "lg:hidden"}`}>
          <RoadmapNode variant={step.node} className="h-full w-full" />
          <span
            aria-hidden="true"
            className="font-accent absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#F6E39A_0%,#D4AF37_55%,#C39A32_100%)] bg-clip-text pb-[0.06em] pr-[0.06em] text-[1.15rem] italic leading-none text-transparent [filter:drop-shadow(0_0_2px_#0B1E36)_drop-shadow(0_0_1px_#0B1E36)] lg:text-[1.7rem]"
          >
            {index + 1}
          </span>
        </div>
      </div>

      <motion.div className="h-full" style={{ opacity: cardOpacity, x: cardX }}>
        <TiltCard max={4} className="group h-full">
          <article className="relative flex h-full flex-col overflow-hidden rounded-[1.1rem] border-[1px] border-[#D4AF37]/45 bg-[#0B1E36] text-center shadow-[0_24px_48px_-18px_rgba(11,30,54,0.55),0_8px_18px_-8px_rgba(11,30,54,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,border-color,box-shadow] duration-500 group-hover:-translate-y-[6px] group-hover:border-[#D4AF37]/90 group-hover:shadow-[0_34px_60px_-20px_rgba(11,30,54,0.6),0_0_34px_-6px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] lg:min-h-[17rem]">
            {/* the course's picture, fading into the navy below */}
            <div className="relative h-[8rem] shrink-0 overflow-hidden lg:h-[6.75rem]">
              <Image
                src={course.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 16rem, 36rem"
                className={`object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none ${step.imagePos ?? ""}`}
              />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,30,54,0.05)_0%,rgba(11,30,54,0.25)_55%,#0B1E36_100%)]" />
            </div>

            <div className="relative flex flex-1 flex-col items-center px-[1.1rem] pb-[1.2rem]">
              {/* the icon, half over the picture on a navy disc */}
              <span className="-mt-[1.9rem] rounded-full bg-[#0B1E36] p-[0.2rem] shadow-[0_6px_14px_rgba(0,0,0,0.35)]">
                <CourseIcon name={step.icon} className="h-[3.4rem] w-[3.4rem]" />
              </span>

              <h2 className="!mb-0 mt-[0.5rem] text-balance !text-[1.08rem] !font-extrabold !leading-[1.22] !tracking-[-0.01em]">
                <Link href={`/coursesGrid/${course.id}`} className="!text-white transition-colors duration-300 hover:!text-[#F1D67E]">
                  {/* the number shows on the badge beside the card; screen readers get it here */}
                  <span className="sr-only">Step {index + 1}: </span>
                  {title}
                </Link>
              </h2>
              <p className="!mb-0 mt-[0.4rem] !text-[0.64rem] !font-bold uppercase !leading-[1.4] tracking-[0.2em] !text-[#D4AF37]/75">
                {course.level} · {course.duration}
              </p>
              {/* on phones (no hover) the line about the course is on the card */}
              <p className="!mb-0 mt-[0.6rem] !text-[0.92rem] !font-normal !leading-[1.55] !text-white/85 lg:sr-only">{course.subtitle}</p>

              <div className="mt-auto pt-[0.9rem]">
                <EnrollButton course={course} onEnroll={onEnroll} />
              </div>
            </div>

            <CourseDetails course={course} onEnroll={onEnroll} />
          </article>
        </TiltCard>
      </motion.div>
    </div>
  );
}

// One course as a small card for the strip under the roadmap: its picture,
// icon, title, level and an Enroll button. It tilts and brings up the details
// on hover just as the roadmap's cards do. `copy` marks the repeats that make
// the loop seamless, which stay out of the keyboard's way.
function MiniCourseCard({ step, onEnroll, copy }) {
  const { course } = step;
  const focus = copy ? { tabIndex: -1 } : {};
  return (
    <li className="w-[12.5rem] shrink-0 list-none">
      <TiltCard max={4} className="group h-full">
        <article className="relative flex h-full min-h-[14rem] flex-col overflow-hidden rounded-[0.9rem] border-[1px] border-[#D4AF37]/40 bg-[#0B1E36] text-center shadow-[0_14px_28px_-14px_rgba(11,30,54,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,border-color,box-shadow] duration-500 group-hover:-translate-y-[4px] group-hover:border-[#D4AF37]/90 group-hover:shadow-[0_20px_34px_-14px_rgba(11,30,54,0.6),0_0_24px_-6px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="relative h-[5.5rem] shrink-0 overflow-hidden">
            <Image
              src={course.image}
              alt=""
              fill
              sizes="12.5rem"
              className={`object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none ${step.imagePos ?? ""}`}
            />
            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,30,54,0.05)_0%,rgba(11,30,54,0.25)_55%,#0B1E36_100%)]" />
          </div>
          <div className="relative flex flex-1 flex-col items-center px-[0.8rem] pb-[0.9rem]">
            <span className="-mt-[1.45rem] rounded-full bg-[#0B1E36] p-[0.15rem] shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              <CourseIcon name={step.icon} className="h-[2.6rem] w-[2.6rem]" />
            </span>
            <h3 className="!mb-0 mt-[0.4rem] text-balance !text-[0.85rem] !font-extrabold !leading-[1.25] !tracking-[-0.01em]">
              <Link href={`/coursesGrid/${course.id}`} {...focus} className="!text-white transition-colors duration-300 hover:!text-[#F1D67E]">
                {step.title}
              </Link>
            </h3>
            <p className="!mb-0 mt-[0.3rem] !text-[0.64rem] !font-bold uppercase !leading-[1.4] tracking-[0.12em] !text-[#D4AF37]/75">
              {course.level} · {course.duration}
            </p>
            <div className="mt-auto pt-[0.7rem]">
              <EnrollButton course={course} onEnroll={onEnroll} {...focus} className="!px-[1.1rem] !py-[0.42rem] !text-[0.68rem]" />
            </div>
          </div>

          <CourseDetails course={course} onEnroll={onEnroll} small focus={focus} />
        </article>
      </TiltCard>
    </li>
  );
}

// Under the roadmap: every course again as a small card, sliding right to
// left without end. The row is there three times over so the loop never shows
// a gap, even on a wide screen (the repeats are hidden from screen readers);
// hovering or focusing a card pauses it. Reduced motion stops the slide and
// leaves one row to scroll by hand.
function CourseMarquee({ onEnroll }) {
  return (
    <div className="mt-[4rem] lg:mt-[5rem]">
      <div className="mx-auto flex w-full max-w-[78rem] items-center gap-[1rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        <span aria-hidden="true" className="h-[1px] flex-1 bg-[linear-gradient(90deg,transparent,#D4AF37)]" />
        <h2 className="!mb-0 !text-[0.78rem] !font-bold uppercase !leading-[1.2] tracking-[0.22em] !text-[#9B7930]">
          All Courses
        </h2>
        <span aria-hidden="true" className="h-[1px] flex-1 bg-[linear-gradient(90deg,#D4AF37,transparent)]" />
      </div>

      <div className="group/strip mt-[0.75rem] flex overflow-hidden pb-[2.5rem] pt-[1.25rem] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:overflow-x-auto">
        {[0, 1, 2].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy ? "true" : undefined}
            className={`!mb-0 flex shrink-0 gap-[1rem] !pl-0 pr-[1rem] animate-[marquee-scroll_45s_linear_infinite] group-hover/strip:[animation-play-state:paused] group-focus-within/strip:[animation-play-state:paused] motion-reduce:animate-none ${copy ? "motion-reduce:hidden" : "motion-reduce:pl-[1rem]"}`}
          >
            {STEPS.map((step) => (
              <MiniCourseCard key={step.id} step={step} onEnroll={onEnroll} copy={copy > 0} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

// The courses page: "Learn the Quran, Step by Step", every course as a
// numbered step, the cards taking turns left and right, with a numbered
// badge travelling from card to card. `onEnroll(course)` opens the
// enrolment form for that course.
export default function LearningRoadmap({ onEnroll }) {
  const reduceMotion = useReducedMotion();
  const wide = useMinWidth(1024);
  const roadmapRef = useRef(null);
  const nodeRefs = useRef([]);
  const geometry = useRoadmapPath(roadmapRef, nodeRefs);

  // Everything on the roadmap runs straight off the scroll (see START and
  // LINE), with no spring, so it moves exactly with the page. Reduced motion
  // shows it all.
  const { scrollYProgress } = useScroll({ target: roadmapRef, offset: [`start ${START}`, `end ${LINE}`] });
  const progress = useTransform(scrollYProgress, (v) => (reduceMotion ? 1 : v));

  return (
    <section aria-labelledby="journey-title" className="relative isolate overflow-hidden bg-white pb-[3.5rem] pt-[2.75rem] lg:pb-[4.5rem] lg:pt-[3.5rem]">
      <QuranBackdrop />

      <div className="mx-auto w-full max-w-[78rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        <div className="mx-auto max-w-[66rem] text-center">
          <motion.div {...reveal(0)}>
            <Eyebrow>Our courses</Eyebrow>
          </motion.div>
          <PageTitle id="journey-title" className="mt-[clamp(0.6rem,2vh,1rem)]">
            <Words text="Learn the Quran," />
            <Accent text="Step by Step" delay={0.2} />
          </PageTitle>
          <motion.div {...reveal(0.35, 16)}>
            <Lead className="mx-auto mt-[0.75rem] max-w-[36rem] text-balance">
              {/* a no-break space keeps the dash at the end of the first line */}
              From the first letters to the deeper meaning{" "}— live <span className="whitespace-nowrap">1-to-1</span> classes with certified teachers.
            </Lead>
          </motion.div>
        </div>

        <div
          ref={roadmapRef}
          className="relative mx-auto mt-[2.75rem] flex max-w-[36rem] flex-col gap-[2.5rem] pl-[3.75rem] lg:mt-[1.5rem] lg:max-w-none lg:gap-0 lg:pl-0"
        >
          {/* laptops: the Quran in navy smoke again (as at the top right), towards
              the middle at the bottom: right of the fifth card, under the badge's
              way to the last node, and above the "All Courses" strip */}
          <Image
            src="/decor/quran-cloud.webp"
            alt=""
            width={472}
            height={480}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[4rem] left-[31%] hidden h-auto w-[12rem] -rotate-[4deg] opacity-[0.6] lg:block xl:left-[33%]"
          />

          {STEPS.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              nodeRef={(el) => (nodeRefs.current[i] = el)}
              onEnroll={onEnroll}
              progress={progress}
              at={i === 0 ? 0 : geometry ? geometry.at[i] : i / (STEPS.length - 1)}
              staticNode={reduceMotion}
              phone={!wide}
              screen={geometry ? geometry.screen : 0.2}
            />
          ))}
          {geometry && !reduceMotion && (
            <TravellingBadge points={geometry.points} size={geometry.size} at={geometry.at} progress={progress} />
          )}
          {geometry && <RoadmapLine points={geometry.points} at={geometry.at} progress={progress} />}
        </div>
      </div>

      <CourseMarquee onEnroll={onEnroll} />
    </section>
  );
}
