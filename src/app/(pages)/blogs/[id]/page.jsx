"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Link2,
  ListOrdered,
} from "lucide-react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import EnrollNow from "@/components/footer/enrollNow/enrollNow";
import { AuthorAvatar, PostCard, label } from "@/components/blog/blog-card";
import { Accent, Eyebrow, SectionHeading, Words, leadClass as luxLeadClass } from "@/components/lux/effects";
import { blogs, getBlogById } from "../data";

// Article page: navy hero with the title beside the photo, then the article
// with a sticky "On this page" list beside it (and a share rail on xl), and
// related articles after it. Colours are the site's
// navy (#0B1A37) and gold (#EECC65); gold text on white uses #9B7930.

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Article text is plain paragraphs split by a blank line. A paragraph that
// opens with a short title and a colon ("Why It Matters: ...") starts a new
// section; paragraphs before the first one are the introduction.
const parseContent = (content = "") => {
  const intro = [];
  const sections = [];
  const used = new Set();
  for (const raw of content.split(/\n\s*\n/)) {
    const text = raw.trim();
    if (!text) continue;
    const m = text.match(/^([^.?!:"]{3,70}):\s+([\s\S]+)$/);
    if (m && m[1].trim().split(/\s+/).length <= 9) {
      const title = m[1].trim();
      let id = slugify(title) || `section-${sections.length + 1}`;
      while (used.has(id)) id += "-2";
      used.add(id);
      sections.push({ id, title, paragraphs: [m[2].trim()] });
    } else if (sections.length) {
      sections[sections.length - 1].paragraphs.push(text);
    } else {
      intro.push(text);
    }
  }
  return { intro, sections };
};

// Quoted text followed by a source, e.g. (Surah Al-Muzzammil 73:4) or
// (Bukhari), is a verse or hadith: navy italics on a gold tint, with the
// source in gold. Other quoted words (a dua, a phrase) are just italic.
const QUOTE = /"([^"]+)"(\s*\(([^)]+)\))?/g;
const SOURCE =
  /\d|surah|quran|bukhari|muslim|tirmidhi|abu dawud|nasa'?i|ibn majah|ahmad/i;

// ﷺ in the Amiri font (the body font draws it tiny and blurred)
const withHonorific = (text, key) =>
  text.split("ﷺ").flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <span
            key={`${key}-${i}`}
            className="mx-[1px] font-arabic text-[1.3em] leading-none text-[#9B7930]"
          >
            ﷺ
          </span>,
          part,
        ],
  );

const renderText = (text) => {
  const out = [];
  let last = 0;
  const plain = (from, to) => out.push(...withHonorific(text.slice(from, to), from));
  for (const m of text.matchAll(QUOTE)) {
    if (m.index > last) plain(last, m.index);
    const [, quote, , note] = m;
    if (note && SOURCE.test(note)) {
      out.push(
        <span
          key={m.index}
          className="rounded-[4px] bg-[#EECC65]/20 px-[4px] py-[1px] font-medium italic text-[#0B1A37] [box-decoration-break:clone]"
        >
          “{quote}”
          {/* nowrap: a source like "Surah Al-Muzzammil 73:4" never breaks at its hyphen */}
          <cite className="ml-[6px] whitespace-nowrap text-[0.8em] font-semibold not-italic tracking-wide text-[#9B7930]">
            {note}
          </cite>
        </span>,
      );
    } else {
      out.push(
        <em key={m.index} className="text-[#0B1A37]">
          “{quote}”
        </em>,
      );
      if (note) out.push(` (${note})`);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) plain(last, text.length);
  return out;
};

// Which section heading is in the reading band near the top of the screen
const useActiveSection = (ids) => {
  const [active, setActive] = useState("");
  const idsKey = ids.join("|");
  useEffect(() => {
    const els = idsKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [idsKey]);
  return active;
};

// Gold eight-pointed star between the introduction and the sections
const Ornament = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`flex items-center justify-center gap-[14px] ${className}`}
  >
    <span className="h-px w-[72px] bg-gradient-to-r from-transparent to-[#C9A44C]/70" />
    <svg
      viewBox="0 0 24 24"
      className="h-[20px] w-[20px] text-[#C9A44C]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <rect x="5.5" y="5.5" width="13" height="13" />
      <rect x="5.5" y="5.5" width="13" height="13" transform="rotate(45 12 12)" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
    <span className="h-px w-[72px] bg-gradient-to-l from-transparent to-[#C9A44C]/70" />
  </div>
);

const TableOfContents = ({ sections, active }) => (
  <nav aria-label="On this page">
    <ol className="!m-0 list-none space-y-[2px] !p-0">
      {sections.map((section, i) => {
        const isActive = section.id === active;
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={isActive ? "location" : undefined}
              className={`flex gap-[12px] rounded-r-lg border-l-[2px] border-solid py-[8px] pl-[12px] pr-[8px] text-[14px] leading-snug !no-underline transition-colors duration-200 ${
                isActive
                  ? "border-[#EECC65] bg-[#EECC65]/15 font-semibold !text-[#0B1A37]"
                  : "border-[#0B1A37]/10 !text-[#0B1A37]/60 hover:border-[#0B1A37]/30 hover:!text-[#0B1A37]"
              }`}
            >
              <span
                className={`shrink-0 pt-[1px] text-[12px] font-bold tabular-nums ${
                  isActive ? "text-[#9B7930]" : "text-[#0B1A37]/35"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  </nav>
);

const SHARE_LINKS = [
  {
    name: "WhatsApp",
    Icon: FaWhatsapp,
    url: (u, t) => `https://wa.me/?text=${t}%20${u}`,
  },
  {
    name: "Facebook",
    Icon: FaFacebookF,
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  },
  {
    name: "X",
    Icon: FaXTwitter,
    url: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
  },
  {
    name: "LinkedIn",
    Icon: FaLinkedinIn,
    url: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  },
];

const ShareButtons = ({ title, vertical = false }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const share = (make) => {
    const url = make(
      encodeURIComponent(window.location.href),
      encodeURIComponent(title),
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // clipboard blocked (e.g. no permission): nothing to show
    }
  };

  const button =
    "flex h-[40px] w-[40px] items-center justify-center rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-white !p-0 text-[#0B1A37]/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#EECC65] hover:bg-[#EECC65] hover:text-[#0B1A37]";

  return (
    <div className={`flex gap-[10px] ${vertical ? "flex-col" : "flex-wrap"}`}>
      {SHARE_LINKS.map(({ name, Icon, url }) => (
        <button
          key={name}
          type="button"
          onClick={() => share(url)}
          aria-label={`Share on ${name}`}
          title={`Share on ${name}`}
          className={button}
        >
          <Icon size={15} aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
        className={`${button} ${copied ? "!border-[#EECC65] !bg-[#EECC65] !text-[#0B1A37]" : ""}`}
      >
        {copied ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Link2 size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

const TrialCard = ({ onTrial }) => (
  <div className="relative overflow-hidden rounded-2xl bg-[#0B1A37] p-[22px] text-white">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-[40px] -top-[40px] h-[140px] w-[140px] rounded-full bg-[#EECC65] opacity-20 blur-[50px]"
    />
    <div className="relative">
      <span className="mb-[14px] flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-[#EECC65]/15">
        <GraduationCap size={20} aria-hidden="true" className="text-[#EECC65]" />
      </span>
      <h3 className="!mb-[8px] !text-[18px] !font-bold !leading-snug !text-white">
        Learn this with a teacher
      </h3>
      <p className="!mb-[18px] !text-[14px] !leading-relaxed !text-white/70">
        One-to-one lessons with a qualified teacher. Book a free trial class,
        with no payment and no commitment.
      </p>
      <button
        type="button"
        onClick={onTrial}
        className="btn btn-secondary btn-standard w-full"
      >
        Book a Free Trial
        <span className="btn-icon">
          <img src="/assets/images/icon/arrow.svg" alt="" aria-hidden="true" />
        </span>
      </button>
    </div>
  </div>
);

const NavCard = ({ post, next = false }) => (
  <Link
    href={`/blogs/${post.id}`}
    className={`group flex items-center gap-[14px] rounded-2xl bg-white p-[14px] !no-underline ring-1 ring-[#0B1A37]/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-22px_rgba(11,26,55,0.35)] hover:ring-[#EECC65] ${
      next ? "flex-row-reverse text-right" : ""
    }`}
  >
    <img
      src={post.image}
      alt=""
      loading="lazy"
      className="h-[64px] w-[64px] shrink-0 rounded-xl bg-[#F4EEE3] object-cover"
    />
    <span className="min-w-0">
      <span
        className={`mb-[4px] flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B7930] ${
          next ? "justify-end" : ""
        }`}
      >
        {next ? (
          <>
            Next article <ArrowRight size={13} aria-hidden="true" />
          </>
        ) : (
          <>
            <ArrowLeft size={13} aria-hidden="true" /> Previous article
          </>
        )}
      </span>
      <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#0B1A37] transition-colors duration-300 group-hover:text-[#9B7930]">
        {post.title}
      </span>
    </span>
  </Link>
);

const leadClass =
  "!mb-[22px] !text-[19px] !leading-[1.8] !text-[#0B1A37]/85 md:!text-[20px]";
const dropCap =
  "first-letter:float-left first-letter:mr-[12px] first-letter:mt-[6px] first-letter:text-[70px] first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-[#9B7930]";
const bodyClass =
  "!mb-[18px] !text-[17px] !leading-[1.85] !text-[#0B1A37]/75 md:!text-[18px]";

const Page = () => {
  const { id } = useParams();
  const blog = getBlogById(id);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [readPercent, setReadPercent] = useState(0);
  const articleRef = useRef(null);

  const { intro, sections } = useMemo(
    () => parseContent(blog?.content),
    [blog?.content],
  );
  const active = useActiveSection(sections.map((s) => s.id));

  // Reading progress through the article: the gold bar at the top of the
  // screen and the percentage beside "On this page"
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });
  const barScale = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setReadPercent(Math.round(Math.min(1, Math.max(0, v)) * 100)),
  );

  if (!blog) notFound();

  const index = blogs.indexOf(blog);
  const prevPost = blogs[index - 1];
  const nextPost = blogs[index + 1];
  const authorCount = blogs.filter((b) => b.author === blog.author).length;
  const others = blogs.filter((b) => b !== blog);
  const related = [
    ...others.filter((b) => b.category === blog.category),
    ...others.filter((b) => b.category !== blog.category),
  ].slice(0, 3);

  return (
    <>
      <Header />
      {/* After the header: Next.js skips its scroll-to-top on navigation when
          a page's first element is fixed */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[1100] h-[3px] origin-left bg-gradient-to-r from-[#C9A44C] via-[#EECC65] to-[#F7E7B4]"
        style={{ scaleX: barScale }}
      />
      <div className="page-content bg-light">
        {/* Hero: text on the left and the photo on the right from lg up;
            stacked, text first, below that */}
        <section className="relative overflow-hidden !bg-[#0B1A37] py-[40px] lg:py-[56px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(238,204,101,0.07)_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10%] top-[-30%] h-[70%] w-[40%] rounded-full bg-[#EECC65] opacity-[0.10] blur-[120px]" />
            <div className="absolute bottom-[-30%] right-[-5%] h-[70%] w-[45%] rounded-full bg-[#2B4A8C] opacity-50 blur-[120px]" />
          </div>

          <div className="container relative z-10">
            <div className="mx-auto grid max-w-[1180px] items-center gap-[32px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-[56px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <nav
                  aria-label="Breadcrumb"
                  className="mb-[16px] flex flex-wrap items-center gap-[6px] text-[13px] text-white/55"
                >
                  <Link href="/" className="!text-white/55 !no-underline transition-colors hover:!text-[#EECC65]">
                    Home
                  </Link>
                  <ChevronRight size={13} aria-hidden="true" />
                  <Link href="/blogs" className="!text-white/55 !no-underline transition-colors hover:!text-[#EECC65]">
                    Blog
                  </Link>
                  <ChevronRight size={13} aria-hidden="true" />
                  <span aria-current="page" className="font-medium text-[#EECC65]">
                    {blog.category}
                  </span>
                </nav>

                <h1 className="!mb-[16px] !text-[28px] !font-extrabold !leading-[1.15] !tracking-[-0.03em] !text-white sm:!text-[34px] lg:!text-[38px] xl:!text-[42px]">
                  {blog.title}
                </h1>
                <p className={`max-w-[580px] ${luxLeadClass("dark")} !mb-[24px]`}>
                  {blog.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[10px] border-t border-solid border-white/10 pt-[20px] text-[14px] text-white/60">
                  <span className="flex items-center gap-[10px]">
                    <AuthorAvatar post={blog} className="h-[36px] w-[36px] !ring-[#EECC65]/70" />
                    <span className="font-semibold text-white">{blog.author}</span>
                  </span>
                  <span aria-hidden="true" className="hidden h-[4px] w-[4px] rounded-full bg-white/30 sm:block" />
                  <span className="inline-flex items-center gap-[6px]">
                    <Calendar size={14} aria-hidden="true" />
                    {blog.date}
                  </span>
                  <span aria-hidden="true" className="hidden h-[4px] w-[4px] rounded-full bg-white/30 sm:block" />
                  <span className="inline-flex items-center gap-[6px]">
                    <Clock size={14} aria-hidden="true" />
                    {blog.readTime}
                  </span>
                </div>
              </motion.div>

              {/* Photo, with a thin gold frame set off behind it */}
              <motion.figure
                className="relative !m-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 hidden translate-x-[14px] translate-y-[14px] rounded-[22px] border-[1px] border-solid border-[#EECC65]/40 lg:block"
                />
                <div className="relative overflow-hidden rounded-[18px] bg-[#13254A] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10 lg:rounded-[22px]">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="aspect-[16/9] w-full object-cover lg:aspect-[4/3]"
                  />
                  <span className="absolute left-[14px] top-[14px] rounded-full bg-[#EECC65] px-[12px] py-[4px] text-[11px] font-bold uppercase tracking-[0.12em] text-[#0B1A37]">
                    {blog.category}
                  </span>
                </div>
              </motion.figure>
            </div>
          </div>
        </section>

        {/* Article */}
        <section className="pb-[80px] pt-[48px] md:pt-[64px]">
          <div className="container">
            <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[44px_minmax(0,1fr)_300px]">
              {/* Share rail, xl+ */}
              <aside aria-label="Share this article" className="hidden xl:block">
                <div className="sticky top-[32px] flex flex-col items-center gap-[12px]">
                  <span className="rotate-180 text-[10px] font-bold uppercase tracking-[0.25em] text-[#0B1A37]/40 [writing-mode:vertical-rl]">
                    Share
                  </span>
                  <ShareButtons title={blog.title} vertical />
                </div>
              </aside>

              <article ref={articleRef} className="min-w-0">
                <div className="mx-auto max-w-[720px]">
                  {/* "On this page" for phones and tablets */}
                  {sections.length > 0 && (
                    <details className="group/toc mb-[32px] rounded-2xl border-[1px] border-solid border-[#0B1A37]/10 bg-white lg:hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-[12px] px-[18px] py-[14px] text-[13px] font-bold uppercase tracking-[0.12em] text-[#0B1A37] [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-[10px]">
                          <ListOrdered size={16} aria-hidden="true" className="text-[#9B7930]" />
                          On this page
                        </span>
                        <ChevronDown
                          size={18}
                          aria-hidden="true"
                          className="transition-transform duration-200 group-open/toc:rotate-180"
                        />
                      </summary>
                      <div className="border-t border-solid border-[#0B1A37]/10 px-[10px] pb-[12px] pt-[8px]">
                        <TableOfContents sections={sections} active={active} />
                      </div>
                    </details>
                  )}

                  {intro.map((text, i) => (
                    <p key={i} className={`${leadClass} ${i === 0 ? dropCap : ""}`}>
                      {renderText(text)}
                    </p>
                  ))}

                  {sections.length > 0 && <Ornament className="my-[40px]" />}

                  <div className="space-y-[44px]">
                    {sections.map((section, i) => (
                      <section key={section.id} id={section.id} className="scroll-mt-[32px]">
                        <h2 className="!mb-[16px] flex items-baseline gap-[14px] !text-[24px] !font-extrabold !leading-snug !tracking-[-0.02em] !text-[#0B1A37] md:!text-[28px]">
                          {/* the number in the gold serif, as the home page's numbers */}
                          <span className="font-accent shrink-0 pr-[0.06em] text-[1.15em] font-normal italic leading-none text-[#9B7930]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>{section.title}</span>
                        </h2>
                        {section.paragraphs.map((text, j) => (
                          <p key={j} className={bodyClass}>
                            {renderText(text)}
                          </p>
                        ))}
                      </section>
                    ))}
                  </div>

                  {/* Topics: each opens the blog list searched for it */}
                  {blog.tags?.length > 0 && (
                    <div className="mt-[48px] flex flex-wrap items-center gap-[10px] border-t border-solid border-[#0B1A37]/10 pt-[28px]">
                      <span className="mr-[4px] text-[12px] font-bold uppercase tracking-[0.14em] text-[#0B1A37]/45">
                        Topics
                      </span>
                      {blog.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blogs?q=${encodeURIComponent(tag)}`}
                          className="rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-white px-[14px] py-[6px] text-[13px] font-medium !text-[#0B1A37]/70 !no-underline transition-colors duration-200 hover:border-[#EECC65] hover:bg-[#EECC65]/15 hover:!text-[#0B1A37]"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Share box for screens without the share rail (below xl) */}
                  <div className="mt-[24px] flex flex-wrap items-center justify-between gap-[16px] rounded-2xl bg-white px-[20px] py-[16px] ring-1 ring-[#0B1A37]/10 xl:hidden">
                    <span className="text-[15px] font-semibold text-[#0B1A37]">
                      Found this helpful? Share it with a friend.
                    </span>
                    <ShareButtons title={blog.title} />
                  </div>

                  {/* Author */}
                  <div className="relative mt-[40px] flex flex-col gap-[20px] overflow-hidden rounded-[20px] bg-[#0B1A37] p-[24px] sm:flex-row sm:items-center md:p-[28px]">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-[60px] -left-[40px] h-[180px] w-[180px] rounded-full bg-[#EECC65] opacity-[0.12] blur-[60px]"
                    />
                    <AuthorAvatar
                      post={blog}
                      className="relative h-[72px] w-[72px] !ring-[3px] !ring-[#EECC65]"
                    />
                    <div className="relative min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#EECC65]">
                        Written by
                      </span>
                      <h3 className="!mb-[4px] !mt-[4px] !text-[20px] !font-bold !text-white">
                        {blog.author}
                      </h3>
                      <p className="!mb-0 !text-[14px] !text-white/65">
                        {authorCount} {authorCount === 1 ? "article" : "articles"} on
                        the Quran West blog
                      </p>
                    </div>
                    <Link
                      href={`/blogs?q=${encodeURIComponent(blog.author)}`}
                      className="relative inline-flex shrink-0 items-center gap-[8px] self-start rounded-full border-[1px] border-solid border-[#EECC65]/50 px-[16px] py-[10px] text-[13px] font-semibold !text-[#EECC65] !no-underline transition-colors duration-200 hover:bg-[#EECC65] hover:!text-[#0B1A37] sm:self-center"
                    >
                      More by this author
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>

                  {(prevPost || nextPost) && (
                    <nav
                      aria-label="Previous and next articles"
                      className="mt-[24px] grid gap-[16px] sm:grid-cols-2"
                    >
                      {prevPost ? <NavCard post={prevPost} /> : <span className="hidden sm:block" />}
                      {nextPost && <NavCard post={nextPost} next />}
                    </nav>
                  )}

                  <div className="mt-[40px] lg:hidden">
                    <TrialCard onTrial={() => setEnrollOpen(true)} />
                  </div>
                </div>
              </article>

              {/* Sidebar, lg+ */}
              <aside className="hidden lg:block">
                <div className="sticky top-[32px] space-y-[20px]">
                  {sections.length > 0 && (
                    <div className="rounded-2xl bg-white p-[20px] shadow-[0_10px_30px_-18px_rgba(11,26,55,0.25)] ring-1 ring-[#0B1A37]/10">
                      <div className="mb-[12px] flex items-center justify-between gap-[12px]">
                        <span className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[0.14em] text-[#0B1A37]">
                          <ListOrdered size={15} aria-hidden="true" className="text-[#9B7930]" />
                          On this page
                        </span>
                        <span className="text-[12px] font-semibold tabular-nums text-[#9B7930]">
                          {readPercent}% read
                        </span>
                      </div>
                      <TableOfContents sections={sections} active={active} />
                    </div>
                  )}
                  <TrialCard onTrial={() => setEnrollOpen(true)} />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="border-t border-solid border-[#0B1A37]/10 pb-[96px] pt-[64px]">
            <div className="container">
              <div className="mx-auto max-w-[1180px]">
                <div className="mb-[28px] flex flex-wrap items-end justify-between gap-[16px]">
                  <div>
                    <Eyebrow>Keep reading</Eyebrow>
                    <SectionHeading className="mt-[1rem]">
                      <Words text="You might" />
                      <Accent text="also like" delay={0.12} />
                    </SectionHeading>
                  </div>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-[8px] text-[14px] font-semibold !text-[#0B1A37] !no-underline transition-colors hover:!text-[#9B7930]"
                  >
                    View all articles
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((post, i) => (
                    <PostCard key={`${post.id}-${post.title}`} post={post} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />

      {/* Book a Free Trial: the enrollment form, as on the About page */}
      <AnimatePresence>
        {enrollOpen && (
          <motion.section
            className="fixed inset-0 z-[1000] flex w-full items-center justify-center bg-black/50 p-[20px]"
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
              className="scroller z-40 my-10 max-h-[90vh] w-[900px] max-w-[95vw] overflow-y-auto !rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-end py-[16px]"></div>
              <EnrollNow />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default Page;
