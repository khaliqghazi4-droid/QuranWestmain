"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Globe,
  NotebookPen,
  Star,
  Users,
} from "lucide-react";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import EnrollNow from "@/components/footer/enrollNow/enrollNow";
import { IslamicPattern } from "@/components/islamic-pattern";
import { getCourseById, courses } from "@/app/(pages)/(courses)/data";
import { instructors } from "@/app/(pages)/instructors/data";
import { Accent, PageTitle, Words, leadClass } from "@/components/lux/effects";

// One look across the page: navy text on cream and white, gold for the
// shapes, icons and lines, and a navy card for the free trial
const GOLD_FILL =
  "bg-[linear-gradient(180deg,#F6E39A_0%,#D4AF37_55%,#B38A2C_100%)]";
const CARD =
  "rounded-[1.1rem] border-[1px] border-[#D4AF37]/55 bg-white shadow-[0_14px_30px_-18px_rgba(11,30,54,0.35)]";
const CONTAINER =
  "mx-auto w-full max-w-[78rem] px-[1rem] sm:px-[1.5rem] lg:px-[2.5rem]";
// the accent word in a heading, as on the home page's light sections
const ACCENT = "font-accent pr-[0.06em] !font-normal italic text-[#9B7930]";

// Rises into view and fades back out as it leaves, every time it scrolls past
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

// The course's teacher in the instructors list, whose page, name and photo the
// course links to and shows (the course's own copy of the photo is a
// placeholder). Their ids aren't simply their names ("Sheikh Abdullah
// Al-Rashid" is sheikh-abdullah-rashid), so look them up by name, else by the
// id the name makes, with or without "al-".
const findTeacher = (name) => {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return (
    instructors.find((t) => t.name === name) ??
    instructors.find(
      (t) => t.id === slug || t.id === slug.replace(/-al-/g, "-"),
    )
  );
};

// The gold pill button
function GoldButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-[0.5rem] whitespace-nowrap rounded-full ${GOLD_FILL} px-[1.6rem] py-[0.8rem] text-[0.95rem] font-extrabold !text-[#0B1E36] shadow-[0_8px_18px_-8px_rgba(212,175,55,0.8),inset_0_1px_0_rgba(255,255,255,0.55)] transition-[transform,filter] duration-300 hover:-translate-y-[2px] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#D4AF37] ${className}`}
    >
      {children}
    </button>
  );
}
const SHAPE_FLAT =
  "[clip-path:polygon(0_0,calc(100%_-_1.1rem)_0,100%_50%,calc(100%_-_1.1rem)_100%,0_100%)]";
const SM_FLAT =
  "sm:ml-0 sm:[clip-path:polygon(0_0,calc(100%_-_1.1rem)_0,100%_50%,calc(100%_-_1.1rem)_100%,0_100%)]";
const SM_NOTCH =
  "sm:-ml-[0.8rem] sm:[clip-path:polygon(0_0,calc(100%_-_1.1rem)_0,100%_50%,calc(100%_-_1.1rem)_100%,0_100%,1.1rem_50%)]";
const LG_FLAT =
  "lg:ml-0 lg:[clip-path:polygon(0_0,calc(100%_-_1.1rem)_0,100%_50%,calc(100%_-_1.1rem)_100%,0_100%)]";
const LG_NOTCH =
  "lg:-ml-[0.8rem] lg:[clip-path:polygon(0_0,calc(100%_-_1.1rem)_0,100%_50%,calc(100%_-_1.1rem)_100%,0_100%,1.1rem_50%)]";

function StepRibbon({ steps }) {
  return (
    <ol className="!mb-0 mt-[1.5rem] grid list-none grid-cols-1 gap-y-[0.4rem] !pl-0 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, n) => {
        const above = n % 2 === 0;
        const label = (
          <span className="flex flex-col items-center text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#9B7930]">
            Step {String(n + 1).padStart(2, "0")}
          </span>
        );
        return (
          <motion.li key={step} {...rise(0.05 * n)} className="flex flex-col">
            <div
              className={`flex h-[1.6rem] items-end justify-center pb-[0.3rem] ${above ? "" : "sm:[visibility:hidden]"}`}
            >
              {label}
            </div>
            <div
              className={`relative flex min-h-[3.4rem] items-center justify-center ${GOLD_FILL} px-[1.9rem] py-[0.55rem] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${SHAPE_FLAT} ${n % 2 ? SM_NOTCH : SM_FLAT} ${n % 4 ? LG_NOTCH : LG_FLAT}`}
            >
              <span className="text-[0.92rem] font-extrabold leading-[1.25] text-[#0B1E36]">
                {step}
              </span>
            </div>
            <div
              className={`hidden h-[1.6rem] items-start justify-center pt-[0.3rem] sm:flex ${above ? "[visibility:hidden]" : ""}`}
            >
              {label}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

function StatCard({ icon: Icon, value, label, delay }) {
  return (
    <motion.li
      {...rise(delay)}
      className={`${CARD} flex flex-col items-center justify-center px-[0.75rem] py-[1.3rem] text-center transition-transform duration-300 hover:-translate-y-[3px]`}
    >
      <Icon
        className="h-[2.5rem] w-[2.5rem] text-[#C9A13B]"
        strokeWidth={1.6}
        aria-hidden="true"
      />
      <span className="mt-[0.75rem] text-[1.15rem] font-extrabold leading-tight text-[#0B1E36]">
        {value}
      </span>
      <span className="mt-[0.2rem] text-[0.85rem] font-medium text-[#0B1E36]/60">
        {label}
      </span>
    </motion.li>
  );
}

function AboutCard({ course }) {
  const [open, setOpen] = useState(0);
  const items = [
    {
      title: "Overview",
      body: (
        <p className="!mb-0 !text-[0.92rem] !leading-[1.65] !text-[#0B1E36]/75">
          {course.description}
        </p>
      ),
    },
    {
      title: "What you'll learn",
      body: (
        <ul className="!mb-0 list-none space-y-[0.45rem] !pl-0">
          {course.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-[0.5rem] text-[0.9rem] font-medium leading-[1.4] text-[#0B1E36]/80"
            >
              <Check
                className="mt-[0.15rem] h-[0.95rem] w-[0.95rem] shrink-0 text-[#C9A13B]"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Assessments",
      body: (
        <dl className="!mb-0 grid grid-cols-[auto_1fr] gap-x-[1rem] gap-y-[0.4rem] text-[0.9rem]">
          <dt className="font-medium text-[#0B1E36]/60">Quizzes</dt>
          <dd className="!mb-0 font-bold text-[#0B1E36]">{course.quizzes}</dd>
          <dt className="font-medium text-[#0B1E36]/60">Lessons</dt>
          <dd className="!mb-0 font-bold text-[#0B1E36]">{course.lessons}</dd>
          <dt className="font-medium text-[#0B1E36]/60">Final assessment</dt>
          <dd className="!mb-0 font-bold text-[#0B1E36]">
            {course.assessments ? "Yes" : "No"}
          </dd>
        </dl>
      ),
    },
  ];

  return (
    <motion.div {...rise(0.1)} className={`${CARD} overflow-hidden`}>
      <div
        className={`${GOLD_FILL} px-[1.15rem] py-[0.85rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]`}
      >
        <h2 className="!mb-0 !text-[1.15rem] !font-extrabold !tracking-[-0.01em] !text-[#0B1E36]">
          About This Course
        </h2>
      </div>
      <ul className="!mb-0 list-none !pl-0">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li
              key={item.title}
              className="border-b-[1px] border-[#0B1E36]/10 last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center gap-[0.75rem] px-[1.15rem] py-[0.95rem] text-left"
              >
                <span
                  aria-hidden="true"
                  className={`h-[1rem] w-[1rem] shrink-0 rounded-[0.25rem] border-[1.5px] border-[#C9A13B] transition-colors ${isOpen ? "bg-[#D4AF37]" : "bg-white"}`}
                />
                <span className="flex-1 text-[0.98rem] font-bold text-[#0B1E36]">
                  {item.title}
                </span>
                <ChevronDown
                  className={`h-[1.1rem] w-[1.1rem] text-[#0B1E36]/55 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-[1.15rem] pb-[1.1rem] pl-[2.9rem]">
                      {item.body}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

// The next two weeks from this week's Monday, worked out in the browser (the
// visitor's own dates); days already gone can't be picked
function useTwoWeeks() {
  const [days, setDays] = useState(null);
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const pad = (n) => String(n).padStart(2, "0");
    setDays(
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return {
          key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          date: d.getDate(),
          label: d.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
          past: d < today,
          today: d.getTime() === today.getTime(),
        };
      }),
    );
  }, []);
  return days;
}

const TIMES = ["09:00", "11:00", "14:00", "17:00", "19:00", "21:00"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const timeLabel = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

function TrialCard({ course, onBook }) {
  const days = useTwoWeeks();
  const [tab, setTab] = useState("day");
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const chosen = days?.find((d) => d.key === day);

  const tabClass = (active) =>
    `flex-1 rounded-full px-[0.75rem] py-[0.4rem] text-[0.78rem] font-extrabold uppercase tracking-[0.08em] transition-colors ${
      active
        ? `${GOLD_FILL} !text-[#0B1E36]`
        : "border-[1px] border-[#D4AF37]/60 !text-[#E3C26B] hover:bg-white/5"
    }`;

  return (
    <motion.div
      {...rise(0.2)}
      className="rounded-[1.1rem] bg-[linear-gradient(160deg,#10284A_0%,#0B1E36_60%)] p-[1.3rem] text-white shadow-[0_24px_48px_-20px_rgba(11,30,54,0.7)] ring-1 ring-[#D4AF37]/45"
    >
      <h2 className="!mb-0 !text-[1.3rem] !font-extrabold !tracking-[-0.01em] !text-[#E3C26B]">
        Free Trial Enrollment
      </h2>
      <p className="!mb-0 mt-[0.2rem] !text-[0.82rem] !text-white/65">
        Pick your preferred day and time
      </p>
      <p className="!mb-0 mt-[0.6rem] flex items-baseline gap-[0.6rem]">
        <span className="text-[1.05rem] font-extrabold text-white">
          {course.price}
        </span>
        {course.originalPrice && (
          <del className="text-[0.9rem] font-semibold text-white/45">
            {course.originalPrice}
          </del>
        )}
      </p>

      <div
        className="mt-[0.9rem] flex gap-[0.5rem]"
        role="tablist"
        aria-label="Trial day and time"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "day"}
          onClick={() => setTab("day")}
          className={tabClass(tab === "day")}
        >
          Day
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "time"}
          onClick={() => setTab("time")}
          className={tabClass(tab === "time")}
        >
          Time
        </button>
      </div>

      <div className="mt-[0.85rem] min-h-[7.6rem]">
        {tab === "day" ? (
          <div className="grid grid-cols-7 gap-[0.3rem] text-center">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="text-[0.66rem] font-bold uppercase tracking-[0.04em] text-[#E3C26B]/80"
              >
                {w}
              </span>
            ))}
            {(days ?? []).map((d) => (
              <button
                key={d.key}
                type="button"
                disabled={d.past}
                aria-label={d.label}
                aria-pressed={day === d.key}
                onClick={() => {
                  setDay(d.key);
                  setTab("time");
                }}
                className={`aspect-square rounded-[0.5rem] text-[0.82rem] font-bold transition-colors ${
                  day === d.key
                    ? `${GOLD_FILL} !text-[#0B1E36]`
                    : d.past
                      ? "cursor-not-allowed !text-white/25"
                      : `!text-white hover:bg-white/10 ${d.today ? "ring-1 ring-[#D4AF37]" : ""}`
                }`}
              >
                {d.date}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-[0.4rem]">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={time === t}
                  onClick={() => setTime(t)}
                  className={`rounded-[0.5rem] px-[0.4rem] py-[0.55rem] text-[0.8rem] font-bold transition-colors ${
                    time === t
                      ? `${GOLD_FILL} !text-[#0B1E36]`
                      : "border-[1px] border-white/15 !text-white hover:bg-white/10"
                  }`}
                >
                  {timeLabel(t)}
                </button>
              ))}
            </div>
            <p className="!mb-0 mt-[0.55rem] !text-[0.72rem] !text-white/55">
              Times are in your own time zone.
            </p>
          </div>
        )}
      </div>

      <p
        className="!mb-0 mt-[0.4rem] min-h-[1.2rem] !text-[0.8rem] font-semibold !text-[#E3C26B]"
        aria-live="polite"
      >
        {chosen
          ? `${chosen.label}${time ? ` · ${timeLabel(time)}` : " · pick a time"}`
          : ""}
      </p>

      <p className="!mb-0 mt-[0.5rem] flex items-start gap-[0.5rem] !text-[0.8rem] !leading-[1.45] !text-white/80">
        <span
          className={`mt-[0.1rem] flex h-[1.1rem] w-[1.1rem] shrink-0 items-center justify-center rounded-full ${GOLD_FILL}`}
        >
          <Check
            className="h-[0.7rem] w-[0.7rem] text-[#0B1E36]"
            strokeWidth={3.2}
            aria-hidden="true"
          />
        </span>
        30-Day Money-Back Guarantee · Full Lifetime Access
      </p>

      <GoldButton
        onClick={() => onBook(day && time ? `${day}T${time}` : undefined)}
        className="mt-[1rem] w-full"
      >
        Book Free Trial
      </GoldButton>
    </motion.div>
  );
}

const Page = () => {
  const { id } = useParams();
  const course = getCourseById(id);
  const [open, setOpen] = useState(false);
  const [trialTime, setTrialTime] = useState(undefined);

  if (!course) {
    notFound();
  }

  const teacher = findTeacher(course.instructor.name);
  const shownTeacher = teacher
    ? {
        name: teacher.name,
        role: teacher.role,
        image: teacher.image,
        rating: teacher.rating,
        learners: teacher.students,
      }
    : course.instructor;
  const relatedCourses = courses.filter((c) => c.id !== course.id);
  const openTrial = (time) => {
    setTrialTime(time);
    setOpen(true);
  };

  const stats = [
    { icon: Clock, value: course.lectures, label: "Lectures" },
    { icon: NotebookPen, value: course.quizzes, label: "Quizzes" },
    { icon: CalendarDays, value: course.duration, label: "Duration" },
    { icon: BarChart3, value: course.level, label: "Skill level" },
    { icon: Globe, value: course.language, label: "Language" },
    { icon: Users, value: course.students.toLocaleString(), label: "Students" },
  ];

  return (
    <>
      <Header />
      <main className="page-content">
        <section className="relative isolate overflow-hidden bg-[#FBF7EE] pb-[3.5rem] pt-[2.5rem] lg:pb-[4.5rem] lg:pt-[3.5rem]">
          <IslamicPattern className="text-[#C9A13B] opacity-[0.1] [mask-image:radial-gradient(circle_at_100%_0%,#000_0%,transparent_45%)]" />
          <div
            className={`${CONTAINER} grid items-center gap-[2.75rem] lg:grid-cols-[1.05fr_1fr] lg:gap-[4rem]`}
          >
            <motion.div {...rise(0)}>
              <nav
                aria-label="Breadcrumb"
                className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#9B7930]"
              >
                <Link
                  href="/coursesGrid"
                  className="!text-[#9B7930] transition-colors hover:!text-[#0B1E36]"
                >
                  Courses
                </Link>
                <span className="mx-[0.5rem] text-[#C9A13B]">/</span>
                <span>{course.category}</span>
              </nav>
              <PageTitle className="mt-[0.9rem]">
                <Words text={course.title.split(" ").slice(0, -1).join(" ")} />
                <Accent text={course.title.split(" ").at(-1)} delay={0.15} />
              </PageTitle>
              <p className={`mt-[1rem] max-w-[34rem] ${leadClass()}`}>
                {course.subtitle}
              </p>
              <ul className="!mb-0 mt-[1.4rem] flex list-none flex-wrap gap-[0.6rem] !pl-0">
                <li className="inline-flex items-center gap-[0.45rem] rounded-full border-[1px] border-[#D4AF37]/60 bg-white px-[0.9rem] py-[0.45rem] text-[0.86rem] font-bold text-[#0B1E36]">
                  <Users
                    className="h-[1rem] w-[1rem] text-[#C9A13B]"
                    aria-hidden="true"
                  />
                  {course.students.toLocaleString()} Students
                </li>
                <li className="inline-flex items-center gap-[0.45rem] rounded-full border-[1px] border-[#D4AF37]/60 bg-white px-[0.9rem] py-[0.45rem] text-[0.86rem] font-bold text-[#0B1E36]">
                  <Star
                    className="h-[1rem] w-[1rem] fill-[#D4AF37] text-[#D4AF37]"
                    aria-hidden="true"
                  />
                  {course.rating} ({course.ratingCount} ratings)
                </li>
                <li className="inline-flex items-center gap-[0.45rem] rounded-full border-[1px] border-[#D4AF37]/60 bg-white px-[0.9rem] py-[0.45rem] text-[0.86rem] font-bold text-[#0B1E36]">
                  <BarChart3
                    className="h-[1rem] w-[1rem] text-[#C9A13B]"
                    aria-hidden="true"
                  />
                  {course.level}
                </li>
              </ul>
              <div className="mt-[1.9rem] flex flex-wrap items-center gap-[0.9rem] sm:gap-[1.25rem]">
                <GoldButton
                  onClick={() => openTrial()}
                  className="max-sm:px-[1.15rem]"
                >
                  Book Free Trial
                  <ArrowRight
                    className="h-[1.05rem] w-[1.05rem]"
                    aria-hidden="true"
                  />
                </GoldButton>
                <a
                  href="#curriculum"
                  className="inline-flex items-center gap-[0.4rem] text-[0.9rem] font-bold sm:text-[0.95rem] !text-[#0B1E36] !underline decoration-[#D4AF37] decoration-2 underline-offset-[6px] transition-colors hover:!text-[#9B7930]"
                >
                  See the curriculum
                </a>
              </div>
            </motion.div>

            <motion.div
              {...rise(0.15)}
              className="relative mx-auto w-full max-w-[36rem] max-sm:ml-0 max-sm:w-[calc(100%-1rem)] lg:mx-0"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-x-[0.9rem] translate-y-[0.9rem] rounded-[1.6rem] border-[1.5px] border-[#D4AF37]/70"
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border-[1px] border-[#D4AF37]/60 shadow-[0_30px_60px_-28px_rgba(11,30,54,0.55)]">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  className="object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,30,54,0)_55%,rgba(11,30,54,0.55)_100%)]"
                />
              </div>
              <div className="absolute -bottom-[1.1rem] left-[1.25rem] flex items-center gap-[0.75rem] rounded-[0.9rem] bg-[#0B1E36] px-[1rem] py-[0.65rem] shadow-[0_14px_28px_-12px_rgba(11,30,54,0.7)] ring-1 ring-[#D4AF37]/50">
                <BookOpen
                  className="h-[1.4rem] w-[1.4rem] text-[#E3C26B]"
                  aria-hidden="true"
                />
                <span className="leading-tight">
                  <span className="block text-[0.95rem] font-extrabold text-white">
                    {course.price}
                  </span>
                  <span className="block text-[0.74rem] font-semibold text-white/65">
                    {course.lessons} lessons · {course.duration}
                  </span>
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="curriculum"
          className="scroll-mt-[6rem] bg-white py-[3.5rem] lg:py-[4.5rem]"
        >
          <div className={CONTAINER}>
            <motion.h2
              {...rise(0)}
              className="!mb-0 !text-[clamp(2rem,min(3.3vw,5.8vh),3.2rem)] !font-extrabold !leading-[1.08] !tracking-[-0.03em] !text-[#0B1E36]"
            >
              Step-by-Step Learning &{" "}
              <span className={`${ACCENT} text-[1.12em]`}>Curriculum</span>
            </motion.h2>
            <StepRibbon steps={course.features} />
          </div>
        </section>

        <section className="bg-[#FBF7EE] py-[3.5rem] lg:py-[4.5rem]">
          <div
            className={`${CONTAINER} grid items-start gap-[1.75rem] lg:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.95fr)]`}
          >
            <div className="lg:col-span-2 xl:col-span-1">
              <motion.h2
                {...rise(0)}
                className="!mb-0 !text-[clamp(2rem,min(3.3vw,5.8vh),3.2rem)] !font-extrabold !leading-[1.08] !tracking-[-0.03em] !text-[#0B1E36]"
              >
                Features of the{" "}
                <span className={`${ACCENT} text-[1.12em]`}>course</span>
              </motion.h2>
              <ul className="!mb-0 mt-[1.25rem] grid list-none grid-cols-2 gap-[0.9rem] !pl-0 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <StatCard key={stat.label} {...stat} delay={0.05 * i} />
                ))}
              </ul>
            </div>
            <AboutCard course={course} />
            <TrialCard course={course} onBook={openTrial} />
          </div>

          <div className={CONTAINER}>
            <motion.div
              {...rise(0)}
              className="mt-[2.75rem] flex flex-wrap items-center justify-between gap-[1rem] border-t-[1px] border-[#D4AF37]/45 pt-[1.4rem]"
            >
              <Link
                href={teacher ? `/instructors/${teacher.id}` : "/instructors"}
                className="group flex items-center gap-[0.85rem]"
              >
                <span className="relative h-[3rem] w-[3rem] shrink-0 overflow-hidden rounded-full ring-2 ring-[#D4AF37]">
                  <img
                    src={shownTeacher.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="leading-tight">
                  <span className="block text-[1rem] font-extrabold !text-[#0B1E36] transition-colors group-hover:!text-[#9B7930]">
                    {shownTeacher.name}
                  </span>
                  <span className="block text-[0.85rem] font-medium text-[#0B1E36]/60">
                    {shownTeacher.role}
                  </span>
                </span>
              </Link>
              <p className="!mb-0 flex items-center gap-[0.5rem] !text-[0.9rem] font-semibold !text-[#0B1E36]/70">
                <Star
                  className="h-[1rem] w-[1rem] fill-[#D4AF37] text-[#D4AF37]"
                  aria-hidden="true"
                />
                {shownTeacher.rating} instructor rating ·{" "}
                {shownTeacher.learners} learners
              </p>
            </motion.div>
          </div>
        </section>

        <section className="bg-white py-[3.5rem] lg:py-[4.5rem]">
          <div className={CONTAINER}>
            <motion.div
              {...rise(0)}
              className="flex flex-wrap items-end justify-between gap-[1rem]"
            >
              <h2 className="!mb-0 !text-[clamp(2rem,min(3.3vw,5.8vh),3.2rem)] !font-extrabold !leading-[1.08] !tracking-[-0.03em] !text-[#0B1E36]">
                You May Also{" "}
                <span className={`${ACCENT} text-[1.12em]`}>Like</span>
              </h2>
              <Link
                href="/coursesGrid"
                className="inline-flex items-center gap-[0.35rem] text-[0.92rem] font-bold !text-[#9B7930] transition-colors hover:!text-[#0B1E36]"
              >
                View all courses
                <ArrowRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...rise(0.1)}
            className="group/strip mt-[1.5rem] flex overflow-hidden pb-[2rem] pt-[0.75rem] [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] motion-reduce:overflow-x-auto"
          >
            {[0, 1, 2].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy ? "true" : undefined}
                className={`!mb-0 flex shrink-0 list-none gap-[1.25rem] !pl-0 pr-[1.25rem] animate-[marquee-scroll_40s_linear_infinite] group-hover/strip:[animation-play-state:paused] group-focus-within/strip:[animation-play-state:paused] motion-reduce:animate-none ${copy ? "motion-reduce:hidden" : "motion-reduce:pl-[1.25rem]"}`}
              >
                {relatedCourses.map((related) => (
                  <li
                    key={related.id}
                    className={`${CARD} group relative flex w-[17rem] shrink-0 flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-[4px]`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={related.image}
                        alt=""
                        fill
                        sizes="17rem"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-[1.1rem] pb-[1.1rem] pt-[0.95rem]">
                      <h3 className="!mb-0 !text-[1.08rem] !font-extrabold !leading-[1.25] !text-[#0B1E36]">
                        <Link
                          href={`/coursesGrid/${related.id}`}
                          tabIndex={copy ? -1 : undefined}
                          className="!text-[#0B1E36] after:absolute after:inset-0 after:content-['']"
                        >
                          {related.title}
                        </Link>
                      </h3>
                      <p className="!mb-0 mt-[0.4rem] line-clamp-2 !text-[0.88rem] !leading-[1.5] !text-[#0B1E36]/65">
                        {related.subtitle}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-[0.5rem] pt-[0.9rem] text-[0.8rem] font-semibold text-[#0B1E36]/60">
                        <span className="inline-flex items-center gap-[0.35rem]">
                          <Users
                            className="h-[0.9rem] w-[0.9rem] text-[#C9A13B]"
                            aria-hidden="true"
                          />
                          {related.students.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-[0.35rem]">
                          <BookOpen
                            className="h-[0.9rem] w-[0.9rem] text-[#C9A13B]"
                            aria-hidden="true"
                          />
                          {related.lessons} lessons
                        </span>
                        <span className="font-extrabold text-[#9B7930]">
                          {related.price}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </motion.div>
        </section>
      </main>
      <Footer />

      <AnimatePresence>
        {open && (
          <motion.section
            className="fixed inset-0 z-[1000] flex w-full items-center justify-center bg-black/50 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="scroller z-40 my-10 max-h-[90vh] w-[900px] max-w-[95vw] overflow-y-auto !rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-end py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-[2.25rem] w-[2.25rem] items-center justify-center rounded-full bg-white !text-[#0B1E36] shadow"
                >
                  <IoClose className="h-[1.25rem] w-[1.25rem]" />
                </button>
              </div>
              <EnrollNow
                defaultCourse={course.enrollCourse ?? course.title}
                defaultTrialTime={trialTime}
              />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default Page;
