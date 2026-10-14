"use client";

import { useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { FaArrowRight, FaGlobeEurope, FaPlay, FaQuoteLeft, FaStar } from "react-icons/fa";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import Goldenlines from "@/components/goldenlines";
import { Accent, PageTitle, SectionHeading as LuxHeading, Words, leadClass } from "@/components/lux/effects";
import EnrollModal from "@/components/enroll-modal";
import {
  COURSES,
  GOOGLE_RATING,
  GOOGLE_REVIEWS_URL,
  TRUST_REGIONS,
  TRUSTPILOT_URL,
  studentStories,
  videoReviews,
  writtenReviews,
} from "./data";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut", delay },
});

// Card entrances, a different one for each kind of card:
// - video cards zoom up into place, one after another
const videoEntrance = (i) => ({
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 140, damping: 18, delay: i * 0.12 },
  },
});
// - review cards come in from the left, from below or from the right,
//   depending on their column (left one tilted, right one tilted the other way)
const REVIEW_FROM = [
  { x: -40, y: 0, rotate: -2, scale: 1 },
  { x: 0, y: 44, rotate: 0, scale: 0.96 },
  { x: 40, y: 0, rotate: 2, scale: 1 },
];
const reviewEntrance = (pos) => ({
  hidden: { opacity: 0, ...REVIEW_FROM[pos % 3] },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 17, delay: (pos % 3) * 0.08 },
  },
});
// - their stars then pop in one by one
const starPop = (i) => ({
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 14, delay: 0.3 + i * 0.07 },
  },
});
// - story cards slide in from opposite sides
const storyEntrance = (i) => ({
  hidden: { opacity: 0, x: i % 2 === 0 ? -70 : 70 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
});
const HOVER_LIFT = { y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } };

// Navy outline button that fills navy with gold text on hover (the theme's
// btn-outline-primary is green)
const OUTLINE_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-[8px] rounded-[12px] border-[2px] border-solid border-[#0B1A37] !bg-transparent px-[26px] py-[12px] text-[15px] font-semibold !text-[#0B1A37] !no-underline transition-colors duration-200 hover:!bg-[#0B1A37] hover:!text-[#EECC65]";

// Written reviews shown before "Show more reviews", and how many it adds
const PAGE_SIZE = 9;

// Filters; each one only shows when 2 or more reviews match it
const countries = [...new Set(writtenReviews.map((r) => r.country))];
const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "kids", label: "Kids", test: (r) => r.audience === "kids" },
  { id: "adults", label: "Adults", test: (r) => r.audience === "adults" },
  { id: "hifz", label: "Hifz", test: (r) => r.course === "hifz" },
  { id: "tajweed", label: "Tajweed", test: (r) => r.course === "tajweed" },
  { id: "qaida", label: "Qaida", test: (r) => r.course === "qaida" },
  ...countries.map((c) => ({ id: c, label: c, test: (r) => r.country === c })),
].filter((f) => f.id === "all" || writtenReviews.filter(f.test).length >= 2);

// "Sara A." → "SA" for the initials circle
const initialsOf = (name) =>
  name
    .replace(/[[\]]/g, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// "Parent · [Birmingham], UK · Noorani Qaida · [8] months · [March 2026]"
const detailsOf = ({ role, city, country, course, months, date }) =>
  [role, `${city}, ${country}`, COURSES[course].label, `${months} months`, date]
    .filter(Boolean)
    .join(" · ");

function SampleTag() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-[#EECC65]/25 px-[10px] py-[3px] text-[11px] font-bold uppercase tracking-[0.1em] text-[#6f5419]">
      Sample
    </span>
  );
}

function Stars({ count }) {
  return (
    <span className="flex gap-[3px]" role="img" aria-label={`${count} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span key={i} className="inline-flex" variants={starPop(i)}>
          <FaStar
            aria-hidden="true"
            className={`h-[15px] w-[15px] ${i < count ? "text-[#EECC65]" : "text-[#0B1A37]/15"}`}
          />
        </motion.span>
      ))}
    </span>
  );
}

function CourseLink({ course, className = "" }) {
  const { page, href } = COURSES[course];
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-[8px] text-[14px] font-semibold !text-[#9B7930] !no-underline hover:!text-[#0B1A37] ${className}`}
    >
      {page} course
      <FaArrowRight
        className="h-[11px] w-[11px] transition-transform duration-200 group-hover:translate-x-[3px]"
        aria-hidden="true"
      />
    </Link>
  );
}

// A section's heading in the home page's style: `title`, then `accent` in
// the gold serif, and an intro line under it
function SectionHeading({ title, accent, intro }) {
  return (
    <motion.div className="mx-auto max-w-[720px] text-center" {...fadeUp(0)}>
      <LuxHeading>
        <Words text={title} />
        <Accent text={accent} delay={0.15} />
      </LuxHeading>
      {intro && <p className={`!mt-[14px] ${leadClass()}`}>{intro}</p>}
    </motion.div>
  );
}

function VideoCard({ video, index }) {
  return (
    <motion.article
      className="group flex flex-col overflow-hidden rounded-[18px] border-[1px] border-solid border-[#0B1A37]/10 bg-white shadow-[0_8px_24px_rgba(11,26,55,0.07)] transition-[border-color,box-shadow] duration-300 hover:border-[#EECC65] hover:shadow-[0_16px_36px_rgba(11,26,55,0.14)]"
      variants={videoEntrance(index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={HOVER_LIFT}
    >
      {video.youtubeId ? (
        <iframe
          className="block aspect-video w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?cc_load_policy=1&rel=0`}
          title={`Video review from ${video.name}`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        // Placeholder until the family's video is added
        <div className="relative grid aspect-video w-full place-items-center bg-[#0B1A37]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(238,204,101,0.18),transparent_65%)]"
          />
          <div className="relative flex flex-col items-center gap-[10px]">
            <span className="grid h-[58px] w-[58px] place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] shadow-[0_0_0_8px_rgba(238,204,101,0.18)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_0_12px_rgba(238,204,101,0.22)]">
              <FaPlay className="ml-[3px] h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">
              Video coming soon
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-[20px]">
        <div className="flex items-start justify-between gap-[10px]">
          <p className="!m-0 !text-[16px] !font-bold !text-[#0B1A37]">{video.name}</p>
          {video.sample && <SampleTag />}
        </div>
        <p className="!mt-[4px] !mb-0 !text-[13px] !leading-snug !text-[#3b4456]/80">
          {[video.role, `${video.city}, ${video.country}`, COURSES[video.course].label, `${video.months} months with Quran West`].join(" · ")}
        </p>
        <p className="!mt-[12px] !mb-0 !text-[15px] !italic !leading-relaxed !text-[#3b4456]">
          “{video.summary}”
        </p>
      </div>
    </motion.article>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="flex h-full flex-col rounded-[18px] border-[1px] border-solid border-[#0B1A37]/[0.08] bg-white p-[24px] shadow-[0_8px_24px_rgba(11,26,55,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[#EECC65] hover:shadow-[0_16px_36px_rgba(11,26,55,0.13)]">
      <div className="flex items-center justify-between gap-[10px]">
        <Stars count={review.stars} />
        {review.sample && <SampleTag />}
      </div>
      <p className="!mt-[16px] !mb-0 !text-[15px] !leading-relaxed !text-[#3b4456]">“{review.text}”</p>
      <div className="mt-auto pt-[20px]">
        <div className="flex items-center gap-[12px] border-t-[1px] border-solid border-[#0B1A37]/[0.08] pt-[16px]">
          {review.photo ? (
            <img
              src={review.photo}
              alt={review.name}
              className="h-[44px] w-[44px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-[#0B1A37] text-[14px] font-bold tracking-[0.04em] text-[#EECC65]"
            >
              {initialsOf(review.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="!m-0 !text-[15px] !font-bold !text-[#0B1A37]">{review.name}</p>
            <p className="!mt-[2px] !mb-0 !text-[13px] !leading-snug !text-[#3b4456]/80">{detailsOf(review)}</p>
          </div>
        </div>
        <CourseLink course={review.course} className="mt-[14px]" />
      </div>
    </article>
  );
}

// Every review stays in the page's HTML; filtered-out ones and those past the
// "Show more" limit are only hidden
function ReviewGrid() {
  const [filterId, setFilterId] = useState("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const filter = FILTERS.find((f) => f.id === filterId);
  const matching = writtenReviews.filter(filter.test);
  const shown = matching.slice(0, limit);

  return (
    <>
      <div
        role="group"
        aria-label="Filter reviews"
        className="mx-auto mt-[32px] flex max-w-[860px] flex-wrap justify-center gap-[8px]"
      >
        {FILTERS.map(({ id, label }) => {
          const active = id === filterId;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilterId(id);
                setLimit(PAGE_SIZE);
              }}
              className={`cursor-pointer rounded-full !border-none px-[16px] py-[8px] text-[14px] font-semibold transition-colors ${
                active
                  ? "!bg-[#0B1A37] !text-[#EECC65]"
                  : "!bg-white !text-[#0B1A37] shadow-[0_2px_8px_rgba(11,26,55,0.06)] hover:!bg-[#EECC65]/30"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-[28px] grid gap-[20px] md:grid-cols-2 lg:grid-cols-3">
        {writtenReviews.map((review, i) => {
          // Position among the cards on show; picks the card's entrance. The
          // key includes the filter, so cards animate in again when it changes.
          const pos = shown.indexOf(review);
          return (
            <motion.div
              key={`${filterId}-${i}`}
              className={pos === -1 ? "hidden" : ""}
              variants={reviewEntrance(Math.max(pos, 0))}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={HOVER_LIFT}
            >
              <ReviewCard review={review} />
            </motion.div>
          );
        })}
      </div>

      {matching.length > limit && (
        <div className="mt-[32px] text-center">
          <button
            type="button"
            onClick={() => setLimit(limit + PAGE_SIZE)}
            className={OUTLINE_BUTTON}
          >
            Show more reviews
          </button>
        </div>
      )}
    </>
  );
}

function StoryCard({ story, index, onTrial }) {
  const parts = [
    ["Before", story.before],
    ["Why Quran West", story.why],
    ["The teacher", story.teacher],
    ["Now", story.now],
  ];
  return (
    <motion.article
      className="rounded-[20px] border-[1px] border-solid border-[#0B1A37]/10 bg-white p-[24px] shadow-[0_10px_30px_rgba(11,26,55,0.07)] md:p-[36px]"
      variants={storyEntrance(index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-[10px]">
        <h3 className="!m-0 !text-[20px] !font-bold !leading-snug !text-[#0B1A37] md:!text-[24px]">
          {story.title}
        </h3>
        {story.sample && <SampleTag />}
      </div>
      <p className="!mt-[8px] !mb-0 !text-[14px] !text-[#3b4456]/80">
        {[story.name, story.role, `${story.city}, ${story.country}`, COURSES[story.course].label, `${story.months} months with Quran West`].join(" · ")}
      </p>

      <div className="mt-[24px] grid gap-x-[32px] gap-y-[20px] md:grid-cols-2">
        {parts.map(([label, text]) => (
          <div key={label}>
            <p className="!m-0 !text-[12px] !font-bold uppercase tracking-[0.12em] !text-[#9B7930]">{label}</p>
            <p className="!mt-[6px] !mb-0 !text-[15px] !leading-relaxed !text-[#3b4456] md:!text-[16px]">{text}</p>
          </div>
        ))}
      </div>

      <blockquote className="!mt-[24px] !mb-0 flex gap-[14px] rounded-[14px] border-l-[4px] border-solid border-[#EECC65] bg-[#F3F5F9] px-[20px] py-[16px]">
        <FaQuoteLeft className="mt-[3px] h-[16px] w-[16px] shrink-0 text-[#EECC65]" aria-hidden="true" />
        <p className="!m-0 !text-[16px] !italic !leading-relaxed !text-[#0B1A37]">{story.quote}</p>
      </blockquote>

      <div className="mt-[20px] flex flex-wrap items-center gap-x-[14px] gap-y-[10px] sm:gap-x-[20px]">
        <CourseLink course={story.course} />
        <button
          type="button"
          onClick={onTrial}
          className="group inline-flex cursor-pointer items-center gap-[8px] !border-none !bg-transparent !p-0 text-[14px] font-semibold !text-[#9B7930] hover:!text-[#0B1A37]"
        >
          Book a Free Trial
          <FaArrowRight
            className="h-[11px] w-[11px] transition-transform duration-200 group-hover:translate-x-[3px]"
            aria-hidden="true"
          />
        </button>
      </div>
    </motion.article>
  );
}

function TrialButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn btn-secondary btn-standard btn-lg w-full sm:w-auto ${className}`}
    >
      Book a Free Trial
      <span className="btn-icon">
        <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
      </span>
    </button>
  );
}

const Page = () => {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const openTrial = () => setEnrollOpen(true);

  return (
    // Movement is turned off for visitors who ask their device for reduced motion
    <MotionConfig reducedMotion="user">
      <Header />
      <section className="page-content">
        {/* begin::Hero */}
        <section className="relative overflow-hidden bg-[#0B1A37] px-[16px] py-[64px] text-center md:py-[88px]">
          <Goldenlines />
          <motion.div
            className="relative mx-auto max-w-[760px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <PageTitle tone="dark">
              <Words text="Quran West" />
              <Accent text="Reviews" tone="dark" delay={0.12} />
            </PageTitle>
            <p className={`!mx-auto !mt-[14px] max-w-[560px] text-balance ${leadClass("dark")}`}>
              Real stories from families learning the Quran with us.
            </p>

            {GOOGLE_RATING && (
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[22px] inline-flex flex-wrap items-center justify-center gap-x-[8px] gap-y-[4px] rounded-full bg-white/10 px-[18px] py-[8px] text-[15px] font-semibold !text-white !no-underline hover:bg-white/15"
              >
                <FaStar className="h-[15px] w-[15px] text-[#EECC65]" aria-hidden="true" />
                {GOOGLE_RATING.score} from {GOOGLE_RATING.count} Google reviews
                <span className="text-[#EECC65]">· Read them on Google →</span>
              </a>
            )}

            <p className="!mt-[18px] !mb-0 inline-flex items-center gap-[8px] !text-[15px] !text-white/70">
              <FaGlobeEurope className="h-[15px] w-[15px] text-[#EECC65]" aria-hidden="true" />
              Trusted by families in {TRUST_REGIONS}
            </p>
            <div className="mt-[24px]">
              <TrialButton onClick={openTrial} />
            </div>
          </motion.div>
        </section>
        {/* end::Hero */}

        {/* begin::Video reviews */}
        <section className="section-area section-sp1 bg-white">
          <div className="container">
            <SectionHeading
              title="Hear It From"
              accent="Our Families"
              intro="Parents and students, in their own words."
            />
            <div className="mt-[40px] grid gap-[20px] md:grid-cols-3">
              {videoReviews.map((video, i) => (
                <VideoCard key={i} video={video} index={i} />
              ))}
            </div>
          </div>
        </section>
        {/* end::Video reviews */}

        {/* begin::Written reviews */}
        <section className="section-area section-sp1 !bg-[#F3F5F9]">
          <div className="container">
            <SectionHeading title="What" accent="Families Say" />
            <ReviewGrid />
          </div>
        </section>
        {/* end::Written reviews */}

        {/* begin::Student stories */}
        <section className="section-area section-sp1 bg-white">
          <div className="container">
            <SectionHeading
              title="Student"
              accent="Stories"
              intro="A closer look at the journey of some of our students."
            />
            <div className="mx-auto mt-[40px] flex max-w-[960px] flex-col gap-[24px]">
              {studentStories.map((story, i) => (
                <StoryCard key={i} story={story} index={i} onTrial={openTrial} />
              ))}
            </div>
          </div>
        </section>
        {/* end::Student stories */}

        {/* begin::Google and Trustpilot */}
        <section className="!bg-[#F3F5F9] px-[16px] py-[56px] lg:py-[72px]">
          <SectionHeading
            title="Read More"
            accent="Reviews"
            intro="Our reviews on Google and Trustpilot are written directly by families, and we cannot edit them."
          />
          <motion.div className="mt-[28px] flex flex-wrap justify-center gap-[12px]" {...fadeUp(0.1)}>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={OUTLINE_BUTTON}
            >
              Read our Google reviews →
            </a>
            {TRUSTPILOT_URL && (
              <a
                href={TRUSTPILOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={OUTLINE_BUTTON}
              >
                Read our Trustpilot reviews →
              </a>
            )}
          </motion.div>
        </section>
        {/* end::Google and Trustpilot */}

        {/* begin::Next step (before the footer's email sign-up) */}
        <section className="bg-white px-[16px] py-[56px] lg:py-[72px]">
          <motion.div
            className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[24px] bg-[#0B1A37] px-[24px] py-[44px] text-center md:px-[48px] md:py-[56px]"
            {...fadeUp(0)}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.14),transparent_65%)]"
            />
            <div className="relative mx-auto max-w-[640px]">
              <LuxHeading tone="dark">
                <Words text="Join These" />
                <Accent text="Families" tone="dark" delay={0.12} />
              </LuxHeading>
              <p className={`!mt-[14px] ${leadClass("dark")}`}>
                Book a free trial class and meet your teacher before you commit.
              </p>
              <TrialButton onClick={openTrial} className="mt-[28px]" />
              <p className="!mt-[20px] !mb-0 !text-[15px] !text-white/60">
                Already learning with us?{" "}
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap font-semibold !text-[#EECC65] !no-underline hover:!text-white"
                >
                  Leave a review →
                </a>
              </p>
            </div>
          </motion.div>
        </section>
        {/* end::Next step */}
      </section>
      <Footer />

      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />
    </MotionConfig>
  );
};

export default Page;
