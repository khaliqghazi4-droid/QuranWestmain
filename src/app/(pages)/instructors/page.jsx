"use client";

import { Fragment, useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MotionConfig,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LayoutList,
  UserRound,
} from "lucide-react";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import EnrollModal from "@/components/enroll-modal";
import { EASE, reveal } from "@/components/noor/motion";
import {
  Accent,
  Eyebrow,
  SectionHeading,
  Words,
  wordsParent,
} from "@/components/lux/effects";
import { instructors, upcomingInstructors } from "./data";

const stats = [
  { value: "500", label: "Students Enrolled" },
  { value: "5+", label: "Courses Available" },
  { value: "99.9%", label: "Satisfaction Rate" },
];

// The teachers with the extras spread evenly among them, so they don't all
// sit together: with 7 teachers and 3 extras, an extra after every 2 or 3
// teachers. The first card is always a teacher.
function spread(people, extras) {
  const total = people.length + extras.length;
  const at = new Set(
    extras.map((_, k) => Math.round(((k + 1) * total) / extras.length) - 1),
  );
  let p = 0;
  let e = 0;
  return Array.from({ length: total }, (_, i) =>
    at.has(i) ? extras[e++] : people[p++],
  );
}

// The ring: the teachers and the placeholders that fill it to ten cards
const ring = spread(instructors, upcomingInstructors);
const N = ring.length;
const STEP = 360 / N; // degrees between neighbouring cards
const SPIN = 9; // degrees a second the ring turns by itself (a full turn in 40s)
const DRAG = 0.12; // degrees the ring turns per pixel dragged

// Keeps n in 0..m-1, negative n too
const mod = (n, m) => ((n % m) + m) % m;
// The card at the front of a ring turned by r degrees
const frontAt = (r) => mod(Math.round(-r / STEP), N);

// The photo in a gold ring; for a teacher still to join, a gold outline of a
// person. A set width and height, not aspect-square: in the card's column a
// tall photo would stretch an aspect-square ring into an oval.
function Avatar({ person }) {
  return (
    <div className="h-[6.5em] w-[6.5em] shrink-0 rounded-full border-[3px] border-[#EECC65] p-[3px] shadow-[0_10px_22px_-10px_rgba(0,0,0,0.7)]">
      {person.upcoming ? (
        <div className="grid h-full w-full place-items-center rounded-full bg-[#0B1A37] ring-1 ring-inset ring-[#EECC65]/30">
          <UserRound
            className="h-[55%] w-[55%] text-[#EECC65]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      ) : (
        <img
          src={person.image}
          alt={person.name}
          draggable={false}
          className="h-full w-full rounded-full object-cover object-top"
        />
      )}
    </div>
  );
}

// One face of a card: clear frosted glass with no colour of its own (the white
// and gold page shows through it, blurred, with a light catch along the top),
// very round corners and a gold edge, the photo, name, role, a line of detail
// and the trial button, the words in navy and deep gold so they read on the
// glass. The back face, seen from across the ring, is the same card the right
// way round (not mirrored), with just the photo, name and role. `shade` fades
// the card into the page the further round the ring it has turned; the card
// at the front (`current`) glows gold and is the only one whose link and
// button can be used.
function CardFace({ person, current = false, back = false, shade, onBook }) {
  const live = current && !back;
  return (
    <div
      aria-hidden={back || undefined}
      className={`absolute inset-0 flex flex-col items-center rounded-[3.8em] bg-[linear-gradient(160deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.32)_100%)] px-[1em] pb-[0.95em] pt-[0.8em] text-center backdrop-blur-[14px] backdrop-saturate-150 transition-[border-color,box-shadow] duration-500 [-webkit-backface-visibility:hidden] [backface-visibility:hidden] ${
        live
          ? "border-[2px] border-[#EECC65] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_3px_rgba(238,204,101,0.22),0_0_34px_rgba(238,204,101,0.45),0_30px_50px_-24px_rgba(11,26,55,0.35)]"
          : "border-[1.5px] border-[#EECC65]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_22px_40px_-24px_rgba(11,26,55,0.3)]"
      }`}
      style={back ? { transform: "rotateY(180deg)" } : undefined}
    >
      <Avatar person={person} />
      {/* The words take the room left between the photo and the button and
                are cut to fit it (name two lines at most, role and detail one),
                so a long name never pushes the button down */}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
        <h3 className="!mb-0 mt-[0.6em] line-clamp-2 !text-[1.05em] !font-extrabold !leading-tight !text-[#0B1A37]">
          {back || person.upcoming ? (
            person.name
          ) : (
            // Its ::after covers the whole card, so a click anywhere on
            // it opens the profile (the button sits above it)
            <Link
              href={`/instructors/${person.id}`}
              tabIndex={live ? undefined : -1}
              className={`!text-[#0B1A37] !no-underline transition-colors after:absolute after:inset-0 after:rounded-[3.8em] after:content-[''] hover:!text-[#9B7930] ${live ? "" : "pointer-events-none"}`}
            >
              {person.name}
            </Link>
          )}
        </h3>
        <p className="!mb-0 mt-[0.3em] line-clamp-1 !text-[0.85em] !font-semibold !leading-snug !text-[#9B7930]">
          {person.role}
        </p>
        {!back && (
          <p className="!mb-0 mt-[0.25em] line-clamp-1 !text-[0.75em] !leading-snug !text-[#0B1A37]/65 max-sm:hidden">
            {person.upcoming
              ? "Joining soon"
              : `${person.experience} experience · ${person.students} students`}
          </p>
        )}
      </div>
      {/* Always in the same place at the foot of the card */}
      {!back && (
        <div className="shrink-0 pt-[0.7em]">
          <button
            type="button"
            onClick={onBook}
            tabIndex={live ? undefined : -1}
            className={`relative z-[1] !rounded-full bg-[#EECC65] px-[1.2em] py-[0.5em] text-[0.8em] font-bold text-[#0B1A37] shadow-[0_6px_16px_-6px_rgba(238,204,101,0.6)] transition-colors duration-300 hover:bg-[#F3D98A] ${live ? "" : "pointer-events-none"}`}
          >
            Book Free Trial
          </button>
        </div>
      )}
      {/* Hidden from behind too: Chrome can let a changing child show
                through a face that is turned away */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[3px] rounded-[3.8em] bg-white [-webkit-backface-visibility:hidden] [backface-visibility:hidden]"
        style={{ opacity: shade }}
      />
    </div>
  );
}

// A card stood in the ring at its own angle, pushed out to the rim, with a
// face on each side. Clicking a card that isn't at the front turns it there;
// pointing at any card tells the ring (`onHover`) so it can stop turning.
function RingCard({
  person,
  index,
  current,
  rotation,
  onSelect,
  onHover,
  onBook,
}) {
  // How far the card fades into the page: 0 facing the viewer, up to 0.55 at the back of the ring
  const shade = useTransform(
    rotation,
    (r) => (0.55 * (1 - Math.cos(((index * STEP + r) * Math.PI) / 180))) / 2,
  );

  return (
    <article
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${N}: ${person.name}, ${person.role}`}
      onClick={current ? undefined : onSelect}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      className={`absolute inset-0 [transform-style:preserve-3d] ${current ? "" : "cursor-pointer"}`}
      style={{ transform: `rotateY(${index * STEP}deg) translateZ(30em)` }}
    >
      <CardFace
        person={person}
        current={current}
        shade={shade}
        onBook={onBook}
      />
      <CardFace person={person} back shade={shade} />
    </article>
  );
}

// The instructors as a ring of cards seen from a little above, turning slowly
// by itself (not while the visitor points at a card, has focus on one, has
// scrolled away, has just moved it, or asks for reduced motion). Dragging
// turns it and lets it run on and settle on a card; the arrows, arrow keys
// and a click on a card turn it to that card.
// Everything is sized in em off the font size set here, so the ring grows and
// shrinks with the screen: a fixed size on phones and tablets, and on laptops
// whichever is smaller of the screen's width and height decides, so the
// heading, ring and buttons fit one screen.
function InstructorRing({ onBook }) {
  const ref = useRef(null);
  const dragged = useRef(false);
  const busy = useRef(false); // a drag or a turn is running
  const restUntil = useRef(0); // after a move, the spin waits until this time
  const turn = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [front, setFront] = useState(0);
  const rotation = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  // Turning as soon as any of it is on screen, not only once it's well in view
  const inView = useInView(ref, { amount: "some" });

  useMotionValueEvent(rotation, "change", (r) => setFront(frontAt(r)));

  useAnimationFrame((_, delta) => {
    if (hovered || focused || !inView || reduceMotion || busy.current) return;
    if (performance.now() < restUntil.current) return;
    rotation.set(rotation.get() - SPIN * (delta / 1000));
  });

  const turnTo = useCallback(
    (target, options) => {
      turn.current?.stop();
      busy.current = true;
      turn.current = animate(rotation, target, {
        ...options,
        onComplete: () => {
          busy.current = false;
          restUntil.current = performance.now() + 2500;
        },
      });
    },
    [rotation],
  );

  // One card on (1) or back (-1)
  const step = useCallback(
    (dir) => {
      const k = Math.round(-rotation.get() / STEP);
      turnTo(-(k + dir) * STEP, {
        duration: reduceMotion ? 0 : 0.7,
        ease: EASE,
      });
    },
    [rotation, turnTo, reduceMotion],
  );

  // Card i to the front, the shorter way round
  const bringToFront = useCallback(
    (i) => {
      const base = -i * STEP;
      const target = base + 360 * Math.round((rotation.get() - base) / 360);
      turnTo(target, { duration: reduceMotion ? 0 : 0.8, ease: EASE });
    },
    [rotation, turnTo, reduceMotion],
  );

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label="Instructor profiles"
      className="text-[12px] sm:text-[13px] lg:text-[clamp(11px,min(1vw,1.95vh),20px)]"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
    >
      {/* The scene. The room above and below is for the tilted ring: the
                back cards rise above the stage and the front ones hang below it.
                Focus here can only be on the front card's link or button, so
                the ring holds still while one of them has it. */}
      <motion.div
        className="overflow-x-clip pb-[9.5em] pt-[3em] [perspective:120em]"
        style={{ touchAction: "pan-y" }}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
        onPointerDownCapture={() => (dragged.current = false)}
        onPanStart={() => {
          dragged.current = true;
          turn.current?.stop();
          busy.current = true;
        }}
        onPan={(_, info) => rotation.set(rotation.get() + info.delta.x * DRAG)}
        onPanEnd={(_, info) => {
          // Run on in the direction thrown, then settle on the nearest card
          const velocity = info.velocity.x * DRAG;
          const target =
            Math.round((rotation.get() + velocity * 0.35) / STEP) * STEP;
          turnTo(
            target,
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", velocity, stiffness: 70, damping: 20 },
          );
        }}
        onClickCapture={(e) => {
          // A drag that ends on a card isn't also a click on it
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {/* Seen from a little above (front cards lower, back cards higher),
                    straight on, so both sides of the ring sit level */}
        <div
          className="relative mx-auto h-[17em] w-[17em] [transform-style:preserve-3d]"
          style={{ transform: "rotateX(-9deg)" }}
        >
          <motion.div
            className="absolute inset-0 [transform-style:preserve-3d]"
            style={{ rotateY: rotation }}
          >
            {ring.map((person, i) => (
              <RingCard
                key={person.id}
                person={person}
                index={i}
                current={i === front}
                rotation={rotation}
                onSelect={() => bringToFront(i)}
                onHover={setHovered}
                onBook={onBook}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* The trial button under the ring, with a small arrow either side */}
      <div className="mt-[0.75rem] flex items-center justify-center gap-[1rem]">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous instructor"
          className="grid h-[40px] w-[40px] place-items-center !rounded-full border-[1px] border-[#0B1A37]/15 text-[#0B1A37] transition-colors duration-300 hover:border-[#0B1A37] hover:bg-[#0B1A37] hover:text-[#EECC65]"
        >
          <ChevronLeft className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onBook}
          className="!rounded-full bg-[#EECC65] px-[2rem] py-[0.8rem] text-[0.95rem] font-bold text-[#0B1A37] shadow-[0_14px_30px_-12px_rgba(201,161,59,0.7)] transition-colors duration-300 hover:bg-[#F3D98A]"
        >
          Book Free Trial
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next instructor"
          className="grid h-[40px] w-[40px] place-items-center !rounded-full border-[1px] border-[#0B1A37]/15 text-[#0B1A37] transition-colors duration-300 hover:border-[#0B1A37] hover:bg-[#0B1A37] hover:text-[#EECC65]"
        >
          <ChevronRight className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// Phones: every teacher in one list, one under another, in place of the ring
// (on a narrow screen the ring shows only the card at the front). Each row
// opens that teacher's profile. Only the teachers, not the "joining soon"
// cards that fill the ring.
function InstructorList({ onBook }) {
  return (
    <div className="mx-auto w-full max-w-[30rem] px-[1rem] sm:px-[1.5rem]">
      {/* minmax(0,1fr) and min-w-0 keep each card inside the screen: without
          them the column grows to fit the longest line of text (on a 360px
          phone, or with the phone's text set larger) and pushes the cards out
          to the screen's edge. The words wrap rather than being cut short:
          a name takes two lines at most, breaking only between words (never
          at the hyphen in "Al-Rashid"), and the detail line after its dot. */}
      <ul id="all-teachers" className="!mb-0 mt-[1.25rem] grid list-none grid-cols-[minmax(0,1fr)] gap-[0.75rem] !pl-0">
        {instructors.map((person, i) => (
          <motion.li key={person.id} {...reveal(Math.min(i, 3) * 0.06, 16)} className="min-w-0">
            <Link
              href={`/instructors/${person.id}`}
              className="flex items-center gap-[0.9rem] rounded-[1.25rem] border-[1px] border-[#EECC65]/50 bg-white py-[0.7rem] pl-[0.7rem] pr-[0.9rem] text-left !no-underline shadow-[0_14px_30px_-22px_rgba(11,26,55,0.45)] transition-colors duration-300 hover:border-[#EECC65]"
            >
              <span className="h-[3.6rem] w-[3.6rem] shrink-0 rounded-full border-[2px] border-[#EECC65] p-[2px]">
                <img
                  src={person.image}
                  alt=""
                  className="h-full w-full rounded-full object-cover object-top"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[1rem] font-extrabold leading-tight text-[#0B1A37]">
                  {person.name.split(" ").map((word, k) => (
                    <Fragment key={k}>
                      {k > 0 && " "}
                      <span className="whitespace-nowrap">{word}</span>
                    </Fragment>
                  ))}
                </span>
                <span className="mt-[0.2rem] block text-[0.85rem] font-semibold leading-snug text-[#9B7930]">
                  {person.role}
                </span>
                <span className="mt-[0.1rem] block text-[0.78rem] leading-snug text-[#0B1A37]/60">
                  <span className="whitespace-nowrap">{person.experience} experience ·</span>{" "}
                  <span className="whitespace-nowrap">{person.students} students</span>
                </span>
              </span>
              <ChevronRight
                className="h-[18px] w-[18px] shrink-0 text-[#0B1A37]/40"
                aria-hidden="true"
              />
            </Link>
          </motion.li>
        ))}
      </ul>
      <div className="mt-[1.5rem] flex justify-center">
        <button
          type="button"
          onClick={onBook}
          className="!rounded-full bg-[#EECC65] px-[2rem] py-[0.8rem] text-[0.95rem] font-bold text-[#0B1A37] shadow-[0_14px_30px_-12px_rgba(201,161,59,0.7)] transition-colors duration-300 hover:bg-[#F3D98A]"
        >
          Book Free Trial
        </button>
      </div>
    </div>
  );
}

const Page = () => {
  const [open, setOpen] = useState(false);
  // Phones only: the list of every teacher in place of the ring
  const [showAll, setShowAll] = useState(false);
  const openEnroll = useCallback(() => setOpen(true), []);
  const closeEnroll = useCallback(() => setOpen(false), []);

  return (
    // Movement is turned off for visitors who ask their device for reduced motion
    <MotionConfig reducedMotion="user">
      <Header />
      <section className="page-content">
        {/* Hero: the words, two buttons and the numbers on the left, the
                    class photo on the right with a gold frame set off behind it.
                    On laptops it fills the first screen under the 84px header,
                    and the sizes follow the screen's height as well as its
                    width (like the home page's hero), so it all fits even on a
                    short screen. */}
        <section
          className="relative flex items-center overflow-hidden bg-[#FBF7EE] bg-cover bg-center lg:min-h-[calc(100svh-84px)]"
          style={{
            backgroundImage: "url(/assets/images/hero-banner/bg-lines.png)",
          }}
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-[2.5rem] px-[1rem] py-[clamp(2.5rem,7vh,5rem)] sm:px-[1.5rem] lg:grid-cols-[1.05fr_1fr] lg:gap-[clamp(2rem,4vw,4rem)] lg:px-[2rem] lg:py-[clamp(1.5rem,5vh,4rem)]">
            <div className="max-lg:text-center">
              <motion.div {...reveal(0)}>
                <Eyebrow>Our teachers</Eyebrow>
              </motion.div>
              <motion.h1
                initial="hidden"
                animate="shown"
                variants={wordsParent}
                className="!mb-0 mt-[clamp(0.6rem,2vh,1rem)] !text-[clamp(2rem,min(3.6vw,6.4vh),3.5rem)] !font-extrabold !leading-[1.1] !tracking-[-0.03em] !text-[#0B1A37] [text-wrap:balance]"
              >
                <Words text="Experienced Teachers. Personalized Learning." />
                <Accent text="Lasting Results." delay={0.3} />
              </motion.h1>
              <motion.p
                {...reveal(0.2)}
                className="!mb-0 mt-[clamp(0.75rem,2.4vh,1.25rem)] max-w-[34rem] !text-[clamp(0.95rem,2.3vh,1.05rem)] !leading-[1.7] !text-[#0B1A37]/65 max-lg:mx-auto"
              >
                Our dedicated Quran teachers combine authentic Islamic knowledge
                with patient, engaging teaching methods to help students achieve
                their learning goals from the comfort of home.
              </motion.p>

              <motion.div
                {...reveal(0.3)}
                className="mt-[clamp(1rem,3.6vh,2rem)] flex flex-wrap items-center justify-center gap-[0.6rem] sm:gap-[0.9rem] lg:justify-start"
              >
                <button
                  type="button"
                  onClick={openEnroll}
                  className="group inline-flex items-center gap-[0.5rem] !rounded-full bg-[#EECC65] py-[0.4rem] pl-[0.95rem] pr-[0.4rem] text-[0.88rem] sm:gap-[0.9rem] sm:pl-[1.6rem] sm:text-[0.95rem] font-bold text-[#0B1A37] shadow-[0_18px_40px_-16px_rgba(201,161,59,0.7)]"
                >
                  Book Free Trial
                  <span className="grid h-[32px] w-[32px] sm:h-[38px] sm:w-[38px] place-items-center rounded-full bg-[#0B1A37] text-[#EECC65] transition-transform duration-300 group-hover:-rotate-45">
                    <ArrowRight
                      className="h-[17px] w-[17px]"
                      aria-hidden="true"
                    />
                  </span>
                </button>
                <a
                  href="#teachers"
                  className="inline-flex items-center rounded-full border-[1px] border-[#0B1A37]/20 px-[0.95rem] py-[0.8rem] text-[0.88rem] sm:px-[1.5rem] sm:text-[0.95rem] font-semibold !text-[#0B1A37] !no-underline transition-colors duration-300 hover:border-[#0B1A37] hover:bg-[#0B1A37] hover:!text-white"
                >
                  Meet the teachers
                </a>
              </motion.div>

              <motion.dl
                {...reveal(0.4)}
                className="!mb-0 mt-[clamp(1.25rem,4vh,2.5rem)] grid max-w-[30rem] grid-cols-3 divide-x divide-[#0B1A37]/10 max-lg:mx-auto"
              >
                {stats.map((stat) => (
                  // justify-end packs to the top in a reversed column, so the numbers line up even when a label wraps
                  <div
                    key={stat.label}
                    className="flex flex-col-reverse justify-end px-[0.75rem] first:pl-0 last:pr-0 max-lg:items-center"
                  >
                    <dt className="mt-[0.2rem] text-[0.78rem] !font-medium leading-snug text-[#0B1A37]/60">
                      {stat.label}
                    </dt>
                    <dd className="!mb-0 text-[clamp(1.3rem,min(2.4vw,4vh),1.75rem)] font-extrabold leading-none tracking-[-0.02em] text-[#0B1A37]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            {/* On laptops no wider than lets the photo (1058×720) stay
                            12rem shorter than the screen. On phones a little
                            narrower and to the left, so the gold frame behind
                            keeps clear of the screen's right edge. */}
            <motion.div
              {...reveal(0.15)}
              className="relative mx-auto w-full max-w-[36rem] max-sm:ml-0 max-sm:w-[calc(100%-1rem)] lg:max-w-[min(100%,calc((100svh_-_12rem)*1.47))]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[0.9rem] translate-y-[0.9rem] rounded-[1.75rem] border-[1.5px] border-[#EECC65]/80"
              />
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgba(11,26,55,0.55)] ring-1 ring-[#0B1A37]/[0.06]">
                <Image
                  src="/teacher-hero.png"
                  alt="Child learning Quran online with a qualified teacher"
                  width={1058}
                  height={720}
                  sizes="(min-width: 1024px) 40vw, 36rem"
                  className="h-auto w-full"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* The instructors: one screen tall on laptops (under the slim
                    68px header), the heading and the ring centred in it. `safe`
                    centring: if a screen is too short for it all, it runs on
                    downwards rather than up under the header. */}
        <section
          id="teachers"
          className="relative isolate flex scroll-mt-[68px] flex-col justify-center overflow-hidden bg-white py-[clamp(1.25rem,4vh,4rem)] [justify-content:safe_center] lg:min-h-[calc(100svh-68px)]"
        >
          {/* w-full: in this column, auto margins alone would shrink a box to its content */}
          <div className="mx-auto w-full max-w-7xl px-[1rem] text-center sm:px-[1.5rem] lg:px-[2rem]">
            <motion.p
              {...reveal(0)}
              className="!mb-0 !text-[1rem] !font-medium !text-[#0B1A37]/60"
            >
              Islamic Studies
            </motion.p>
            <SectionHeading className="mt-[0.35rem]">
              <Words text="Instructor Profiles" />
            </SectionHeading>
            {/* Above the ring or list, so it stays where it is when the
                long list folds away */}
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              aria-controls="all-teachers"
              className="mt-[0.9rem] inline-flex items-center gap-[0.5rem] !rounded-full border-[1px] border-[#0B1A37]/20 px-[1.25rem] py-[0.55rem] text-[0.9rem] font-semibold text-[#0B1A37] transition-colors duration-300 hover:border-[#0B1A37] hover:bg-[#0B1A37] hover:text-white md:hidden"
            >
              {showAll ? (
                <ChevronUp className="h-[16px] w-[16px]" aria-hidden="true" />
              ) : (
                <LayoutList className="h-[16px] w-[16px]" aria-hidden="true" />
              )}
              {showAll ? "Show less" : "See all teachers"}
            </button>
          </div>

          <div
            className={`mx-auto mt-[clamp(0.25rem,1.5vh,1.25rem)] w-full max-w-[88rem] ${showAll ? "max-md:hidden" : ""}`}
          >
            <InstructorRing onBook={openEnroll} />
          </div>
          {showAll && (
            <div className="md:hidden">
              <InstructorList onBook={openEnroll} />
            </div>
          )}
        </section>
      </section>
      <Footer />
      <EnrollModal open={open} onClose={closeEnroll} />
    </MotionConfig>
  );
};

export default Page;
