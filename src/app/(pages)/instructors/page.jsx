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

const ring = spread(instructors, upcomingInstructors);
const N = ring.length;
const STEP = 360 / N;
const SPIN = 9;
const DRAG = 0.12;

const mod = (n, m) => ((n % m) + m) % m;

const frontAt = (r) => mod(Math.round(-r / STEP), N);

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

      <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
        <h3 className="!mb-0 mt-[0.6em] line-clamp-2 !text-[1.05em] !font-extrabold !leading-tight !text-[#0B1A37]">
          {back || person.upcoming ? (
            person.name
          ) : (
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

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[3px] rounded-[3.8em] bg-white [-webkit-backface-visibility:hidden] [backface-visibility:hidden]"
        style={{ opacity: shade }}
      />
    </div>
  );
}

function RingCard({
  person,
  index,
  current,
  rotation,
  onSelect,
  onHover,
  onBook,
}) {
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

function InstructorRing({ onBook }) {
  const ref = useRef(null);
  const dragged = useRef(false);
  const busy = useRef(false);
  const restUntil = useRef(0);
  const turn = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [front, setFront] = useState(0);
  const rotation = useMotionValue(0);
  const reduceMotion = useReducedMotion();

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
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
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

function InstructorList({ onBook }) {
  return (
    <div className="mx-auto w-full max-w-[30rem] px-[1rem] sm:px-[1.5rem]">
      <ul
        id="all-teachers"
        className="!mb-0 mt-[1.25rem] grid list-none grid-cols-[minmax(0,1fr)] gap-[0.75rem] !pl-0"
      >
        {instructors.map((person, i) => (
          <motion.li
            key={person.id}
            {...reveal(Math.min(i, 3) * 0.06, 16)}
            className="min-w-0"
          >
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
                  <span className="whitespace-nowrap">
                    {person.experience} experience ·
                  </span>{" "}
                  <span className="whitespace-nowrap">
                    {person.students} students
                  </span>
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
    <MotionConfig reducedMotion="user">
      <Header />
      <section className="page-content">
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

        <section
          id="teachers"
          className="relative isolate flex scroll-mt-[68px] flex-col justify-center overflow-hidden bg-white py-[clamp(1.25rem,4vh,4rem)] [justify-content:safe_center] lg:min-h-[calc(100svh-68px)]"
        >
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
