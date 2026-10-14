"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  FaArrowRight,
  FaBookOpen,
  FaBuilding,
  FaCheck,
  FaChevronDown,
  FaEnvelope,
  FaPaperPlane,
  FaPlus,
  FaPhoneAlt,
  FaPoundSign,
  FaQuestionCircle,
  FaRegClock,
  FaReply,
  FaSchool,
  FaWhatsapp,
} from "react-icons/fa";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import Goldenlines from "@/components/goldenlines";
import { Accent, PageTitle, SectionHeading as LuxHeading, Words, leadClass } from "@/components/lux/effects";
import EnrollModal from "@/components/enroll-modal";
import { WHATSAPP_NUMBER } from "@/components/WhatsappButton";
import { siteConfig } from "@/lib/siteConfig";

// ─── Contact details ─────────────────────────────────────────────────────────
// Must match the footer, every page and the Google listing word for word.
// [..] are facts still to confirm.
const WHATSAPP_MESSAGE = "Assalamu alaykum, I'd like to book a free trial.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const EMAIL = "info@quranwest.com";
const UK_PHONE = { display: "+44 7508 803086", tel: "+447508803086" };
const PK_PHONE = { display: "+92 3188 068074", tel: "+923188068074" };
const UK_ADDRESS =
  "Watford Education Centre, Leavesden Road, Watford, WD24 5ER, United Kingdom";
const PK_ADDRESS =
  "372-B, Block B, People's Colony No 1, Faisalabad, 38000, Pakistan";
const REPLY_TIME = "[24 hours]";
const OFFICE_HOURS = "[Monday to Sunday, 9am to 10pm]";

// Turn the map on only once families can visit the Watford office (a Google
// listing that shows an address nobody can visit can get suspended)
const SHOW_MAP = false;
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Watford+Education+Centre,+Leavesden+Road,+Watford+WD24+5ER&output=embed";

// Only the main WhatsApp card is a link (it opens a chat with the ready
// message); the others just show the details
const CONTACT_METHODS = [
  {
    Icon: FaWhatsapp,
    label: "WhatsApp",
    value: UK_PHONE.display,
    note: "Best for every family, wherever you live.",
    href: WHATSAPP_URL,
    external: true,
    main: true,
  },
  { Icon: FaPhoneAlt, label: "Quran West UK", value: UK_PHONE.display },
  {
    Icon: FaSchool,
    label: "Quran West Pakistan",
    value: PK_PHONE.display,
    note: "For current students and lesson-time questions.",
  },
  { Icon: FaEnvelope, label: "Email", value: EMAIL },
];

// Recheck when the clocks change in March/April and October/November
const HOURS_BY_REGION = [
  ["UK", "[9am – 10pm]"],
  ["Europe (Paris, Berlin)", "[10am – 11pm]"],
  ["USA & Canada (New York, Toronto)", "[4am – 5pm]"],
  ["USA (Los Angeles)", "[1am – 2pm]"],
  ["Australia (Sydney)", "[7pm – 8am, next day]"],
];

const QUICK_LINKS = [
  {
    Icon: FaQuestionCircle,
    title: "Quick question?",
    label: "See our FAQs",
    href: "/faqs",
  },
  {
    Icon: FaPoundSign,
    title: "Want to know the cost?",
    label: "See our prices",
    href: "/pricing",
  },
  {
    Icon: FaBookOpen,
    title: "Choosing a course?",
    label: "Explore our courses",
    href: "/coursesGrid",
  },
];

// Form options
const COUNTRIES = ["UK", "USA", "Canada", "Europe", "Australia", "Other"];
// Short labels keep the buttons on one line; `value` (what the email shows)
// keeps the full wording
const ENQUIRY_OPTIONS = [
  { value: "Book a free trial", label: "Free trial" },
  { value: "Prices", label: "Prices" },
  { value: "Course question", label: "A course" },
  { value: "Current student help", label: "Student help" },
  { value: "Something else", label: "Other" },
];
const LEARNERS = ["My child", "Myself", "Both"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_FAILED =
  "Sorry, your message didn't send. Please try again or message us on WhatsApp.";

// Structured data for search engines. The street address is left out until
// it's confirmed families can visit the Watford office.
const orgJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Quran West",
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.logoPath}`,
  email: EMAIL,
  telephone: UK_PHONE.display,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Watford",
    addressCountry: "GB",
  },
  areaServed: [
    "United Kingdom",
    "United States",
    "Canada",
    "Europe",
    "Australia",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: UK_PHONE.display,
      email: EMAIL,
    },
    {
      "@type": "ContactPoint",
      contactType: "teaching centre",
      telephone: PK_PHONE.display,
    },
  ],
}).replace(/</g, "\\u003c");

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut", delay },
});
const HOVER_LIFT = {
  y: -5,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

// One size and shape for every button on the page
const BTN = "btn btn-standard btn-lg !h-[54px] !rounded-[14px]";
// The two column headings ("Talk to Our Team", "Send Us a Message")
const COLUMN_H2 =
  "!m-0 !text-[22px] !font-extrabold !leading-tight !tracking-[-0.02em] !text-[#0B1A37] md:!text-[24px]";
// The same padding above and below every section
const SECTION_PAD = "py-[56px] lg:py-[72px]";

// Section entrances, a different one for each part of the page. Like the
// other pages, they play every time a section scrolls into view (once: false),
// up or down.
const slideIn = (from, delay = 0) => ({
  initial: { opacity: 0, x: from === "left" ? -50 : 50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { type: "spring", stiffness: 110, damping: 18, delay },
});
const popIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.85, y: 20 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { type: "spring", stiffness: 220, damping: 16, delay },
});
const zoomIn = {
  initial: { opacity: 0, scale: 0.93 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};
// A parent with `stagger` shows its children (`rise`, `rowIn`) one after
// another
const stagger = (gap = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren } },
});
const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const rowIn = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
// The form card slides in from the right; its fields follow (see the form)
const formCardIn = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 110, damping: 18, delay: 0.1 },
  },
};

// ─── Small pieces ────────────────────────────────────────────────────────────

// A section's heading in the home page's style: `title`, then `accent` in
// the gold serif, and an intro line under it
function SectionHeading({ title, accent, intro, light = false }) {
  const tone = light ? "dark" : "light";
  return (
    <motion.div className="mx-auto max-w-[720px] text-center" {...fadeUp(0)}>
      <LuxHeading tone={tone}>
        <Words text={title} />
        <Accent text={accent} tone={tone} delay={0.15} />
      </LuxHeading>
      {intro && <p className={`!mt-[14px] ${leadClass(tone)}`}>{intro}</p>}
    </motion.div>
  );
}

function TrialButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BTN} btn-secondary w-full sm:w-auto ${className}`}
    >
      Book a Free Trial
      <span className="btn-icon">
        <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
      </span>
    </button>
  );
}

function ContactCard({ method, delay }) {
  const { Icon, label, value, note, href, external, main } = method;
  // A card with a link opens it (and lifts on hover); the rest only show details
  const Card = href ? motion.a : motion.div;
  const linkProps = href
    ? {
        href,
        ...(external && { target: "_blank", rel: "noopener noreferrer" }),
        whileHover: HOVER_LIFT,
      }
    : {};
  return (
    <Card
      {...linkProps}
      {...slideIn("left", delay)}
      className={`group relative flex gap-[12px] overflow-hidden rounded-[14px] border-[1px] border-solid p-[12px] !no-underline transition-[border-color,box-shadow] duration-300 ${
        main
          ? "border-[#EECC65] bg-[#0B1A37] shadow-[0_14px_34px_rgba(11,26,55,0.22)] sm:col-span-2 lg:col-span-1"
          : "border-[#0B1A37]/[0.08] bg-white shadow-[0_8px_24px_rgba(11,26,55,0.06)]"
      }`}
    >
      {main && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(238,204,101,0.2),transparent_60%)]"
        />
      )}
      <span
        className={`relative grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] ${
          main ? "bg-[#25D366] text-white" : "bg-[#0B1A37] text-[#EECC65]"
        }`}
      >
        {main && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-[11px] bg-[#25D366] opacity-40 motion-safe:animate-ping"
          />
        )}
        <Icon className="relative h-[16px] w-[16px]" aria-hidden="true" />
      </span>
      <span className="relative min-w-0">
        <span className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px]">
          <span
            className={`text-[10.5px] font-bold uppercase tracking-[0.1em] ${main ? "text-[#EECC65]" : "text-[#9B7930]"}`}
          >
            {label}
          </span>
          {main && (
            <span className="rounded-full bg-[#EECC65] px-[7px] py-[1px] text-[9px] font-bold uppercase tracking-[0.08em] text-[#0B1A37]">
              Main contact
            </span>
          )}
        </span>
        <span
          className={`mt-[1px] block break-words text-[15px] font-bold leading-snug ${
            main ? "text-white" : "text-[#0B1A37]"
          }`}
        >
          {value}
        </span>
        {note && (
          <span
            className={`mt-[2px] block text-[12.5px] leading-snug ${main ? "text-white/70" : "text-[#3b4456]/80"}`}
          >
            {note}
          </span>
        )}
      </span>
      {href && (
        <FaArrowRight
          aria-hidden="true"
          className="relative ml-auto mt-[3px] h-[12px] w-[12px] shrink-0 text-[#EECC65] transition-transform duration-300 group-hover:translate-x-[3px]"
        />
      )}
    </Card>
  );
}

function HoursCard() {
  return (
    <motion.div
      className="relative flex-1 overflow-hidden rounded-[16px] bg-[#0B1A37] p-[16px] text-white md:p-[20px]"
      {...slideIn("left", 0.15)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(238,204,101,0.14),transparent_60%)]"
      />
      <div className="relative">
        <div className="flex items-center gap-[12px]">
          <span className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[10px] bg-[#EECC65] text-[#0B1A37]">
            <FaRegClock className="h-[14px] w-[14px]" aria-hidden="true" />
          </span>
          <h3 className="!m-0 !text-[17px] !font-bold !text-white">
            When We&apos;re Available
          </h3>
        </div>
        <p className="!mt-[10px] !mb-0 !text-[13.5px] !leading-snug !text-white/80">
          <strong className="!text-white">Office hours:</strong> {OFFICE_HOURS}{" "}
          UK time
        </p>
        <p className="!mt-[4px] !mb-0 flex items-start gap-[8px] !text-[13.5px] !leading-snug !text-white/80">
          <FaReply
            className="mt-[4px] h-[11px] w-[11px] shrink-0 text-[#EECC65]"
            aria-hidden="true"
          />
          <span>
            We reply within {REPLY_TIME}, 7 days a week. WhatsApp is usually
            fastest.
          </span>
        </p>

        <div className="mt-[12px] overflow-hidden rounded-[12px] border-[1px] border-solid border-white/10">
          <div className="flex justify-between gap-[12px] bg-white/[0.06] px-[12px] py-[6px] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#EECC65]">
            <span>Where you live</span>
            <span className="text-right">Office hours, your time</span>
          </div>
          <motion.ul
            className="!m-0 list-none !p-0"
            variants={stagger(0.08, 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            {HOURS_BY_REGION.map(([region, hours]) => (
              <motion.li
                key={region}
                variants={rowIn}
                className="flex justify-between gap-[12px] border-t-[1px] border-solid border-white/10 px-[12px] py-[6px] text-[13px]"
              >
                <span className="text-white/80">{region}</span>
                <span className="shrink-0 text-right font-semibold text-white">
                  {hours}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
        <p className="!mt-[10px] !mb-0 !text-[12px] !leading-snug !text-white/55">
          Lesson times are separate: classes run in your own time zone, weekends
          included.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Contact form ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  whatsapp: "",
  email: "",
  country: "",
  enquiry: "",
  learner: "",
  preferredTime: "",
  message: "",
  updates: false,
  website: "", // spam trap, never shown to people
};

const INPUT =
  "block w-full rounded-[10px] border-[1.5px] border-solid bg-[#F8F9FC] px-[12px] py-[9px] text-[14px] text-[#0B1A37] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[#0B1A37]/35 focus:bg-white focus:shadow-[0_0_0_4px_rgba(238,204,101,0.22)]";

function validate(v) {
  const errors = {};
  if (!v.firstName.trim()) errors.firstName = "Please tell us your first name.";
  if (!v.whatsapp.trim() && !v.email.trim())
    errors.contact = "Please add a WhatsApp number or email so we can reply.";
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim()))
    errors.email = "Please check your email address, e.g. name@email.com.";
  if (!v.enquiry) errors.enquiry = "Please choose what we can help with.";
  return errors;
}

function Field({ id, label, required, hint, error, className, children }) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="!mb-[4px] flex items-baseline gap-[6px] text-[13px] font-semibold text-[#0B1A37]"
      >
        {label}
        {required && (
          <span className="text-[#9B7930]" aria-hidden="true">
            *
          </span>
        )}
        {hint && (
          <span className="text-[11.5px] font-normal text-[#3b4456]/70">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="!mt-[6px] !mb-0 !text-[13px] !text-[#c0392b]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PillGroup({ name, label, required, options, value, onChange, error }) {
  return (
    <fieldset className="!m-0 !border-none !p-0">
      <legend className="!mb-[6px] flex items-baseline gap-[6px] !text-[13px] !font-semibold !text-[#0B1A37]">
        {label}
        {required && (
          <span className="text-[#9B7930]" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-[6px]">
        {options.map((option) => {
          const { value: optionValue, label: optionLabel } =
            typeof option === "string"
              ? { value: option, label: option }
              : option;
          const checked = value === optionValue;
          return (
            <label
              key={optionValue}
              className={`cursor-pointer rounded-full border-[1.5px] border-solid px-[12px] py-[5px] text-[13px] font-semibold transition-colors duration-200 has-[:focus-visible]:shadow-[0_0_0_4px_rgba(238,204,101,0.3)] ${
                checked
                  ? "border-[#0B1A37] bg-[#0B1A37] text-[#EECC65]"
                  : "border-[#0B1A37]/15 bg-[#F8F9FC] text-[#0B1A37] hover:border-[#EECC65]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />
              {optionLabel}
            </label>
          );
        })}
      </div>
      {error && (
        <p
          role="alert"
          className="!mt-[6px] !mb-0 !text-[13px] !text-[#c0392b]"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ContactForm() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState("");
  const [sentName, setSentName] = useState("");
  const [showMore, setShowMore] = useState(false);
  const formRef = useRef(null);

  const set = (key) => (e) => {
    const value = e?.target
      ? e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value
      : e;
    setValues((v) => ({ ...v, [key]: value }));
    if (Object.keys(errors).length)
      setErrors(validate({ ...values, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      formRef.current
        ?.querySelector("[aria-invalid='true'], [role='alert']")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || SEND_FAILED);
      setSentName(values.firstName.trim());
      setValues(EMPTY_FORM);
      setStatus("sent");
    } catch (err) {
      setServerError(err.message || SEND_FAILED);
      setStatus("error");
    }
  };

  const border = (key) =>
    errors[key]
      ? "border-[#e57373]"
      : "border-[#0B1A37]/15 focus:border-[#EECC65]";

  return (
    <motion.div
      id="send-message"
      className="relative flex flex-1 scroll-mt-[24px] flex-col overflow-hidden rounded-[20px] border-[1px] border-solid border-[#0B1A37]/[0.06] bg-white p-[18px] pt-[22px] shadow-[0_16px_40px_rgba(11,26,55,0.09)] md:p-[26px] md:pt-[26px]"
      variants={formCardIn}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.15 }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-[#EECC65] to-[#9B7930]"
      />
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          // Thank-you message, shown on the same page after sending
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="my-auto py-[24px] text-center md:py-[40px]"
            role="status"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 14,
                delay: 0.1,
              }}
              className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] shadow-[0_0_0_10px_rgba(238,204,101,0.2)]"
            >
              <FaCheck className="h-[28px] w-[28px]" aria-hidden="true" />
            </motion.span>
            <h3 className="!mt-[24px] !mb-0 !text-[24px] !font-bold !text-[#0B1A37]">
              JazakAllahu khayran, {sentName}!
            </h3>
            <p className="!mx-auto !mt-[12px] !mb-0 max-w-[440px] !text-[16px] !leading-relaxed !text-[#3b4456]">
              We&apos;ve received your message and will reply within{" "}
              {REPLY_TIME}, usually on WhatsApp. Want a faster answer?
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[14px] inline-flex items-center gap-[8px] text-[15px] font-semibold !text-[#9B7930] !no-underline hover:!text-[#0B1A37]"
            >
              <FaWhatsapp aria-hidden="true" /> Message us on WhatsApp now →
            </a>
            <div>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-[24px] cursor-pointer !border-none !bg-transparent text-[14px] font-semibold !text-[#3b4456]/70 underline underline-offset-4 hover:!text-[#0B1A37]"
              >
                Send another message
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            className="flex flex-1 flex-col"
            // Takes "hidden"/"show" from the card, so the fields appear as it
            // slides in (and again when coming back from the thank-you message)
            variants={stagger(0.06, 0.3)}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={rise}
              className="flex items-baseline justify-between gap-[12px]"
            >
              <p className="!m-0 !text-[14px] !leading-snug !text-[#3b4456]">
                We&apos;ll get back to you within {REPLY_TIME}.
              </p>
              <span className="shrink-0 text-[12px] text-[#3b4456]/60">
                <span className="text-[#9B7930]">*</span> required
              </span>
            </motion.div>

            <motion.div
              variants={rise}
              className="mt-[16px] grid gap-[14px] sm:grid-cols-2"
            >
              <Field
                id="c-first"
                label="First name"
                required
                error={errors.firstName}
              >
                <input
                  id="c-first"
                  className={`${INPUT} ${border("firstName")}`}
                  placeholder="e.g. Ahmed"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={set("firstName")}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={
                    errors.firstName ? "c-first-error" : undefined
                  }
                />
              </Field>
              <Field id="c-last" label="Last name">
                <input
                  id="c-last"
                  className={`${INPUT} ${border("lastName")}`}
                  placeholder="e.g. Khan"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={set("lastName")}
                />
              </Field>
            </motion.div>

            {/* One of these two is needed */}
            <motion.div variants={rise} className="mt-[14px]">
              <div className="grid gap-[14px] sm:grid-cols-2">
                <Field id="c-whatsapp" label="WhatsApp number">
                  <input
                    id="c-whatsapp"
                    type="tel"
                    className={`${INPUT} ${border("contact")}`}
                    placeholder="e.g. +44 7700 900123"
                    autoComplete="tel"
                    value={values.whatsapp}
                    onChange={set("whatsapp")}
                    aria-invalid={!!errors.contact}
                    aria-describedby="c-contact-note"
                  />
                </Field>
                <Field id="c-email" label="Email" error={errors.email}>
                  <input
                    id="c-email"
                    type="email"
                    className={`${INPUT} ${border(errors.email ? "email" : "contact")}`}
                    placeholder="e.g. name@email.com"
                    autoComplete="email"
                    value={values.email}
                    onChange={set("email")}
                    aria-invalid={!!(errors.contact || errors.email)}
                    aria-describedby={
                      errors.email ? "c-email-error" : "c-contact-note"
                    }
                  />
                </Field>
              </div>
              <p
                id="c-contact-note"
                role={errors.contact ? "alert" : undefined}
                className={`!mt-[6px] !mb-0 !text-[12.5px] ${errors.contact ? "!text-[#c0392b]" : "!text-[#3b4456]/65"}`}
              >
                {errors.contact ||
                  "Add at least one of these, so we can reply."}
              </p>
            </motion.div>

            <motion.div variants={rise} className="mt-[16px]">
              <PillGroup
                name="enquiry"
                label="What can we help with?"
                required
                options={ENQUIRY_OPTIONS}
                value={values.enquiry}
                onChange={set("enquiry")}
                error={errors.enquiry}
              />
            </motion.div>

            <motion.div
              variants={rise}
              className="mt-[16px] flex flex-1 flex-col"
            >
              <Field
                id="c-message"
                label="Your message"
                className="flex flex-1 flex-col"
              >
                <textarea
                  id="c-message"
                  rows={3}
                  className={`${INPUT} ${border("message")} min-h-[96px] flex-1 resize-none`}
                  placeholder="e.g. My daughter is 7 and would like to start Qaida."
                  value={values.message}
                  onChange={set("message")}
                />
              </Field>
            </motion.div>

            {/* Optional details, folded away so the form stays short */}
            <motion.div variants={rise} className="mt-[10px]">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                aria-controls="c-more"
                className="inline-flex cursor-pointer items-center gap-[8px] !border-none !bg-transparent !p-0 text-[13px] font-semibold !text-[#9B7930] hover:!text-[#0B1A37]"
              >
                <span className="grid h-[20px] w-[20px] place-items-center rounded-full bg-[#EECC65]/25">
                  <FaPlus
                    className={`h-[9px] w-[9px] transition-transform duration-300 ${showMore ? "rotate-45" : ""}`}
                    aria-hidden="true"
                  />
                </span>
                {showMore
                  ? "Hide extra details"
                  : "Add more details (optional)"}
              </button>
              <div
                id="c-more"
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  showMore ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
                {...(!showMore && { inert: "" })}
              >
                {/* Side padding keeps the focus glow from being clipped */}
                <div className="-mx-[4px] min-h-0 overflow-hidden px-[4px]">
                  <div className="grid gap-[14px] pt-[14px] sm:grid-cols-2">
                    <Field id="c-country" label="Country">
                      <div className="relative">
                        <select
                          id="c-country"
                          className={`${INPUT} ${border("country")} cursor-pointer appearance-none pr-[40px]`}
                          value={values.country}
                          onChange={set("country")}
                        >
                          <option value="">Choose your country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <FaChevronDown
                          className="pointer-events-none absolute right-[14px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#0B1A37]/50"
                          aria-hidden="true"
                        />
                      </div>
                    </Field>
                    <Field id="c-time" label="Best time for lessons">
                      <input
                        id="c-time"
                        className={`${INPUT} ${border("preferredTime")}`}
                        placeholder="e.g. weekday evenings"
                        value={values.preferredTime}
                        onChange={set("preferredTime")}
                      />
                    </Field>
                  </div>
                  <div className="pb-[4px] pt-[14px]">
                    <PillGroup
                      name="learner"
                      label="Who is learning?"
                      options={LEARNERS}
                      value={values.learner}
                      onChange={set("learner")}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Spam trap: hidden from people, bots fill it in */}
            <div
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
            >
              <label htmlFor="c-website">Website</label>
              <input
                id="c-website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={set("website")}
              />
            </div>

            {/* Marketing consent: optional and unticked (UK GDPR) */}
            <motion.label
              variants={rise}
              className="mt-[16px] flex cursor-pointer items-start gap-[10px] border-t-[1px] border-solid border-[#0B1A37]/[0.07] pt-[16px] text-[13px] leading-snug text-[#3b4456]"
            >
              <input
                type="checkbox"
                checked={values.updates}
                onChange={set("updates")}
                className="peer sr-only"
              />
              <span className="mt-[1px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border-[1.5px] border-solid border-[#0B1A37]/25 bg-white text-transparent transition-colors peer-checked:border-[#0B1A37] peer-checked:bg-[#0B1A37] peer-checked:text-[#EECC65] peer-focus-visible:shadow-[0_0_0_4px_rgba(238,204,101,0.3)]">
                <FaCheck className="h-[10px] w-[10px]" aria-hidden="true" />
              </span>
              Send me occasional updates and Islamic learning tips.
            </motion.label>

            {status === "error" && (
              <div
                role="alert"
                className="mt-[12px] rounded-[12px] border-[1px] border-solid border-[#e57373]/50 bg-[#fdf3f2] px-[14px] py-[12px] text-[14px] text-[#a03224]"
              >
                {serverError}{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold !text-[#a03224] underline underline-offset-2"
                >
                  Message us on WhatsApp
                </a>
              </div>
            )}

            <motion.div
              variants={rise}
              className="mt-[14px] flex flex-col gap-[10px] sm:flex-row sm:items-center sm:gap-[16px]"
            >
              <button
                type="submit"
                disabled={status === "sending"}
                className={`${BTN} btn-secondary w-full disabled:opacity-70 sm:w-auto`}
              >
                {status === "sending" ? "Sending…" : "Send Message"}
                <span className="btn-icon">
                  <FaPaperPlane
                    className="h-[16px] w-[16px]"
                    aria-hidden="true"
                  />
                </span>
              </button>
              {/* Link the privacy policy here once that page exists */}
              <p className="!m-0 !text-[13px] !text-[#3b4456]/75">
                We only use your details to reply to you.
              </p>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const Page = () => {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const openTrial = () => setEnrollOpen(true);

  // /contact?trial=1 (used by the automatic reply email) opens the trial form
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("trial") === "1")
      setEnrollOpen(true);
  }, []);

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
            variants={stagger(0.12, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
          >
            <PageTitle tone="dark">
              <Words text="Contact" />
              <Accent text="Quran West" tone="dark" delay={0.12} />
            </PageTitle>
            <motion.p
              variants={rise}
              className={`!mx-auto !mt-[14px] max-w-[560px] text-balance ${leadClass("dark")}`}
            >
              Questions about classes, prices or the free trial? Our team
              replies within {REPLY_TIME}.
            </motion.p>
            <motion.div
              variants={rise}
              className="mt-[28px] flex flex-col items-center justify-center gap-[12px] sm:flex-row"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} btn-secondary w-full hover:!shadow-[0_0_0_4px_rgba(238,204,101,0.22),0_0_32px_6px_rgba(238,204,101,0.5)] sm:w-auto`}
              >
                Message us on WhatsApp
                <span className="btn-icon">
                  <FaWhatsapp
                    className="h-[22px] w-[22px]"
                    aria-hidden="true"
                  />
                </span>
              </a>
              {/* Same size as the WhatsApp button, outlined */}
              <button
                type="button"
                onClick={openTrial}
                className={`${BTN} w-full !border-[2px] !border-solid !border-white/30 !bg-transparent !text-white transition-colors duration-200 hover:!border-[#EECC65] hover:!text-[#EECC65] sm:w-auto`}
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
          </motion.div>
        </section>
        {/* end::Hero */}

        {/* begin::Contact options + form. On phones the options come first */}
        <section className={`section-area !bg-[#F3F5F9] ${SECTION_PAD}`}>
          <div className="container">
            {/* Both columns start with their heading on the same line and end
                level: on desktop the form card stretches to the left column's
                height */}
            <div className="grid items-stretch gap-[24px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[32px]">
              <div className="flex flex-col">
                <motion.h2 className={COLUMN_H2} {...slideIn("left")}>
                  Talk to Our Team
                </motion.h2>
                {/* Two across on tablets, where this column is full width; a
                    single list beside the form */}
                <div className="mt-[14px] grid gap-[10px] sm:grid-cols-2 lg:grid-cols-1">
                  {CONTACT_METHODS.map((method, i) => (
                    <ContactCard
                      key={method.label}
                      method={method}
                      delay={0.05 * i}
                    />
                  ))}
                </div>
                {/* Stretches when the form is taller (extra details open) */}
                <div className="mt-[10px] flex flex-1 flex-col">
                  <HoursCard />
                </div>
              </div>
              <div className="flex flex-col">
                <motion.h2 className={COLUMN_H2} {...slideIn("right")}>
                  Send Us a Message
                </motion.h2>
                <div className="mt-[14px] flex flex-1 flex-col">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end::Contact options + form */}

        {/* begin::Quick links */}
        <section className={`section-area bg-white ${SECTION_PAD}`}>
          <div className="container">
            <SectionHeading title="Looking for Something" accent="Quick?" />
            <div className="mx-auto mt-[36px] grid max-w-[1000px] gap-[16px] md:grid-cols-3">
              {QUICK_LINKS.map(({ Icon, title, label, href }, i) => (
                <motion.div
                  key={href}
                  {...popIn(0.08 * i)}
                  whileHover={HOVER_LIFT}
                >
                  <Link
                    href={href}
                    className="group flex h-full items-center gap-[14px] rounded-[18px] border-[1px] border-solid border-[#0B1A37]/[0.08] bg-white p-[20px] !no-underline shadow-[0_8px_24px_rgba(11,26,55,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[#EECC65] hover:shadow-[0_14px_32px_rgba(11,26,55,0.12)]"
                  >
                    <span className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[14px] bg-[#EECC65]/25 text-[#9B7930] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[#0B1A37] group-hover:text-[#EECC65]">
                      <Icon className="h-[20px] w-[20px]" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-[16px] font-bold text-[#0B1A37]">
                        {title}
                      </span>
                      <span className="mt-[2px] inline-flex items-center gap-[6px] text-[14px] font-semibold text-[#9B7930]">
                        {label}
                        <FaArrowRight
                          className="h-[11px] w-[11px] transition-transform duration-200 group-hover:translate-x-[3px]"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* end::Quick links */}

        {/* begin::Location */}
        <section className={`section-area !bg-[#F3F5F9] ${SECTION_PAD}`}>
          <div className="container">
            <SectionHeading
              title="Where to"
              accent="Find Us"
              intro="Our UK office is in Watford, and every lesson is taught onsite at our teaching centre in Pakistan."
            />
            <div className="mx-auto mt-[36px] grid max-w-[1000px] gap-[16px] md:grid-cols-2">
              {[
                {
                  Icon: FaBuilding,
                  label: "Quran West UK",
                  sub: "Families, scheduling and support",
                  address: UK_ADDRESS,
                },
                {
                  Icon: FaSchool,
                  label: "Quran West Pakistan",
                  sub: "Where every lesson is taught",
                  address: PK_ADDRESS,
                },
              ].map(({ Icon, label, sub, address }, i) => (
                <motion.div
                  key={label}
                  {...slideIn(i === 0 ? "left" : "right", 0.05)}
                  className="relative overflow-hidden rounded-[20px] border-[1px] border-solid border-[#0B1A37]/[0.08] bg-white p-[24px] shadow-[0_8px_24px_rgba(11,26,55,0.06)]"
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full w-[4px] origin-top bg-[#EECC65]"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
                  />
                  <div className="flex items-center gap-[12px]">
                    <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[#0B1A37] text-[#EECC65]">
                      <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="!m-0 !text-[17px] !font-bold !text-[#0B1A37]">
                        {label}
                      </p>
                      <p className="!m-0 !text-[13px] !text-[#3b4456]/75">
                        {sub}
                      </p>
                    </div>
                  </div>
                  <address className="!mt-[16px] !mb-0 !text-[15px] !not-italic !leading-relaxed !text-[#3b4456]">
                    {address}
                  </address>
                </motion.div>
              ))}
            </div>
            {SHOW_MAP && (
              <motion.div
                className="mx-auto mt-[24px] max-w-[1000px] overflow-hidden rounded-[20px] border-[1px] border-solid border-[#0B1A37]/10"
                {...fadeUp(0.1)}
              >
                <iframe
                  title="Map of the Quran West UK office in Watford"
                  src={MAP_EMBED_URL}
                  className="block h-[360px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            )}
          </div>
        </section>
        {/* end::Location */}

        {/* begin::Final call to action */}
        <section className={`bg-white px-[16px] ${SECTION_PAD}`}>
          <motion.div
            className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[24px] bg-[#0B1A37] px-[24px] py-[44px] text-center md:px-[48px] md:py-[56px]"
            {...zoomIn}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,204,101,0.2),transparent_65%)]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            />
            <div className="relative mx-auto max-w-[640px]">
              <LuxHeading tone="dark">
                <Words text="Ready to" />
                <Accent text="Start?" tone="dark" delay={0.12} />
              </LuxHeading>
              <p className={`!mt-[14px] ${leadClass("dark")}`}>
                Book a free trial class and meet your teacher before you commit.
              </p>
              <TrialButton onClick={openTrial} className="mt-[28px]" />
            </div>
          </motion.div>
        </section>
        {/* end::Final call to action */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: orgJsonLd }}
        />
      </section>
      <Footer />

      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />
    </MotionConfig>
  );
};

export default Page;
