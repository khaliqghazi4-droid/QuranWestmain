"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaWhatsapp } from "react-icons/fa";
import EnrollModal from "@/components/enroll-modal";
import { WHATSAPP_NUMBER } from "@/components/WhatsappButton";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.6, ease: "easeOut", delay },
});

// The first revealed verse (Al-Alaq 96:1): "Read in the name of your Lord who created"
const VERSE = "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ";

const LINK_COLUMNS = [
  {
    title: "Academy",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/coursesGrid", label: "Courses" },
      { href: "/blogs", label: "Blogs" },
      { href: "/faqs", label: "FAQs" },
    ],
  },
  {
    title: "Quran",
    links: [
      { href: "/coursesGrid/quran-reading-nazra", label: "Quran Reading" },
      { href: "/coursesGrid/quran-memorization", label: "Quran Memorization" },
      { href: "/coursesGrid/tajweed-mastery", label: "Tajweed Rules" },
    ],
  },
  {
    title: "Studies",
    links: [
      {
        href: "/coursesGrid/islamic-studies-fundamentals",
        label: "Islamic Studies",
      },
      { href: "/coursesGrid/arabic-for-quran", label: "Arabic Language" },
    ],
  },
];

// A black badge in the style of an app-store button: a small line over a big one.
// `compact` is a smaller one that fills its column (on phones, beside the
// Studies links)
function Badge({ icon, small, big, compact = false, ...props }) {
  const Tag = props.href ? "a" : "button";
  return (
    <Tag
      {...props}
      className={`flex items-center rounded-[0.7rem] border-[1px] border-white/30 bg-black text-left !text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)] transition-[transform,border-color] duration-300 hover:-translate-y-[2px] hover:border-[#E3C26B] ${compact ? "w-full gap-[0.5rem] px-[0.65rem] py-[0.4rem]" : "w-[11.5rem] gap-[0.7rem] px-[0.95rem] py-[0.5rem]"}`}
    >
      {icon}
      <span className="flex flex-col">
        <span
          className={`${compact ? "text-[0.6rem] tracking-[0.03em]" : "text-[0.6rem] tracking-[0.08em]"} font-semibold uppercase leading-[1.3] text-white/80`}
        >
          {small}
        </span>
        <span
          className={`${compact ? "text-[0.95rem]" : "text-[1.12rem]"} font-bold leading-[1.15] tracking-[-0.01em]`}
        >
          {big}
        </span>
      </span>
    </Tag>
  );
}

const contactIcon = "mt-[0.2rem] h-[1.1rem] w-[1.1rem] shrink-0 text-[#E3C26B]";

const Footer = () => {
  const [trialOpen, setTrialOpen] = useState(false);

  // The two ways to get started, full size or `compact`
  const startBadges = (compact) => (
    <>
      <Badge
        compact={compact}
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        icon={
          <FaWhatsapp
            className={`${compact ? "h-[1.5rem] w-[1.5rem]" : "h-[1.9rem] w-[1.9rem]"} shrink-0 text-[#25D366]`}
            aria-hidden="true"
          />
        }
        small="Chat with us on"
        big="WhatsApp"
      />
      <Badge
        compact={compact}
        type="button"
        onClick={() => setTrialOpen(true)}
        icon={
          <BookOpen
            className={`${compact ? "h-[1.4rem] w-[1.4rem]" : "h-[1.8rem] w-[1.8rem]"} shrink-0 text-[#E3C26B]`}
            aria-hidden="true"
          />
        }
        small="Book your"
        big="Free Trial"
      />
    </>
  );

  return (
    <footer className="relative isolate overflow-hidden bg-[#111D37]">
      {/* the artwork across the top: the white crown with the verse in gold,
                the gold band and the blue, at its own proportions (on phones a
                fixed height, cropped at the sides); below it the footer carries
                on in the artwork's last colour */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[16rem] sm:h-auto sm:aspect-[3168/1344]">
        <Image
          src="/footer-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-top"
        />
      </div>
      <p lang="ar" dir="rtl" className="sr-only">
        {VERSE}
      </p>

      {/* the content starts just under the point of the band (45.5% of the
                artwork's height, which is 19.3% of its width) */}
      <div className="mx-auto w-full max-w-[78rem] px-[1rem] pt-[8.5rem] sm:px-[1.5rem] sm:pt-[calc(19.3%+1.75rem)] lg:px-[2.5rem]">
        <div className="grid gap-[2.75rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto_auto] lg:gap-x-[1.75rem] xl:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.45fr)_auto_auto] xl:gap-x-[2.5rem]">
          {/* the logo and how to reach us */}
          <motion.section {...fadeUp(0)}>
            <Link
              href="/"
              className="inline-block"
              aria-label="Quran West home"
            >
              {/* a fine white rim round the logo's shapes lifts the navy
                                letters off the navy footer; a softer white glow
                                beyond it pulses slowly (held still for reduced motion) */}
              <Image
                src="/quran-academy-logo.png"
                alt="Quran West Academy"
                width={230}
                height={93}
                className="h-auto w-[12.5rem] animate-[footer-logo-glow_3s_ease-in-out_infinite] [filter:drop-shadow(0_0_1px_rgba(255,255,255,0.85))_drop-shadow(0_0_8px_rgba(255,255,255,0.3))] motion-reduce:animate-none lg:w-[14.5rem]"
              />
            </Link>

            <ul className="!mb-0 mt-[1.75rem] list-none space-y-[1rem] !pl-0">
              <li className="flex gap-[0.75rem]">
                <Phone className={contactIcon} aria-hidden="true" />
                <div className="text-[0.94rem] font-medium leading-[1.5]">
                  <span className="block text-white">Call us directly:</span>
                  <a
                    href="tel:+447508803086"
                    className="block !text-white/85 transition-colors hover:!text-[#E3C26B]"
                  >
                    +44 7508 803086
                  </a>
                  <a
                    href="tel:+923188068074"
                    className="block !text-white/85 transition-colors hover:!text-[#E3C26B]"
                  >
                    +92 3188 068074
                  </a>
                </div>
              </li>
              <li className="flex gap-[0.75rem]">
                <MapPin className={contactIcon} aria-hidden="true" />
                <div className="space-y-[0.5rem] text-[0.94rem] font-medium leading-[1.5] text-white/85">
                  {/* <p className="!mb-0 !text-[0.94rem] !leading-[1.5] !text-white/85">Watford Education Centre, Leavesden Road,<br />Watford, WD24 5ER</p> */}
                  <p className="!mb-0 !text-[0.94rem] !leading-[1.5] !text-white/85">
                    372-B, Block B People&apos;s Colony No 1,
                    <br />
                    Faisalabad, 38000, Pakistan
                  </p>
                </div>
              </li>
              <li className="flex gap-[0.75rem]">
                <Mail className={contactIcon} aria-hidden="true" />
                <a
                  href="mailto:info@quranwest.com"
                  className="text-[0.94rem] font-medium leading-[1.5] !text-white/85 transition-colors hover:!text-[#E3C26B]"
                >
                  info@quranwest.com
                </a>
              </li>
            </ul>
          </motion.section>

          <span
            aria-hidden="true"
            className="hidden w-[1px] self-stretch bg-[linear-gradient(180deg,transparent,#D4AF37_20%,#D4AF37_80%,transparent)] xl:block"
          />

          {/* quick links, in three columns */}
          <motion.nav {...fadeUp(0.1)} aria-label="Footer">
            <h2 className="!mb-0 !text-[1.6rem] !font-extrabold !leading-tight !tracking-[-0.02em] !text-white">
              Quick{" "}
              <span className="font-accent lux-gold-text pr-[0.06em] !text-[1.15em] !font-normal italic">
                links
              </span>
            </h2>
            <div className="mt-[1.25rem] grid grid-cols-2 gap-x-[1.5rem] gap-y-[1.75rem] sm:grid-cols-[repeat(3,max-content)] sm:gap-x-[2.25rem] lg:gap-x-[1.5rem] xl:gap-x-[2.25rem]">
              {LINK_COLUMNS.map(({ title, links }) => (
                <div key={title}>
                  <h3 className="!mb-0 !text-[1.05rem] !font-bold !text-[#E3C26B]">
                    {title}
                  </h3>
                  <ul className="!mb-0 mt-[0.7rem] list-none space-y-[0.55rem] !pl-0">
                    {links.map(({ href, label }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-[0.98rem] font-medium !text-white/85 transition-colors duration-150 hover:!text-[#E3C26B]"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {/* phones: the badges fill the empty cell beside Studies */}
              <div className="flex flex-col gap-[0.6rem] sm:hidden">
                {startBadges(true)}
              </div>
            </div>
          </motion.nav>

          <span
            aria-hidden="true"
            className="hidden w-[1px] self-stretch bg-[linear-gradient(180deg,transparent,#D4AF37_20%,#D4AF37_80%,transparent)] lg:block"
          />

          {/* two ways to get started, and the rating; on phones the
                        badges sit in the links above and the rating is centred */}
          <motion.div
            {...fadeUp(0.2)}
            className="flex flex-col items-center gap-[0.85rem] sm:items-start lg:items-center"
          >
            <div className="contents max-sm:hidden">{startBadges(false)}</div>
            <div className="flex flex-col items-center sm:mt-[0.9rem] sm:items-start lg:items-center">
              <span
                className="flex gap-[0.3rem] text-[1.5rem] text-[#E3C26B]"
                role="img"
                aria-label="Rated 4.5 out of 5"
              >
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStarHalfAlt />
              </span>
              <p className="!mb-0 mt-[0.5rem] max-w-[11.5rem] text-center [text-wrap:balance] !text-[0.98rem] font-medium !leading-[1.4] !text-white sm:text-left lg:text-center">
                Trusted by thousands of students
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-[2.75rem] h-[1px] bg-[linear-gradient(90deg,transparent,#D4AF37_18%,#F1D67E_50%,#D4AF37_82%,transparent)]" />
        {/* on phones, two short centred lines with room below, so the
                    floating WhatsApp and back-to-top buttons (bottom right)
                    don't sit on them */}
        <p className="!mb-0 pb-[3.5rem] pt-[1.4rem] text-center max-sm:mx-auto max-sm:max-w-[12rem] sm:pb-[1.4rem] !text-[0.95rem] font-medium tracking-[0.01em] !text-[#E3C26B]">
          © {new Date().getFullYear()} Quran West.{" "}
          <span className="whitespace-nowrap">All rights reserved.</span>
        </p>
      </div>

      <EnrollModal open={trialOpen} onClose={() => setTrialOpen(false)} />
    </footer>
  );
};

export default Footer;
