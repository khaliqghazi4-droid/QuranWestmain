"use client";

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import React from "react";
import { FaStar } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Goldenlines from "@/components/goldenlines";
import EnrollNow from "@/components/footer/enrollNow/enrollNow";
import { WHATSAPP_NUMBER } from "@/components/WhatsappButton";
import { CountUp } from "@/components/count-up";
import {
  FaChevronDown,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaChalkboardTeacher,
  FaVideo,
  FaHeadset,
  FaSchool,
  FaShieldAlt,
  FaChartLine,
  FaPoundSign,
  FaBookOpen,
  FaCalendarCheck,
  FaLaptop,
  FaTrophy,
  FaUserCheck,
  FaEye,
  FaFemale,
  FaUserFriends,
  FaLock,
  FaUserShield,
} from "react-icons/fa";
import Link from "next/link";
import TeachMap from "@/components/about/teach-map";
import { TeacherCard, teacherCards } from "@/components/about/teacher-card";
import { withHighlights } from "@/components/with-highlights";
import { Accent, Eyebrow, PageTitle, SectionHeading, Words, leadClass } from "@/components/lux/effects";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.6, ease: "easeOut", delay },
});

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.7, ease: "easeOut", delay },
});

const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, x: 50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.7, ease: "easeOut", delay },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

// "Why We Started" timeline: one card per entry, alternating sides.
// Wrap a word in **…** to show it in bold gold (names, places, Quran).
// Cards are kept to roughly 30 words each so they stay a similar height.
// `img` sits across the line from the card, the same height as it (on top of
// it on phones); an entry without one shows just the card. Images are 16:9
// WebP files, 720px wide, in public/assets/images/about/ (story-1.webp …);
// a new photo needs converting to that, not just saving under the name.
const storyMilestones = [
  {
    desc: "**Quran West** was started with one simple aim: to give Muslim families in the West a **Quran** teacher they can trust, and to make learning the **Quran** at home simple and personal.",
    img: "/assets/images/about/story-1.webp",
    alt: "Family reading the Quran together at home: a father with his young son, a mother and a boy sitting on the floor",
    width: 720,
    height: 405,
  },
  {
    desc: "As parents, we saw families who wanted their children to read the **Quran** properly. But mosque timetables clashed with school and work, and online academies felt like call centres, with a new teacher each week.",
    img: "/assets/images/about/story-3.webp",
    alt: "Boy in a prayer cap and headphones in a live online Quran lesson, his teacher on the laptop screen",
    width: 720,
    height: 405,
  },
  {
    desc: "So we built something different. Every student has one regular, qualified teacher. Every lesson is live and one-to-one. And a real team in the **UK** is always there for parents.",
    img: "/assets/images/about/story-2.webp",
    alt: "Boys in white reading the Quran together in a mosque",
    width: 720,
    height: 405,
  },
  {
    desc: "Today, our **UK** office handles families, scheduling and support, while our qualified teachers work from our own supervised centre in **Pakistan**: quiet classrooms, not homes, covering every time zone.",
    img: "/assets/images/about/story-4.webp",
    alt: "Boy in headphones following a female Quran teacher on a video call, with the Quran open on a stand",
    width: 720,
    height: 405,
  },
];

// "Why Families Choose Quran West" cards. Kept to 10–20 words each so the
// grid stays even. [month] and £[12] are still to fill in.
const familyReasons = [
  {
    Icon: FaChalkboardTeacher,
    title: "One teacher, every week",
    desc: "Your child builds a real bond with one qualified teacher who knows their level, pace and goals.",
  },
  {
    Icon: FaVideo,
    title: "Live one-to-one lessons",
    desc: "No recorded videos, no crowded group calls. Every minute is focused on your child.",
  },
  {
    Icon: FaHeadset,
    title: "A real UK team",
    desc: "Questions about billing, timings or progress go to our team in **Watford**, not an anonymous inbox.",
  },
  {
    Icon: FaSchool,
    title: "A professional teaching centre",
    desc: "Teachers never teach from home. They work onsite at our supervised centre in **Pakistan**, in quiet classrooms.",
  },
  {
    Icon: FaShieldAlt,
    title: "Your data stays private",
    desc: "We protect your family's details and lesson links, and never share your information with anyone.",
  },
  {
    Icon: FaClock,
    title: "Times that fit your life",
    desc: "Morning, after-school, evening and weekend slots in your own time zone.",
  },
  {
    Icon: FaChartLine,
    title: "Progress you can see",
    desc: "You receive a short progress update every **[month]**, so you always know what your child has learnt.",
  },
  {
    Icon: FaPoundSign,
    title: "Fair, clear pricing",
    desc: "Plans from **£[12]** per hour, with no long contracts.",
    link: { href: "/pricing", label: "See our pricing" },
  },
];

// How It Works animation, as variants driven by the list's single trigger
// (`custom` = step index). Step i's badge pops at 0.05 + i*STEP_GAP; its line
// then travels for 0.25s and arrives just as badge i+1 pops
// (0.15 + i*0.35 + 0.25 = 0.05 + (i+1)*0.35).
const STEP_GAP = 0.35;
const stepMotion = {
  badge: {
    hidden: { opacity: 0, scale: 0.6 },
    show: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: "easeOut", delay: 0.05 + i * STEP_GAP },
    }),
  },
  text: {
    hidden: { opacity: 0, y: 20 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut", delay: 0.1 + i * STEP_GAP },
    }),
  },
  lineX: {
    hidden: { scaleX: 0 },
    show: (i) => ({
      scaleX: 1,
      transition: { duration: 0.25, ease: "easeInOut", delay: 0.15 + i * STEP_GAP },
    }),
  },
  lineY: {
    hidden: { scaleY: 0 },
    show: (i) => ({
      scaleY: 1,
      transition: { duration: 0.25, ease: "easeInOut", delay: 0.15 + i * STEP_GAP },
    }),
  },
};

// "How Our Online Quran Classes Work" steps.
const howItWorksSteps = [
  {
    Icon: FaBookOpen,
    title: "Choose a course",
    desc: "Noorani Qaida, Quran reading with Tajweed, Hifz or Islamic studies, for children and adults.",
  },
  {
    Icon: FaCalendarCheck,
    title: "Book a free trial",
    desc: "**Meet your teacher first.** Pick a time that suits you. There is no payment and no commitment.",
  },
  {
    Icon: FaLaptop,
    title: "Start your one-to-one lessons",
    desc: "Join each live class from your **student dashboard** on a laptop, tablet or phone. Your schedule and lesson notes are there too.",
  },
  {
    Icon: FaTrophy,
    title: "Track your progress",
    desc: "Get regular updates from your teacher and celebrate each milestone, from the first surah to the final juz.",
  },
];

// "Safe Online Quran Classes for Kids" points. Each one is a promise to
// parents: publish only what is true today, and resolve every [..] note first.
// Each card is kept to roughly 20 words so the cards stay a similar height.
// Still to confirm before adding a line for them: background or police
// character checks (Qualified, checked teachers), and that teachers cannot use
// personal phones or storage in class (Data security).
const safetyPoints = [
  {
    Icon: FaUserCheck,
    title: "Qualified, checked teachers",
    desc: "Every teacher's qualifications are verified before they join, so your child is always taught by someone you can trust.",
  },
  {
    Icon: FaEye,
    title: "Supervised lessons",
    desc: "Teachers teach onsite at our centre, never from home. Our management team observes classes and checks lesson quality.",
  },
  {
    Icon: FaFemale,
    title: "Female teachers available",
    desc: "Request a female teacher for your daughter, or for yourself. Just let us know, and we will arrange it.",
  },
  {
    Icon: FaUserFriends,
    title: "Parents are always welcome",
    desc: "You can sit in on any lesson, at any time, and see for yourself how your child is being taught.",
  },
  {
    Icon: FaLock,
    title: "Data security",
    desc: "Your family's details are stored securely, seen only by staff who need them, and never shared or sold. Lessons run in your private **student dashboard**.",
  },
  {
    Icon: FaUserShield,
    title: "A named safeguarding lead",
    desc: "If you are ever worried about your child's safety, your concern goes straight to **[name]**, our safeguarding lead in the **UK**.",
  },
];

// Child Safety zigzag. The line joins the nodes' measured centres (cards vary
// in height, so the corners can't be fixed in CSS) and is drawn by scrolling:
// one scroll-linked progress value draws the line, and every node and card is
// a direct function of that same value, so each one opens exactly as the line
// reaches it and the two can never drift apart. Scrolling back up rewinds it.
//
// Progress runs 0 → SAFETY_TAIL: the line is complete at 1, and the extra bit
// lets the last node and card finish opening.
const SAFETY_TAIL = 1.15;

// Numbers strip. Only numbers that can be proved; [..] are still to fill in.
// A plain number ("5", "4.9") counts up on scroll; a placeholder shows as is.
const proofNumbers = [
  { value: "[4.9]", star: true, label: "Google rating", sub: "From [X] reviews" },
  { value: "135", suffix: "+", label: "Students taught", sub: "Since [year]" },
  { value: "15", label: "Qualified teachers" },
  { value: "5", label: "Regions", sub: "UK, USA, Canada, Europe, Australia" },
];

// "What Families Say" reviews. Real reviews only, copied with permission from
// Google or WhatsApp; until then each [..] slot holds the agreed format. Keep
// the mix: 2–3 UK families, 1 USA/Canada, 1 Europe/Australia, 1+ adult learner.
const familyReviews = [
  {
    quote: "[The family's own words, 2 to 3 sentences.]",
    name: "[First name]",
    who: "Parent",
    place: "[Watford, UK]",
    course: "[Hifz]",
  },
  {
    quote: "[The family's own words, 2 to 3 sentences.]",
    name: "[First name]",
    who: "Parent",
    place: "[Luton, UK]",
    course: "[Noorani Qaida]",
  },
  {
    quote: "[The family's own words, 2 to 3 sentences.]",
    name: "[First name]",
    who: "Parent",
    place: "[Manchester, UK]",
    course: "[Tajweed]",
  },
  {
    quote: "[The family's own words, 2 to 3 sentences.]",
    name: "[First name]",
    who: "Parent",
    place: "[Toronto, Canada]",
    course: "[Quran reading]",
  },
  {
    quote: "[The learner's own words, 2 to 3 sentences.]",
    name: "[First name]",
    who: "Adult learner",
    place: "[Sydney, Australia]",
    course: "[Tajweed]",
  },
];
// The academy's Google reviews page, for "Read all our reviews on Google"
const GOOGLE_REVIEWS_URL = "#";
const REVIEW_INTERVAL_MS = 6000; // long enough to read 2–3 sentences

// The sections after Get in Touch (Why learn with our courses?, Learning
// Focused on Your Goals, reviews, About us) are hidden for now
const SHOW_AFTER_FAQ = false;

// "Questions Parents Ask Us". [..] are still to fill in.
const parentFaqs = [
  {
    q: "Are your Quran teachers qualified?",
    a: "Yes. Every teacher holds a recognised qualification, such as an Ijazah in Quran recitation, and has [X]+ years of teaching experience. We check every qualification before a teacher joins.",
  },
  {
    q: "Are female Quran teachers available?",
    a: "Yes. You can ask for a female teacher for your daughter, your son or yourself when you book your free trial.",
  },
  {
    q: "Are online Quran classes safe for kids?",
    a: "Yes. Teachers are checked before they join and teach onsite at our supervised centre, not from home. Lessons use private links, your data is kept secure, and parents are welcome to sit in on any class. Our UK safeguarding lead handles any concern.",
  },
  {
    q: "Where do your teachers teach from?",
    a: "Our qualified teachers are based in Pakistan and teach from our own professional teaching centre. Every classroom is quiet and free from distractions, and our management team supervises all lessons. Our UK office handles bookings and support.",
  },
  {
    q: "What ages do you teach?",
    a: "We teach children from age [4/5] and adults of every age. Beginners start with Noorani Qaida, and more advanced students move on to Tajweed and Hifz.",
  },
  {
    q: "How does the free trial work?",
    a: "Book a time that suits you and meet your teacher in a live 30-minute lesson. The teacher checks your child's level and suggests a plan. There is no payment and no obligation.",
  },
  {
    q: "Which countries and time zones do you teach?",
    a: "We teach families in the UK, USA, Canada, Europe and Australia. Every lesson is booked in your local time, with weekday and weekend slots.",
  },
];

// The same questions as FAQPage structured data for search engines
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: parentFaqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}).replace(/</g, "\\u003c");

// "Get in Touch". Addresses and numbers match the footer; [..] still to fill in.
const contactDetails = [
  {
    Icon: FaMapMarkerAlt,
    label: "UK office",
    value: "Watford Education Centre, Leavesden Road, Watford, WD24\u00A05ER, United Kingdom",
  },
  {
    Icon: FaSchool,
    label: "Teaching centre",
    value: "372-B, Block B, People's Colony No\u00A01, Faisalabad, 38000, Pakistan",
  },
  { Icon: FaPhoneAlt, label: "Phone", value: "+44 7508 803086", href: "tel:+447508803086" },
  { Icon: FaEnvelope, label: "Email", value: "info@quranwest.com", href: "mailto:info@quranwest.com" },
  {
    Icon: FaWhatsapp,
    label: "WhatsApp",
    value: "+44 7508 803086",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    external: true,
  },
  { Icon: FaClock, label: "Office hours", value: "[Mon–Sat, 9am–9pm UK time]" },
];
const exploreLinks = [
  { label: "Our Courses", href: "/coursesGrid" },
  { label: "Meet Our Teachers", href: "/instructors" },
  { label: "Pricing", href: "/pricing" },
  { label: "How to choose an online Quran academy", href: "/blogs/6" },
];

// 0 → 1 as v goes from a to b, clamped
const ramp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// One point on the zigzag: its node and card, both driven by `progress`.
// `at` is where the node sits along the line (0–1).
function SafetyStop({ progress, at, side, nodeRef, Icon, title, desc }) {
  const pop = (v) => ramp(v, at, at + 0.06);
  const nodeOpacity = useTransform(progress, (v) => (v > 0 ? pop(v) : 0));
  // 0.5 → 1.12 → 1: a small overshoot as it lands
  const nodeScale = useTransform(progress, (v) => {
    const t = pop(v);
    return t < 0.6 ? 0.5 + (t / 0.6) * 0.62 : 1.12 - ((t - 0.6) / 0.4) * 0.12;
  });
  // Gold ring that spreads out and fades as the line arrives
  const pulseOpacity = useTransform(progress, (v) => {
    const t = ramp(v, at, at + 0.16);
    return v > 0 && t > 0 && t < 1 ? 0.55 * (1 - t) : 0;
  });
  const pulseScale = useTransform(progress, (v) => 1 + 0.9 * ramp(v, at, at + 0.16));
  const cardIn = (v) => (v > 0 ? ramp(v, at + 0.01, at + 0.11) : 0);
  const cardOpacity = useTransform(progress, cardIn);
  const cardX = useTransform(progress, (v) => (side === "left" ? -24 : 24) * (1 - cardIn(v)));

  return (
    <li className="grid grid-cols-[64px_1fr] items-center gap-x-[10px] lg:grid-cols-[1fr_150px_1fr] lg:gap-x-[14px]">
      {/* Node band */}
      <div
        className={`col-start-1 row-start-1 flex lg:col-start-2 ${
          side === "left" ? "justify-start" : "justify-end"
        }`}
      >
        <span className="relative">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#EECC65]"
            style={{ opacity: pulseOpacity, scale: pulseScale }}
          />
          <motion.span
            ref={nodeRef}
            className="relative grid h-[42px] w-[42px] place-items-center rounded-full border-[2px] border-solid border-[#EECC65] bg-[#0B1A37] text-[#EECC65] shadow-[0_0_0_6px_rgba(238,204,101,0.18)] lg:h-[54px] lg:w-[54px]"
            style={{ opacity: nodeOpacity, scale: nodeScale }}
          >
            <Icon className="h-[17px] w-[17px] lg:h-[22px] lg:w-[22px]" aria-hidden="true" />
          </motion.span>
        </span>
      </div>

      {/* Card */}
      <motion.div
        className={`col-start-2 row-start-1 ${side === "left" ? "lg:col-start-1" : "lg:col-start-3"}`}
        style={{ opacity: cardOpacity, x: cardX }}
      >
        <div className="group relative overflow-hidden rounded-[16px] border-[1px] border-solid border-[#0B1A37]/10 bg-white p-[18px] shadow-[0_8px_24px_rgba(11,26,55,0.07)] transition-all duration-300 hover:border-[#EECC65] hover:shadow-[0_14px_32px_rgba(11,26,55,0.12)] lg:p-[22px]">
          {/* Gold edge on the side facing the line */}
          <span
            aria-hidden="true"
            className={`absolute bottom-0 top-0 left-0 w-[4px] bg-[#EECC65] ${
              side === "left" ? "lg:left-auto lg:right-0" : ""
            }`}
          />
          <h3 className="!m-0 !text-[17px] !leading-snug !font-bold !text-[#0B1A37] lg:!text-[18px]">
            {title}
          </h3>
          <p className="!mt-[8px] !mb-0 !text-[15px] !leading-relaxed !text-[#3b4456]">
            {withHighlights(desc)}
          </p>
        </div>
      </motion.div>
    </li>
  );
}

// One question open at a time. Closed answers collapse to zero height but
// stay in the page, so they can still be found by search engines.
function ParentFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto mt-[40px] flex max-w-[860px] flex-col gap-[12px]">
      {parentFaqs.map(({ q, a }, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.div
            key={q}
            {...fadeUp(0.04 * i)}
            className={`overflow-hidden rounded-[14px] border-[1px] border-solid bg-white transition-[border-color,box-shadow] duration-300 ${
              isOpen
                ? "border-[#EECC65] shadow-[0_12px_30px_rgba(11,26,55,0.10)]"
                : "border-[#0B1A37]/[0.08] shadow-[0_4px_14px_rgba(11,26,55,0.04)] hover:border-[#EECC65]/60"
            }`}
          >
            <h3 className="!m-0">
              <button
                type="button"
                id={`parent-faq-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`parent-faq-a${i}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-[16px] !border-none !bg-transparent px-[20px] py-[18px] text-left text-[16px] font-semibold leading-snug !text-[#0B1A37] md:px-[24px] md:text-[17px]"
              >
                <span>{q}</span>
                <span
                  className={`grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? "rotate-180 bg-[#0B1A37] text-[#EECC65]"
                      : "bg-[#0B1A37]/[0.06] text-[#0B1A37]"
                  }`}
                >
                  <FaChevronDown className="h-[12px] w-[12px]" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div
              id={`parent-faq-a${i}`}
              role="region"
              aria-labelledby={`parent-faq-q${i}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="!m-0 px-[20px] pb-[20px] !text-[15px] !leading-relaxed !text-[#3b4456] md:px-[24px] md:!text-[16px]">
                  {a}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function SafetyZigzag({ points }) {
  const wrapRef = useRef(null);
  const nodeRefs = useRef([]);
  // { w, h, d, fractions }: svg size, path, and how far along the line each node sits (0–1)
  const [geo, setGeo] = useState(null);

  // Starts as the list's top passes 80% down the screen; done as its bottom
  // reaches 55%, so the last card has opened while it's still in view
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 0.8", "end 0.55"] });
  const progress = useTransform(scrollYProgress, (v) => v * SAFETY_TAIL);
  const pathLength = useTransform(progress, (v) => Math.min(v, 1));
  // Hides the round line cap that would otherwise show as a dot at 0
  const lineOpacity = useTransform(progress, (v) => (v > 0.001 ? 1 : 0));

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const box = wrap.getBoundingClientRect();
      const pts = nodeRefs.current.filter(Boolean).map((el) => {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
      });
      if (pts.length < 2) return;
      const cum = [0];
      for (let k = 1; k < pts.length; k++) {
        cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      }
      const total = cum[cum.length - 1] || 1;
      setGeo({
        w: box.width,
        h: box.height,
        d: pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "),
        fractions: cum.map((c) => c / total),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative mx-auto max-w-[1040px]">
      <svg
        aria-hidden="true"
        width={geo?.w ?? 0}
        height={geo?.h ?? 0}
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
      >
        <defs>
          <linearGradient
            id="safety-line"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={geo?.h ?? 1}
          >
            <stop offset="0" stopColor="#EECC65" />
            <stop offset="1" stopColor="#9B7930" />
          </linearGradient>
        </defs>
        {/* Faint dashed track, then the gold line drawn over it */}
        <path
          d={geo?.d ?? "M0 0"}
          fill="none"
          stroke="rgba(11,26,55,0.14)"
          strokeWidth="2"
          strokeDasharray="5 7"
          strokeLinejoin="round"
        />
        <motion.path
          d={geo?.d ?? "M0 0"}
          fill="none"
          stroke="url(#safety-line)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength, opacity: lineOpacity }}
        />
      </svg>

      <ol className="relative !m-0 flex list-none flex-col gap-[22px] !p-0 lg:gap-[26px]">
        {points.map(({ Icon, title, desc }, i) => (
          // Even points: card on the left (desktop) and node at the band's left
          // edge; odd points mirror it. The alternating node position is what
          // makes the line zigzag.
          <SafetyStop
            key={title}
            progress={progress}
            at={geo ? geo.fractions[i] : i / (points.length - 1)}
            side={i % 2 === 0 ? "left" : "right"}
            nodeRef={(el) => (nodeRefs.current[i] = el)}
            Icon={Icon}
            title={title}
            desc={desc}
          />
        ))}
      </ol>
    </div>
  );
}

const Page = () => {
  const testimonialRef = useRef(null);
  const [testimonialVisible, setTestimonialVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);

  const heroVideoRef = useRef(null);
  const [enrollOpen, setEnrollOpen] = useState(false);

  // Browsers only autoplay muted video, and React can leave `muted` out of
  // the server HTML, so mute and start the hero video on the client.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const el = testimonialRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTestimonialVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reviews rotate on their own, pausing while the visitor hovers over one.
  // Changing activeCard (arrows, dots) restarts the countdown.
  useEffect(() => {
    if (reviewsPaused) return;
    const timer = setTimeout(() => {
      setActiveCard((prev) => (prev + 1) % familyReviews.length);
    }, REVIEW_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [activeCard, reviewsPaused]);

  const showReview = (index) =>
    setActiveCard((index + familyReviews.length) % familyReviews.length);

  return (
    <>
      <Header />
      <section className="page-content">
        {/* begin::About Us Page Banner */}
        {/* Grows with its content instead of the theme's fixed-height table
            layout, which stretched to the image's full width on phones */}
        <div className="page-banner bg-ovrl1 !bg-[#0B1A37] !block !h-auto">
          <Goldenlines />
          <div className="container !block !h-auto">
            <div className="flex lg:flex-row flex-col items-center gap-[24px] !pt-10 lg:!pt-[56px] lg:min-h-[460px] xl:min-h-[520px]">
              {/* Text column is only as wide as the heading, so the photo gets the rest */}
              <div className="w-full lg:w-auto lg:flex-none min-w-0 lg:pb-[40px]">
                <div className="page-banner-entry !block !h-auto !p-0">
                  <img
                    className="animted-star star1"
                    src="/assets/images/star/star5.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="animted-star star2"
                    src="/assets/images/star/star6.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  {/* The page's only H1, in the home page's heading style */}
                  <PageTitle tone="dark" className="!block">
                    <Words text="About" />
                    <Accent text="Quran West" tone="dark" delay={0.12} />
                  </PageTitle>
                  <motion.p
                    className={`mt-[14px] lg:mt-[18px] max-w-[520px] ${leadClass("dark")}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                  >
                    An online Quran academy with a UK office and its own
                    teaching centre in Pakistan. Lessons for children and
                    adults, at times that fit your family&apos;s week.
                  </motion.p>
                  <motion.div
                    className="mt-[24px] lg:mt-[28px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  >
                    <button
                      type="button"
                      onClick={() => setEnrollOpen(true)}
                      className="btn btn-secondary btn-standard btn-lg w-full sm:w-auto"
                    >
                      Book a Free Trial
                      <span className="btn-icon">
                        <img
                          src="/assets/images/icon/arrow.svg"
                          alt=""
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </motion.div>
                </div>
              </div>
              {/* Plays muted on a loop */}
              <div className="!z-10 w-full lg:flex-1 lg:min-w-0 pb-[40px] flex justify-center lg:justify-end">
                <motion.div
                  className="relative w-full max-w-[560px] lg:max-w-[680px] overflow-hidden rounded-[20px] border-[1px] border-solid border-[#EECC65]/30 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                  <video
                    ref={heroVideoRef}
                    className="block w-full h-auto"
                    src="https://res.cloudinary.com/dlnnjkoes/video/upload/v1783607090/0709_e10lfp.mp4"
                    poster="/assets/images/thumb.PNG"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        {/* end::About Us Page Banner */}

        {/* begin::Why We Started (timeline) */}
        <section className="section-area section-sp1 bg-white">
          <div className="container">
            <motion.div
              className="heading-bx style1 text-center"
              {...fadeUp(0)}
            >
              <SectionHeading>
                <Words text="Why We Started" />
                <Accent text="Quran West" delay={0.18} />
              </SectionHeading>
            </motion.div>

            {/* Line down the middle (down the left on phones); cards alternate sides */}
            <div className="relative mx-auto max-w-[960px]">
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 left-[18px] md:left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#EECC65] via-[#EECC65]/60 to-[#0B1A37]/20"
              />
              <ol className="relative list-none !m-0 !p-0 flex flex-col gap-[28px]">
                {storyMilestones.map((m, i) => {
                  const onLeft = i % 2 === 1;
                  return (
                    <li
                      key={i}
                      className="relative pl-[52px] md:pl-0 md:grid md:grid-cols-2 md:items-stretch md:gap-x-[64px]"
                    >
                      {/* Dot on the line, level with the card's middle */}
                      <span
                        aria-hidden="true"
                        className="absolute left-[18px] md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                      >
                        <motion.span
                          className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#EECC65] text-[15px] font-bold leading-none text-[#0B1A37] shadow-[0_0_0_6px_rgba(238,204,101,0.25)]"
                          {...scaleIn(0.1)}
                        >
                          {i + 1}
                        </motion.span>
                      </span>
                      {/* Across the line from the card and stretched to the
                          card's height; on phones it joins the top of the card */}
                      {m.img && (
                        <motion.div
                          className={`relative overflow-hidden rounded-t-[14px] border-[1px] border-b-0 border-solid border-[#0B1A37]/10 md:row-start-1 md:rounded-[14px] md:border-b-[1px] md:shadow-[0_8px_24px_rgba(11,26,55,0.08)] ${
                            onLeft ? "md:col-start-2" : "md:col-start-1"
                          }`}
                          {...(onLeft ? fadeRight(0.1) : fadeLeft(0.1))}
                        >
                          <img
                            src={m.img}
                            alt={m.alt}
                            width={m.width}
                            height={m.height}
                            loading="lazy"
                            className="block aspect-[16/9] w-full object-cover md:absolute md:inset-0 md:h-full md:aspect-auto"
                          />
                        </motion.div>
                      )}
                      <motion.div
                        className={`border-[1px] border-solid border-[#0B1A37]/10 bg-white p-[20px] shadow-[0_8px_24px_rgba(11,26,55,0.08)] transition-colors hover:border-[#EECC65] md:row-start-1 md:flex md:min-h-[220px] md:items-center ${
                          m.img
                            ? "rounded-b-[14px] border-t-0 md:rounded-[14px] md:border-t-[1px]"
                            : "rounded-[14px]"
                        } ${onLeft ? "md:col-start-1" : "md:col-start-2"}`}
                        {...(onLeft ? fadeLeft(0.05) : fadeRight(0.05))}
                      >
                        {/* hyphens: justified text in a narrow phone column
                            otherwise leaves wide gaps between words */}
                        <p className="!m-0 text-justify [hyphens:auto] !text-[16px] md:!text-[17px] !leading-relaxed !text-[#3b4456]">
                          {withHighlights(m.desc)}
                        </p>
                      </motion.div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <motion.div className="mt-[48px] text-center" {...fadeUp(0.1)}>
              <button
                type="button"
                onClick={() => setEnrollOpen(true)}
                className="btn btn-secondary btn-standard btn-lg w-full sm:w-auto !whitespace-normal"
              >
                {/* One line from sm up; on phones the two halves stack instead of
                    leaving "First" alone on the second line */}
                <span className="text-center">
                  Book a Free Trial
                  <span className="hidden sm:inline"> — </span>
                  <br className="sm:hidden" />
                  Meet Your Teacher First
                </span>
                <span className="btn-icon">
                  <img
                    src="/assets/images/icon/arrow.svg"
                    alt=""
                    aria-hidden="true"
                  />
                </span>
              </button>
            </motion.div>
          </div>
        </section>
        {/* end::Why We Started */}

        {/* begin::Who We Teach */}
        <section className="section-area section-sp1 lg:!pt-[48px] lg:!pb-[44px] relative overflow-hidden !bg-[#0B1A37]">
          {/* Soft gold glow behind the heading */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.08),transparent_65%)]"
          />
          <div className="container relative">
            <motion.div
              className="text-center mx-auto max-w-[720px]"
              {...fadeUp(0)}
            >
              <SectionHeading tone="dark">
                <Words text="Who We" />
                <Accent text="Teach" tone="dark" delay={0.12} />
              </SectionHeading>
              <p className={`!mt-[14px] ${leadClass("dark")}`}>
                Online Quran Classes for Families Across the West
              </p>
            </motion.div>

            <div className="mx-auto mt-[28px] lg:mt-[20px] max-w-[980px]">
              <TeachMap />
            </div>

            <motion.p
              className="!mx-auto !mt-[28px] lg:!mt-[44px] !mb-0 text-center !text-[16px] md:!text-[17px] !leading-relaxed !text-white/85"
              {...fadeUp(0.2)}
            >
              {withHighlights(
                "Classes **7 days a week** for children from age [4/5] and adults, from the Arabic alphabet to **Hifz**.",
                "text-[#EECC65]",
              )}
            </motion.p>
          </div>
        </section>
        {/* end::Who We Teach */}

        {/* begin::Meet Our Teachers */}
        <section className="section-area section-sp1 bg-white">
          <div className="container">
            <motion.div
              className="text-center mx-auto max-w-[720px]"
              {...fadeUp(0)}
            >
              <SectionHeading>
                <Words text="Meet Our Qualified" />
                <Accent text="Quran Teachers" delay={0.18} />
              </SectionHeading>
              <p className={`!mt-[16px] ${leadClass()}`}>
                {withHighlights(
                  "Your child learns with the same teacher every week. Our **Quran** teachers are from **Pakistan**, hold recognised qualifications and pass our checks before their first lesson.",
                )}
              </p>
            </motion.div>

            <div className="mt-[48px] grid grid-cols-1 md:grid-cols-3 gap-[20px] lg:gap-[28px] max-w-[420px] md:max-w-none mx-auto">
              {teacherCards.map((t, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.1)}>
                  <TeacherCard t={t} />
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-[44px] text-center" {...fadeUp(0.1)}>
              <Link
                href="/instructors"
                className="btn btn-primary btn-standard btn-lg w-full sm:w-auto"
              >
                Meet all our teachers
                <span className="btn-icon bg-[#EECC65]">
                  <img
                    src="/assets/images/icon/arrow.svg"
                    alt=""
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </motion.div>
          </div>
        </section>
        {/* end::Meet Our Teachers */}

        {/* begin::Why Families Choose Quran West */}
        <section className="section-area section-sp1 !bg-[#F3F5F9]">
          <div className="container">
            <motion.div
              className="text-center mx-auto max-w-[720px]"
              {...fadeUp(0)}
            >
              <SectionHeading>
                <Words text="Why Families Choose" />
                <Accent text="Quran West" delay={0.18} />
              </SectionHeading>
            </motion.div>

            <div className="mt-[44px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px] lg:gap-[22px]">
              {familyReasons.map(({ Icon, title, desc, link }, i) => (
                <motion.div key={title} {...fadeUp(0.05 + (i % 4) * 0.08)}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border-[1px] border-solid border-[#0B1A37]/[0.08] bg-white p-[24px] shadow-[0_8px_24px_rgba(11,26,55,0.06)] transition-all duration-300 hover:-translate-y-[4px] hover:border-[#EECC65] hover:shadow-[0_14px_34px_rgba(11,26,55,0.12)]">
                    {/* Gold bar that grows across the top on hover */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-[3px] w-0 bg-[#EECC65] transition-all duration-300 group-hover:w-full"
                    />
                    {/* Faint card number in the corner */}
                    <span
                      aria-hidden="true"
                      className="absolute right-[18px] top-[12px] text-[40px] font-bold leading-none text-[#0B1A37]/[0.06]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Icon beside the title on phones (shorter cards), above it from sm up */}
                    <div className="flex items-center gap-[14px] pr-[48px] sm:block sm:pr-0">
                      <span className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[14px] bg-[#0B1A37] text-[#EECC65] transition-colors duration-300 group-hover:bg-[#EECC65] group-hover:text-[#0B1A37]">
                        <Icon
                          className="h-[22px] w-[22px]"
                          aria-hidden="true"
                        />
                      </span>
                      <h3 className="!m-0 sm:!mt-[18px] !text-[18px] !leading-snug !font-bold !text-[#0B1A37]">
                        {title}
                      </h3>
                    </div>
                    <p className="!mt-[10px] !mb-0 !text-[15px] !leading-relaxed !text-[#3b4456]">
                      {withHighlights(desc)}
                    </p>
                    {link && (
                      <Link
                        href={link.href}
                        className="mt-auto inline-flex items-center gap-[8px] pt-[14px] text-[14px] font-semibold !text-[#9B7930] !no-underline hover:!text-[#0B1A37]"
                      >
                        {link.label}
                        <FaArrowRight
                          className="h-[12px] w-[12px]"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* end::Why Families Choose Quran West */}

        {/* begin::How It Works (linked from the FAQs page as /about#how-it-works) */}
        <section
          id="how-it-works"
          className="section-area section-sp1 relative overflow-hidden !bg-[#0B1A37]"
        >
          {/* Faint gold dot grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(238,204,101,0.09)_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <div className="container relative">
            <motion.div
              className="text-center mx-auto max-w-[720px]"
              {...fadeUp(0)}
            >
              <SectionHeading tone="dark">
                <Words text="How Our Online Quran" />
                <Accent text="Classes Work" tone="dark" delay={0.22} />
              </SectionHeading>
            </motion.div>

            {/* Steps: a row from lg up, a vertical path below that. The whole
                list animates as one sequence (one trigger, see stepMotion): a
                badge pops in, the line travels on to the next badge, that
                badge pops in, and so on. */}
            <div className="relative mx-auto mt-[52px] max-w-[560px] lg:max-w-none">
              <motion.ol
                className="relative !m-0 grid list-none gap-[34px] !p-0 lg:grid-cols-4 lg:gap-[28px]"
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.4 }}
              >
                {howItWorksSteps.map(({ Icon, title, desc }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-[20px] lg:flex-col lg:items-center lg:text-center"
                  >
                    {i < howItWorksSteps.length - 1 && (
                      <>
                        {/* Line to the next badge, lg+: from this badge's right
                            edge (centre + 40px) across the 28px gap to the
                            next badge's left edge */}
                        <span
                          aria-hidden="true"
                          className="absolute left-[calc(50%+40px)] top-[39px] hidden h-[2px] w-[calc(100%-52px)] bg-white/15 lg:block"
                        >
                          <motion.span
                            className="block h-full origin-left bg-[#EECC65]"
                            variants={stepMotion.lineX}
                            custom={i}
                          />
                        </span>
                        {/* Line down to the next badge, below lg; 34px = the gap */}
                        <span
                          aria-hidden="true"
                          className="absolute bottom-[-34px] left-[31px] top-[64px] w-[2px] bg-white/15 lg:hidden"
                        >
                          <motion.span
                            className="block h-full origin-top bg-[#EECC65]"
                            variants={stepMotion.lineY}
                            custom={i}
                          />
                        </span>
                      </>
                    )}
                    <motion.span
                      className="relative z-10 grid h-[64px] w-[64px] shrink-0 place-items-center rounded-full border-[2px] border-solid border-[#EECC65] bg-[#0B1A37] text-[#EECC65] shadow-[0_0_0_8px_rgba(238,204,101,0.12)] lg:h-[80px] lg:w-[80px]"
                      variants={stepMotion.badge}
                      custom={i}
                    >
                      <Icon
                        className="h-[24px] w-[24px] lg:h-[30px] lg:w-[30px]"
                        aria-hidden="true"
                      />
                      {/* Step number badge */}
                      <span className="absolute -right-[4px] -top-[4px] grid h-[24px] w-[24px] place-items-center rounded-full bg-[#EECC65] text-[12px] font-bold text-[#0B1A37] lg:h-[28px] lg:w-[28px] lg:text-[13px]">
                        {i + 1}
                      </span>
                    </motion.span>
                    <motion.div
                      className="min-w-0 pt-[4px] lg:pt-[22px]"
                      variants={stepMotion.text}
                      custom={i}
                    >
                      <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#EECC65]">
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="!mt-[6px] !mb-0 !text-[19px] !leading-snug !font-bold !text-white">
                        {title}
                      </h3>
                      <p className="!mt-[10px] !mb-0 !text-[15px] !leading-relaxed !text-white/70">
                        {withHighlights(desc, "text-[#EECC65]")}
                      </p>
                    </motion.div>
                  </li>
                ))}
              </motion.ol>
            </div>

            <motion.div className="mt-[52px] text-center" {...fadeUp(0.2)}>
              <button
                type="button"
                onClick={() => setEnrollOpen(true)}
                className="btn btn-secondary btn-standard btn-lg w-full sm:w-auto"
              >
                Book a Free Trial
                <span className="btn-icon">
                  <img
                    src="/assets/images/icon/arrow.svg"
                    alt=""
                    aria-hidden="true"
                  />
                </span>
              </button>
            </motion.div>
          </div>
        </section>
        {/* end::How It Works */}

        {/* begin::Child Safety */}
        <section className="section-area section-sp1 relative overflow-hidden bg-white">
          <div className="container relative">
            <motion.div className="text-center mx-auto max-w-[720px]" {...fadeUp(0)}>
              <Eyebrow>Child safety</Eyebrow>
              <SectionHeading className="mt-[1rem]">
                <Words text="Safe Online Quran Classes" />
                <Accent text="for Kids" delay={0.22} />
              </SectionHeading>
              <p className={`!mt-[14px] ${leadClass()}`}>
                You are trusting us with your child, and we take that seriously. Here is how we keep
                every lesson safe.
              </p>
            </motion.div>

            <div className="mt-[48px]">
              <SafetyZigzag points={safetyPoints} />
            </div>
          </div>
        </section>
        {/* end::Child Safety */}

        {/* begin::Numbers Strip (replaces the old 99.9% / 500 / 30 circles) */}
        <section className="relative overflow-hidden !bg-[#0B1A37] py-[28px] lg:py-[32px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(238,204,101,0.10),transparent_65%)]"
          />
          <div className="container relative">
            <ul className="!mx-auto !my-0 grid max-w-[820px] list-none grid-cols-2 gap-x-[16px] gap-y-[22px] !p-0 lg:grid-cols-4 lg:gap-x-[24px]">
              {proofNumbers.map(({ value, star, suffix, label, sub }, i) => {
                const isNumber = /^\d+(\.\d+)?$/.test(value);
                return (
                  <motion.li
                    key={label}
                    className="flex flex-col items-center text-center"
                    {...fadeUp(0.05 + i * 0.12)}
                  >
                    {/* Circle sized to fit the longest value, e.g. "[4.9] ★" */}
                    <div className="relative grid h-[88px] w-[88px] place-items-center lg:h-[100px] lg:w-[100px]">
                      {/* Faint full track and a soft inner glow */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full border-[2px] border-solid border-white/[0.12] bg-[radial-gradient(circle,rgba(238,204,101,0.10),rgba(255,255,255,0.03)_70%)]"
                      />
                      {/* Gold comet that keeps circling the track: bright head,
                          fading tail. Each circle starts at a different point
                          (negative delay) so the four don't move in step. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 animate-[spin_4.5s_linear_infinite] motion-reduce:animate-none"
                        style={{ animationDelay: `${-i * 1.1}s` }}
                      >
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "conic-gradient(from 0deg, rgba(238,204,101,0) 0deg, rgba(238,204,101,0) 150deg, rgba(238,204,101,0.55) 290deg, #EECC65 345deg, #FFF3C4 360deg)",
                            WebkitMask:
                              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                          }}
                        />
                        {/* Glowing head at the bright end of the tail */}
                        <span className="absolute left-1/2 top-[1.5px] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF3C4] shadow-[0_0_10px_3px_rgba(238,204,101,0.85)]" />
                      </span>
                      <span className="relative inline-flex items-baseline gap-[4px] whitespace-nowrap text-[19px] font-bold leading-none text-white lg:text-[22px]">
                        {isNumber ? (
                          <CountUp
                            end={Number(value)}
                            decimals={value.includes(".") ? 1 : 0}
                            suffix={suffix ?? ""}
                          />
                        ) : (
                          <>
                            {value}
                            {suffix}
                          </>
                        )}
                        {star && (
                          <FaStar className="h-[13px] w-[13px] self-center text-[#EECC65] lg:h-[15px] lg:w-[15px]" aria-hidden="true" />
                        )}
                      </span>
                    </div>
                    <h3 className="!mt-[10px] !mb-0 !text-[13px] !leading-snug !font-bold !text-white lg:!text-[14px]">
                      {label}
                    </h3>
                    {sub && (
                      <p className="!mt-[2px] !mb-0 max-w-[200px] !text-[11px] !leading-snug !text-white/60 lg:!text-[12px]">
                        {sub}
                      </p>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>
        {/* end::Numbers Strip */}

        {/* begin::Marquee One */}
        {/* styles.css sizes this bar for a hero (40px text); the classes
            below keep it a slim strip under the numbers */}
        <div className="marquee-one !py-[6px] bg-[#EECC65]">
          <div className="marquee-track">
            {[0, 1].map((set) => (
              <div
                key={set}
                className="marquee-set"
                aria-hidden={set === 1 ? "true" : undefined}
              >
                {[
                  "Parent Review — Manchester, UK",
                  "“We tried two other academies before QuranWest. Our son actually asks to attend his class now.”",
                  "Sister Hafsa R. — Manchester, United Kingdom",
                  "Teaching families in 5 regions and [3] time zones",
                  "Hifz Programme — Mariam, age 11 · Juz 18 of 30",
                  "Parent Review — Manchester, UK",
                ].map((text, i) => (
                  <span key={i} className="!text-[17px] !leading-[1.4] lg:!text-[21px]">
                    <img
                      src="/assets/images/star.svg"
                      alt=""
                      className="!mx-[12px] !h-[14px] !w-[14px] !min-w-[14px] lg:!mx-[18px] lg:!h-[17px] lg:!w-[17px] lg:!min-w-[17px]"
                    />
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* end::Marquee One */}

        {/* begin::FAQ */}
        <section className="section-area section-sp1 bg-white">
          <div className="container">
            <motion.div
              className="text-center mx-auto max-w-[720px]"
              {...fadeUp(0)}
            >
              <SectionHeading>
                <Words text="Questions Parents" />
                <Accent text={"Ask\u00A0Us"} delay={0.12} />
              </SectionHeading>
            </motion.div>
            <ParentFaq />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: faqJsonLd }}
            />
          </div>
        </section>
        {/* end::FAQ */}

        {/* begin::Get in Touch + final call to action */}
        <section className="section-area section-sp1 !bg-[#F3F5F9]">
          <div className="container">
            <div className="grid grid-cols-1 items-start gap-[32px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[56px]">
              <motion.div {...fadeUp(0)}>
                <SectionHeading>
                  <Words text="Get in" />
                  <Accent text="Touch" delay={0.1} />
                </SectionHeading>
                <p className={`!mt-[14px] ${leadClass()}`}>
                  Quran West is run from our UK office in Watford and our teaching centre in
                  Pakistan. Our team is happy to answer any question before you book.
                </p>
                <Eyebrow className="!mt-[28px] mb-[12px] flex">Explore more</Eyebrow>
                <ul className="!m-0 flex list-none flex-wrap gap-x-[22px] gap-y-[10px] !p-0">
                  {exploreLinks.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="group inline-flex items-center gap-[8px] text-[15px] font-semibold !text-[#0B1A37] !no-underline hover:!text-[#9B7930]"
                      >
                        {label}
                        <FaArrowRight
                          className="h-[11px] w-[11px] transition-transform duration-200 group-hover:translate-x-[3px]"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.ul
                className="!m-0 grid list-none grid-cols-1 gap-[14px] !p-0 sm:grid-cols-2"
                {...fadeUp(0.1)}
              >
                {contactDetails.map(({ Icon, label, value, href, external }) => (
                  <li
                    key={label}
                    className="flex gap-[14px] rounded-[16px] border-[1px] border-solid border-[#0B1A37]/[0.08] bg-white p-[18px] shadow-[0_8px_24px_rgba(11,26,55,0.05)]"
                  >
                    <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[12px] bg-[#0B1A37] text-[#EECC65]">
                      <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9B7930]">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                          className="mt-[4px] block break-words text-[15px] font-semibold leading-snug !text-[#0B1A37] !no-underline hover:!text-[#9B7930]"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="mt-[4px] block text-[15px] leading-snug text-[#3b4456]">
                          {value}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* Final call to action */}
            <motion.div
              className="relative mt-[48px] overflow-hidden rounded-[24px] bg-[#0B1A37] px-[24px] py-[44px] text-center md:px-[48px] md:py-[56px] lg:mt-[64px]"
              {...fadeUp(0)}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.14),transparent_65%)]"
              />
              <div className="relative mx-auto max-w-[640px]">
                <SectionHeading tone="dark">
                  <Words text="Meet Your Teacher" />
                  <Accent text="Before You Commit" tone="dark" delay={0.18} />
                </SectionHeading>
                <p className={`!mt-[14px] ${leadClass("dark")}`}>
                  Book a free 30-minute trial lesson. No payment, no contract — just a friendly
                  first class in your own time zone.
                </p>
                <button
                  type="button"
                  onClick={() => setEnrollOpen(true)}
                  className="btn btn-secondary btn-standard btn-lg mt-[28px] w-full sm:w-auto"
                >
                  Book a Free Trial
                  <span className="btn-icon">
                    <img
                      src="/assets/images/icon/arrow.svg"
                      alt=""
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        {/* end::Get in Touch */}

        {/* Hidden for now: everything from here to the About us section.
            Set SHOW_AFTER_FAQ to true to bring it back. */}
        {SHOW_AFTER_FAQ && (
        <>

        {/* Start::.service-card-1 */}
        <div className="section-area bg-primary video-section-bg">
          <div className="container">
            <div className="row section-sp1">
              <div className="col-12">
                <motion.div
                  className="heading-bx style1 text-center"
                  {...fadeUp(0)}
                >
                  <h2 className="title-head-sm text-white">
                    Why learn with our courses?
                  </h2>
                </motion.div>
              </div>
              {[
                {
                  delay: 0.1,
                  num: "01",
                  title: "Choose a Course",
                  desc: "Select the Quran or Islamic course that matches your learning goals.",
                  svg: (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.0418 2.04192C0.333252 3.75046 0.333252 6.50032 0.333252 12C0.333252 17.4997 0.333252 20.2497 2.0418 21.9581C3.75034 23.6667 6.50019 23.6667 11.9999 23.6667C17.4996 23.6667 20.2495 23.6667 21.958 21.9581C23.6666 20.2497 23.6666 17.4997 23.6666 12C23.6666 6.50032 23.6666 3.75046 21.958 2.04192C20.2495 0.333374 17.4996 0.333374 11.9999 0.333374C6.50019 0.333374 3.75034 0.333374 2.0418 2.04192ZM10.3002 6.77015C10.6335 6.42022 10.62 5.86636 10.27 5.53309C9.9201 5.19981 9.36624 5.21332 9.03297 5.56326L6.33326 8.39796L5.63354 7.66326C5.30027 7.31332 4.74641 7.29981 4.39647 7.63309C4.04653 7.96636 4.03302 8.52021 4.3663 8.87015L5.69964 10.2701C5.86478 10.4436 6.09379 10.5417 6.33326 10.5417C6.57273 10.5417 6.80172 10.4436 6.96687 10.2701L10.3002 6.77015ZM13.1666 7.62504H18.9999V9.37504H13.1666ZM10.3002 14.9368L6.96687 18.4368L4.3663 17.0368L5.69964 18.4368H6.33326L10.3002 14.9368ZM13.1666 15.7917H18.9999V17.5417H13.1666Z"
                      fill="#0B1A37"
                    />
                  ),
                  vbW: 24,
                  vbH: 24,
                },
                {
                  delay: 0.2,
                  num: "02",
                  title: "Book Your Trial",
                  desc: "Schedule a fully free our trial class and meet your qualified Quran teacher whenever you want.",
                  svg: (
                    <>
                      <path
                        d="M4.28317 0.304321C4.01599 0.304321 3.76691 0.407554 3.57883 0.595164C3.38868 0.784848 3.28394 1.03741 3.28394 1.30629V16.3307C3.28394 16.8816 3.73392 17.3309 4.28713 17.3323C6.61934 17.3379 10.5267 17.824 13.2223 20.6448V4.92141C13.2223 4.73465 13.1746 4.5592 13.0845 4.41402C10.8721 0.851124 6.62066 0.309789 4.28317 0.304321Z"
                        fill="#0B1A37"
                      />
                      <path
                        d="M24.7161 16.3306V1.30617C24.7161 1.03729 24.6113 0.784726 24.4212 0.595042C24.2331 0.407432 23.9838 0.304199 23.7193 0.304199C21.3794 0.309762 17.128 0.851097 14.9155 4.41399C14.8254 4.55918 14.7778 4.73463 14.7778 4.92139V20.6447C17.4734 17.8239 21.3808 17.3378 23.713 17.3322C24.2661 17.3308 24.7161 16.8815 24.7161 16.3306Z"
                        fill="#0B1A37"
                      />
                      <path
                        d="M26.9983 3.76917H26.2718V16.3306C26.2718 17.7373 25.1256 18.8844 23.7168 18.8879C21.7386 18.8926 18.4768 19.2794 16.1667 21.4658C20.162 20.4876 24.3737 21.1235 26.774 21.6705C27.0737 21.7387 27.3834 21.6682 27.6235 21.4768C27.8628 21.2859 28 21.0005 28 20.6942V4.77095C28 4.21858 27.5506 3.76917 26.9983 3.76917Z"
                        fill="#0B1A37"
                      />
                      <path
                        d="M1.72828 16.3306V3.76917H1.00178C0.44951 3.76917 0 4.21858 0 4.77095V20.694C0 21.0003 0.137266 21.2856 0.37654 21.4765C0.616473 21.6678 0.925889 21.7386 1.22606 21.6702C3.62634 21.1231 7.83814 20.4873 11.8332 21.4655C9.52324 19.2792 6.26146 18.8925 4.28326 18.8878C2.87449 18.8844 1.72828 17.7373 1.72828 16.3306Z"
                        fill="#0B1A37"
                      />
                    </>
                  ),
                  vbW: 28,
                  vbH: 22,
                },
                {
                  delay: 0.3,
                  num: "03",
                  title: "Start Learning",
                  desc: "Attend live online classes with personalized guidance and flexible timings.",
                  svg: (
                    <path
                      d="M20.5312 0H3.46875C1.95938 0 0.734375 1.225 0.734375 2.73438V25.2656C0.734375 26.775 1.95938 28 3.46875 28H20.5312C22.0406 28 23.2656 26.775 23.2656 25.2656V2.73438C23.2656 1.225 22.0406 0 20.5312 0ZM12 7.30078C14.2477 7.30078 16.0742 9.12187 16.0742 11.375C16.0742 13.6281 14.2531 15.4492 12 15.4492C9.74687 15.4492 7.92578 13.6281 7.92578 11.375C7.92578 9.12187 9.75234 7.30078 12 7.30078Z"
                      fill="#0B1A37"
                    />
                  ),
                  vbW: 24,
                  vbH: 28,
                },
                {
                  delay: 0.4,
                  num: "04",
                  title: "Achieve Your Goals",
                  desc: "Build confidence in Quran recitation, Tajweed, Hifz, and Islamic knowledge.",
                  svg: (
                    <>
                      <path
                        d="M18.479 19.6231L19.7593 17.5454L22.07 16.7573L22.326 14.3305L24.0645 12.619L23.2379 10.3218L24.0645 8.02457L22.3261 6.31312L22.0701 3.88631L19.7594 3.09827L18.479 1.02052L16.0572 1.31294L13.9999 0L11.9426 1.31305L9.52081 1.02063L8.24041 3.09832L5.92976 3.88637L5.67376 6.31318L3.9353 8.02462L4.76185 10.3219L3.9353 12.6191L5.67371 14.3305L5.9297 16.7574L8.24036 17.5454L9.52076 19.6231L11.9426 19.3308L13.9999 20.6438L16.0572 19.3308L18.479 19.6231Z"
                        fill="#0B1A37"
                      />
                      <path
                        d="M11.5553 21.0311L8.67436 21.3789L7.15225 18.9088L6.63479 18.7324L4.40283 25.7087L8.421 25.4877L11.5647 28L13.4147 22.2178L11.5553 21.0311Z"
                        fill="#0B1A37"
                      />
                      <path
                        d="M20.8476 18.9089L19.3255 21.3789L16.4446 21.0311L14.5852 22.2178L16.4352 28L19.5789 25.4877L23.597 25.7087L21.3651 18.7324L20.8476 18.9089Z"
                        fill="#0B1A37"
                      />
                    </>
                  ),
                  vbW: 28,
                  vbH: 28,
                },
              ].map(({ delay, num, title, desc, svg, vbW, vbH }) => (
                <motion.div
                  key={num}
                  className="col-xl-3 col-md-6 m-b30"
                  {...scaleIn(delay)}
                >
                  <div className="featured-bx6">
                    <div className="featured-icon flex items-center justify-center">
                      <svg
                        width={vbW}
                        height={vbH}
                        viewBox={`0 0 ${vbW} ${vbH}`}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {svg}
                      </svg>
                    </div>
                    <div className="featured-content">
                      <h3 className="featured-title !font-semibold">{title}</h3>
                      <p>{desc}</p>
                      <div className="number">{num}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* End::.service-card-1 */}

        {/* begin::Learning Focused on Your Goals */}
        <section className="section-area section-sp1 bg-light">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-4">
                {/* <div className="row align-items-center">
                                    <motion.div
                                        className="col-xl-12 d-none d-xl-block"
                                        {...fadeLeft(0)}
                                    >
                                        <div className="m-b15">
                                            <img
                                                className='!rounded-xl'
                                                src="https://images.unsplash.com/photo-1624862762003-8b04581301aa?q=80&w=1242&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                alt="Photo"https://www.youtube.com/watch?v=PkkV1vLHUvQ
                                            />
                                        </div>
                                    </motion.div>
                                   
                                    <motion.div className="" {...fadeRight(0.2)}>
                                        <ul className="list-style1 m-0">
                                            <li>Learn from top quran teachers in anywhere the world</li>
                                            <li>In-person classes &amp; doubt solving</li>
                                            <li>Bonus access to online learning</li>
                                        </ul>
                                    </motion.div>
                                </div> */}
              </div>
              <div className="">
                <div className="">
                  <motion.div
                    className="col-lg-6 col-md-6 m-b30"
                    {...fadeUp(0.1)}
                  >
                    <div className="heading-bx style1 mb-0">
                      <h2 className="title-head-sm m-b0 !mt-10">
                        Learning Focused on Your Goals
                      </h2>
                    </div>
                  </motion.div>
                </div>
                <div className="row">
                  {[
                    {
                      delay: 0.3,
                      title: "Live Quran Classes",
                      img: "/hero.png",
                      alt: "Boy in a white prayer cap reading the Quran during a live online lesson with his teacher on screen",
                      desc: "Learn the Holy Quran with qualified teachers through interactive online classes tailored to your learning level.",
                    },
                    {
                      delay: 0.4,
                      title: "Practice with Tajweed",
                      img: "https://images.unsplash.com/photo-1596125160970-6f02eeba00d3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                      alt: "Green and gold Quran resting on a wooden stand on a prayer rug",
                      desc: "Improve your Quran recitation through regular practice, Tajweed lessons, and personalized teacher feedback.",
                    },
                    {
                      delay: 0.5,
                      title: "Flexible Learning",
                      img: "https://images.unsplash.com/photo-1728484702067-49bfc341d1e5?q=80&w=1159&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                      alt: "Quran on a carved wooden rehal on a green mosque carpet",
                      desc: "Study the Quran from anywhere with flexible schedules designed for children and adults worldwide.",
                    },
                  ].map(({ delay, title, img, alt, desc }) => (
                    <motion.div
                      key={title}
                      className="col-lg-4 col-md-6 m-b30"
                      {...scaleIn(delay)}
                    >
                      <div className="featured-bx1 data-item-hover bg-white">
                        <div className="featured-media data-img-hover">
                          <img src={img} alt={alt} loading="lazy" />
                        </div>

                        <div className="featured-content">
                          <div className="featured-title h3">
                            <h3 className="h6 stretched-link">{title}</h3>
                          </div>

                          <p>{desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end::Learning Focused on Your Goals */}

        {/* begin::What Our Students Have to Say */}
        <section className="section-area section-sp1 testimonial-section-one bg-white">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 position-relative">
                <motion.div
                  className="heading-bx style1 mb-lg-5"
                  {...fadeUp(0)}
                >
                  <h2 className="title-head m-b0">
                    What{" "}
                    <span className="!font-semibold text-amber-300">
                      Families
                    </span>{" "}
                    Say
                  </h2>
                  <p>
                    Real words from parents and students across the UK and
                    beyond.
                  </p>
                </motion.div>
              </div>
              <div className="col-lg-6">
                <motion.div
                  ref={testimonialRef}
                  className="testimonial-wrapper-one"
                  initial={{ opacity: 0, x: 50 }}
                  animate={
                    testimonialVisible
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: 50 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  onMouseEnter={() => setReviewsPaused(true)}
                  onMouseLeave={() => setReviewsPaused(false)}
                >
                  {(() => {
                    const r = familyReviews[activeCard];
                    return (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeCard}
                          initial={{ opacity: 0, x: -80 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 80 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <div className="testimonial-card">
                            <div className="rating-wrap">
                              <div className="d-flex gap-1">
                                {[...Array(5)].map((_, j) => (
                                  <FaStar key={j} className="text-warning" />
                                ))}
                              </div>
                            </div>
                            <div className="testimonial-content">
                              <p>&ldquo;{r.quote}&rdquo;</p>
                            </div>
                            <div className="testimonial-info">
                              <div className="clearfix">
                                <h6 className="testimonial-name">{r.name}</h6>
                                <p>
                                  {r.who} · {r.place} · {r.course}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    );
                  })()}
                </motion.div>

                {/* Controls sit outside the wrapper: its ::before/::after
                    "stacked cards" are sized from its height and would cover them */}
                <motion.div {...fadeUp(0.2)}>
                  {/* Previous / dots / next */}
                  <div className="flex items-center justify-center gap-[14px]">
                    <button
                      type="button"
                      onClick={() => showReview(activeCard - 1)}
                      aria-label="Previous review"
                      className="grid h-[38px] w-[38px] place-items-center rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-white text-[#0B1A37] transition-colors hover:border-[#EECC65] hover:bg-[#EECC65]"
                    >
                      <FaArrowLeft className="h-[13px] w-[13px]" aria-hidden="true" />
                    </button>
                    <div className="flex items-center gap-[8px]">
                      {familyReviews.map((_, k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => showReview(k)}
                          aria-label={`Show review ${k + 1} of ${familyReviews.length}`}
                          aria-current={k === activeCard}
                          className={`h-[8px] rounded-full transition-all duration-300 ${
                            k === activeCard ? "w-[26px] bg-[#EECC65]" : "w-[8px] bg-[#0B1A37]/20 hover:bg-[#0B1A37]/40"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => showReview(activeCard + 1)}
                      aria-label="Next review"
                      className="grid h-[38px] w-[38px] place-items-center rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-white text-[#0B1A37] transition-colors hover:border-[#EECC65] hover:bg-[#EECC65]"
                    >
                      <FaArrowRight className="h-[13px] w-[13px]" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-[18px] text-center">
                    <a
                      href={GOOGLE_REVIEWS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-[8px] text-[15px] font-semibold !text-[#9B7930] !no-underline hover:!text-[#0B1A37]"
                    >
                      Read all our reviews on Google
                      <FaArrowRight className="h-[12px] w-[12px]" aria-hidden="true" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* end::What Our Students Have to Say */}

        {/* begin::About us section */}
        <section className="section-area section-sp1 bg-light">
          <div className="container">
            <div className="row align-items-center">
              <motion.div className="col-lg-6 m-b30 pe-lg-5" {...fadeLeft(0)}>
                <div>
                  <img
                    src="/about-hero.png"
                    alt="Three smiling boys in kurtas waving, ready for their Quran lessons"
                    loading="lazy"
                  />
                </div>
              </motion.div>
              <div className="col-lg-6 m-b30">
                <motion.div className="heading-bx style1" {...fadeRight(0.1)}>
                  <h2 className="h3">Let&apos;s Learn About New Knowledge and Abilities.</h2>
                  <p className="mw-100">
                    At{" "}
                    <span className="!font-semibold underline">Quran West</span>
                    , we believe that Quranic education should be accessible,
                    engaging, and spiritually enriching for everyone. Our
                    mission is to provide high-quality online Quran classes with
                    experienced teachers, helping students of all ages
                    strengthen their Quran recitation, Tajweed, memorization,
                    Arabic, and Islamic knowledge while growing closer to Allah.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* end::About us section */}
        </>
        )}

        {/* begin::Brand Swiper */}
        {/* <div className="brand-swiper-section">
                    <div className="container">
                        <hr className="m-0" />
                        <div className="swiper brand-logo-swiper linear-swiper">
                            <div className="swiper-wrapper">
                                {[1, 2, 3, 4, 5, 1, 2].map((n, i) => (
                                    <div key={i} className="swiper-slide">
                                        <div className="brand-logo">
                                            <a href="javascript:void(0);">
                                                <img src={`/assets/images/brand/brand${n}.html`} alt="Photo" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div> */}
        {/* end::Brand Swiper */}
      </section>
      <Footer />

      {/* Book a Free Trial: the enrollment form, which asks for the trial class time */}
      <AnimatePresence>
        {enrollOpen && (
          <motion.section
            className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center p-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 z-10"
              onClick={() => setEnrollOpen(false)}
            ></div>
            <motion.div
              className="w-[900px] max-w-[95vw] z-40 max-h-[90vh] my-10 !rounded-lg overflow-y-auto scroller"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-end py-4"></div>
              <EnrollNow />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default Page;
