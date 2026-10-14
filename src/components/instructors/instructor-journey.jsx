"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, PageTitle, SectionHeading, Words, accentClass } from "@/components/lux/effects";
import { RosetteMark } from "@/components/courses/roadmap-art";

// An instructor's profile page: the booking card with their photo on the
// left, and on the right their figures, their career on a gold timeline and
// their qualifications; then their biography and a few other instructors.

const GOLD_TEXT = "bg-[linear-gradient(180deg,#F6E39A_0%,#D4AF37_55%,#C39A32_100%)] bg-clip-text !text-transparent";

// "Sheikh Abdullah Al-Rashid" → "Sheikh Abdullah"
const shortName = (name) => name.split(" ").slice(0, 2).join(" ");

// A one-word label for a qualification, from its wording
function credentialKind(text) {
  const kinds = [
    ["Hafiz", "Hifz"],
    ["Ijazah", "Ijazah"],
    ["B.A.", "Degree"],
    ["Diploma", "Diploma"],
    ["Certificate", "Certificate"],
    ["Specialization", "Specialization"],
    ["Trained", "Training"],
  ];
  return kinds.find(([word]) => text.includes(word))?.[1] ?? "Qualification";
}

// A small heading over each part: spaced gold capitals after a short line
function PartHeading({ children }) {
  return (
    <h2 className="!mb-0 flex items-center gap-[0.75rem] !text-[0.78rem] !font-bold uppercase !leading-[1.4] tracking-[0.22em] !text-[#9B7930]">
      <span aria-hidden="true" className="h-px w-[1.75rem] bg-current" />
      {children}
    </h2>
  );
}

// An instructor's photo in a gold ring. Plain <img>: some photos are on
// hosts next.config doesn't list for next/image.
function Portrait({ instructor, className = "" }) {
  return (
    <span className={`block rounded-full bg-[linear-gradient(140deg,#F6E39A,#D4AF37_45%,#A97E22)] p-[4px] shadow-[0_14px_30px_-10px_rgba(11,30,54,0.55)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={instructor.image} alt={instructor.name} className="h-full w-full rounded-full border-[3px] border-[#0B1E36] object-cover" />
    </span>
  );
}

// The booking card: the photo half over its top, and the button that opens
// the free-trial form
function BookingCard({ instructor, onBook }) {
  return (
    <motion.div {...reveal(0.05, 20)} className="mx-auto flex w-full max-w-[22rem] flex-col items-center lg:max-w-none">
      <Portrait
        instructor={instructor}
        className="relative z-[1] -mb-[5rem] h-[10rem] w-[10rem] !p-[5px] lg:-mb-[5.75rem] lg:h-[11.5rem] lg:w-[11.5rem]"
      />
      <div className="w-full rounded-[1.25rem] border-[1px] border-[#D4AF37]/45 bg-[#0B1E36] px-[1.4rem] pb-[1.6rem] pt-[6rem] text-center lg:pt-[6.75rem] shadow-[0_24px_48px_-18px_rgba(11,30,54,0.55),0_8px_18px_-8px_rgba(11,30,54,0.35)]">
        <h2 className="!mb-0 !text-[1.3rem] !font-extrabold !leading-[1.25] !tracking-[-0.02em] text-white">
          Schedule Your <span className={accentClass("dark")}>Trial Class</span>
        </h2>
        <p className="!mb-0 mt-[0.6rem] !text-[0.9rem] !leading-[1.6] !text-white/80">
          Book a free trial class with {shortName(instructor.name)}: live and one-to-one, at a time that suits you.
        </p>
        <button
          type="button"
          onClick={onBook}
          className="group/btn relative mt-[1.25rem] inline-flex items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#F6E39A_0%,#D4AF37_50%,#B38A2C_100%)] px-[2rem] py-[0.7rem] text-[0.8rem] !font-extrabold uppercase tracking-[0.14em] !text-[#0B1E36] shadow-[0_6px_16px_-6px_rgba(212,175,55,0.75),inset_0_1px_0_rgba(255,255,255,0.55)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#F1D67E]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-[40%] w-[30%] -skew-x-12 bg-white/45 blur-[2px] transition-transform duration-700 group-hover/btn:translate-x-[480%] motion-reduce:hidden"
          />
          <span className="relative">Book Session</span>
        </button>
      </div>
    </motion.div>
  );
}

// Years, students, rating and courses in one strip (hairline dividers: the
// gold shows through 1px gaps between white cells)
function Figures({ instructor }) {
  const figures = [
    { value: `${parseInt(instructor.experience, 10)}+`, label: "Years teaching" },
    { value: instructor.students, label: "Students" },
    { value: instructor.rating, label: "Rating", star: true },
    { value: instructor.totalCourses, label: "Courses" },
  ];
  return (
    <motion.dl
      {...reveal(0.1, 16)}
      className="!mb-0 grid grid-cols-2 gap-[1px] overflow-hidden rounded-[1.1rem] border-[1px] border-[#D4AF37]/35 bg-[#D4AF37]/25 shadow-[0_14px_34px_-22px_rgba(11,30,54,0.4)] sm:grid-cols-4"
    >
      {figures.map((f) => (
        <div key={f.label} className="flex flex-col-reverse items-center bg-white px-[0.75rem] py-[1.1rem] text-center">
          <dt className="mt-[0.35rem] text-[0.64rem] font-bold uppercase tracking-[0.18em] text-[#0B1E36]/55">{f.label}</dt>
          <dd className="!mb-0 inline-flex items-center gap-[0.3rem] text-[1.65rem] font-extrabold leading-none tracking-[-0.02em]">
            {f.star && <Star className="h-[1rem] w-[1rem] fill-[#D4AF37] text-[#D4AF37]" aria-hidden="true" />}
            <span className={GOLD_TEXT}>{f.value}</span>
          </dd>
        </div>
      ))}
    </motion.dl>
  );
}

// The career, newest first: navy cards on a fine gold line, each hung from a
// rosette on it
function Career({ career }) {
  return (
    <div className="mt-[2.75rem]">
      <PartHeading>Teaching career</PartHeading>
      <ol className="relative !mb-0 mt-[1.25rem] list-none !pl-0">
        <span
          aria-hidden="true"
          className="absolute bottom-[2.5rem] left-[calc(1.1rem-1px)] top-[2.5rem] w-[2px] rounded-full bg-[linear-gradient(180deg,#D4AF37,rgba(212,175,55,0.35))]"
        />
        {career.map((job, i) => (
          <motion.li key={job.period} {...reveal(0.1 * i, 16)} className="relative !m-0 flex items-center gap-[0.6rem] pb-[1rem] last:pb-0">
            <RosetteMark filled className="relative z-[1] h-[2.2rem] w-[2.2rem] shrink-0 drop-shadow-[0_4px_8px_rgba(11,30,54,0.3)]" />
            <span aria-hidden="true" className="h-[2px] w-[0.9rem] shrink-0 bg-[#D4AF37]/70" />
            <article className="min-w-0 flex-1 rounded-[1rem] border-[1px] border-[#D4AF37]/40 bg-[#0B1E36] px-[1.2rem] py-[1rem] shadow-[0_18px_36px_-20px_rgba(11,30,54,0.55)] sm:flex sm:items-center sm:justify-between sm:gap-[1rem]">
              <div className="min-w-0">
                <h3 className="!mb-0 !text-[1rem] !font-bold !leading-[1.3] !text-white">{job.title}</h3>
                <p className="!mb-0 mt-[0.2rem] !text-[0.84rem] !leading-[1.45] !text-white/70">{job.org}</p>
              </div>
              <span className="mt-[0.6rem] inline-block whitespace-nowrap rounded-full border-[1px] border-[#D4AF37]/50 px-[0.75rem] py-[0.25rem] text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[#D4AF37] sm:mt-0 sm:shrink-0">
                {job.period}
              </span>
            </article>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

// The qualifications, two to a row, each with a gold rosette
function Qualifications({ qualifications }) {
  return (
    <div className="mt-[2.75rem]">
      <PartHeading>Qualifications</PartHeading>
      <ul className="!mb-0 mt-[1.25rem] grid list-none gap-[0.9rem] !pl-0 sm:grid-cols-2">
        {qualifications.map((q, i) => (
          <motion.li
            key={q}
            {...reveal(0.08 * i, 16)}
            className="!m-0 flex items-start gap-[0.8rem] rounded-[1rem] border-[1px] border-[#D4AF37]/35 bg-white/90 p-[1rem] shadow-[0_12px_28px_-20px_rgba(11,30,54,0.45)]"
          >
            <RosetteMark className="mt-[0.1rem] h-[2.1rem] w-[2.1rem] shrink-0" />
            <div className="min-w-0">
              <p className="!mb-0 !text-[0.64rem] !font-bold uppercase !leading-[1.4] tracking-[0.2em] !text-[#9B7930]">{credentialKind(q)}</p>
              <p className="!mb-0 mt-[0.2rem] !text-[0.9rem] !font-semibold !leading-[1.45] !text-[#0B1E36]">{q}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// The top of the page: the name and role, then the booking card (it stays
// in view on laptops while the rest scrolls past) beside the figures, the
// career and the qualifications.
export function InstructorJourney({ instructor, onBook }) {
  return (
    <section aria-labelledby="journey-title" className="bg-white pb-[4.5rem] pt-[2.75rem] lg:pb-[6rem] lg:pt-[3.25rem]">
      <div className="mx-auto w-full max-w-[72rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        <div className="mx-auto max-w-[48rem] text-center">
          <motion.div {...reveal(0, 12)}>
            {/* On phones it takes two lines: without its rule there, so
                the two lines stay centred under each other */}
            <Eyebrow className="[text-wrap:balance] max-sm:[&>span:first-child]:hidden">Scholar&apos;s Professional Journey</Eyebrow>
          </motion.div>
          <PageTitle id="journey-title" className="mt-[clamp(0.6rem,2vh,1rem)]">
            <Words text={instructor.name.split(" ").slice(0, -1).join(" ")} />
            <Accent text={instructor.name.split(" ").at(-1)} delay={0.2} />
          </PageTitle>
          <motion.div {...reveal(0.2, 16)}>
            <Lead className="mt-[0.6rem]">{instructor.role} · Quran West Academy</Lead>
          </motion.div>
        </div>

        <div className="mt-[3.5rem] grid gap-[3rem] lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-[3.5rem] xl:gap-[4.5rem]">
          <div className="lg:sticky lg:top-[7rem] lg:self-start">
            <BookingCard instructor={instructor} onBook={onBook} />
          </div>
          <div className="lg:pt-[1rem]">
            <Figures instructor={instructor} />
            <Career career={instructor.career} />
            <Qualifications qualifications={instructor.qualifications} />
          </div>
        </div>
      </div>
    </section>
  );
}

// The instructor's biography
export function InstructorAbout({ instructor }) {
  return (
    <section className="bg-[#FBF8F1] py-[3.5rem] lg:py-[4.5rem]">
      <motion.div {...reveal(0)} className="mx-auto w-full max-w-[52rem] px-[1rem] text-center sm:px-[1.5rem]">
        <Eyebrow>Biography</Eyebrow>
        <SectionHeading className="mt-[1rem]">
          <Words text="About" />
          <Accent text={shortName(instructor.name)} delay={0.1} />
        </SectionHeading>
        {/* a reading width of about 75 characters a line */}
        <Lead className="mx-auto mt-[1.1rem] max-w-[44rem]">{instructor.bio}</Lead>
      </motion.div>
    </section>
  );
}

// A few of the other instructors, each a link to their page
export function OtherInstructors({ instructors }) {
  return (
    <section className="bg-white py-[3.5rem] lg:py-[4.5rem]">
      <div className="mx-auto w-full max-w-[78rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]">
        <div className="flex flex-wrap items-end justify-between gap-[1rem]">
          <div>
            <Eyebrow>Our teachers</Eyebrow>
            <SectionHeading className="mt-[1rem]">
              <Words text="Meet Other" />
              <Accent text="Instructors" delay={0.15} />
            </SectionHeading>
          </div>
          <Link
            href="/instructors"
            className="inline-flex items-center gap-[0.35rem] text-[0.8rem] font-bold uppercase tracking-[0.12em] !text-[#9B7930] transition-colors hover:!text-[#0B1E36]"
          >
            View all
            <ArrowRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-[2rem] grid gap-[1.25rem] sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((person, i) => (
            <motion.div key={person.id} {...reveal(0.08 * i, 20)}>
              <Link
                href={`/instructors/${person.id}`}
                className="group flex items-center gap-[1rem] rounded-[1.1rem] border-[1px] border-[#D4AF37]/40 bg-[#0B1E36] p-[1.1rem] !no-underline shadow-[0_20px_40px_-20px_rgba(11,30,54,0.55)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-[4px] hover:border-[#D4AF37]/90 hover:shadow-[0_28px_50px_-20px_rgba(11,30,54,0.6),0_0_26px_-8px_rgba(212,175,55,0.45)]"
              >
                <Portrait instructor={person} className="h-[4.5rem] w-[4.5rem] shrink-0 !p-[3px]" />
                <div className="min-w-0">
                  <h3 className="!mb-0 !text-[1.05rem] !font-extrabold !leading-[1.25] !tracking-[-0.01em]">
                    <span className={GOLD_TEXT}>{person.name}</span>
                  </h3>
                  <p className="!mb-0 mt-[0.2rem] !text-[0.82rem] !text-white/70">{person.role}</p>
                  <span className="mt-[0.45rem] inline-flex items-center gap-[0.3rem] text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#D4AF37]">
                    View profile
                    <ArrowRight className="h-[0.8rem] w-[0.8rem] transition-transform duration-300 group-hover:translate-x-[3px]" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
