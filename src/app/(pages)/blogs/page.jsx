"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderOpen,
  GraduationCap,
  Newspaper,
  Search,
  SearchX,
  Tag,
} from "lucide-react";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import EnrollNow from "@/components/footer/enrollNow/enrollNow";
import {
  AuthorAvatar,
  CardFooter,
  CategoryTag,
  PostCard,
  card,
  cardLink,
  excerptClass,
  label,
  media,
  titleClass,
} from "@/components/blog/blog-card";
import CoverflowSlider from "@/components/blog/coverflow-slider";
import { Accent, Words, wordsParent } from "@/components/lux/effects";
import { blogs } from "./data";

// Page order: hero with search, featured article, category pills, then the
// articles as a 3D slider or a grid with a sidebar. Colours are the site's
// navy (#0B1A37) and gold (#EECC65); on white, gold text uses the darker
// #9B7930, since the brand gold is hard to read there.

// `key`: the React key for each post's cards (position as well as id, so a
// repeated id in data.js can't break the lists)
const posts = blogs.map((post, i) => ({ ...post, key: `${post.id}-${i}` }));
const featuredPost = posts.find((post) => post.featured) || posts[0];
const categories = ["All", ...new Set(posts.map((post) => post.category))];
const categoryCounts = posts.reduce((counts, post) => {
  counts[post.category] = (counts[post.category] || 0) + 1;
  return counts;
}, {});
const popularTags = Object.entries(
  posts
    .flatMap((post) => post.tags || [])
    .reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {}),
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .map(([tag]) => tag);

// Post dates are written "21 July 2026"
const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const dateValue = (date) => {
  const [day, month, year] = String(date).split(" ");
  const m = MONTHS.indexOf((month || "").toLowerCase());
  return m < 0 ? 0 : new Date(Number(year), m, Number(day)).getTime();
};
const latestPosts = [...posts]
  .sort((a, b) => dateValue(b.date) - dateValue(a.date))
  .slice(0, 4);

// Grid page size below lg; beside the sidebar it follows the sidebar's height
const POSTS_PER_PAGE = 6;

const matchesQuery = (post, q) =>
  [
    post.title,
    post.category,
    post.excerpt,
    post.author,
    ...(post.tags || []),
  ].some((text) => (text || "").toLowerCase().includes(q));

const filterPosts = (category, query) => {
  const q = query.toLowerCase().trim();
  return posts.filter(
    (post) =>
      (category === "All" || post.category === category) &&
      (!q || matchesQuery(post, q)),
  );
};

// Hero: heading, intro, a search box and the categories. Typing filters the
// articles below and lists up to 5 matches under the box (arrow keys + Enter
// to open one).
const BlogHero = ({ query, onQueryChange, category, onCategory }) => {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => {
    const closeOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  useEffect(() => {
    setActive(-1);
  }, [query, open]);

  const q = query.toLowerCase().trim();
  const suggestions = q
    ? posts.filter((post) => matchesQuery(post, q)).slice(0, 5)
    : [];

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(`/blogs/${suggestions[active].id}`);
    }
  };

  // Outline shapes drifting in the background (md+)
  const float = (animate, duration) =>
    reduceMotion
      ? {}
      : { animate, transition: { repeat: Infinity, duration, ease: "linear" } };

  return (
    <section className="relative z-20 flex min-h-[40vh] items-center justify-center !bg-[#0B1A37] py-[2rem] md:py-[2.25rem]">
      {/* Soft gold glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-[#EECC65] opacity-[0.14] blur-[120px]" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-[#2B4A8C] opacity-50 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute right-[20%] top-[30%] h-[25%] w-[25%] animate-pulse rounded-full bg-[#EECC65] opacity-[0.08] blur-[100px]"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="container relative z-10 text-center">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* one line at every width: the size follows the screen width */}
          <motion.h1
            initial="hidden"
            animate="shown"
            variants={wordsParent}
            className="!mb-6 !text-[clamp(1.75rem,7.2vw,4rem)] !font-extrabold !leading-tight !tracking-[-0.03em] text-white"
          >
            <Words text="The Quran West" />
            <Accent text="Blogs" tone="dark" delay={0.2} />
          </motion.h1>

          <motion.div
            className="mx-auto max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div ref={boxRef} className="group relative">
              <div
                aria-hidden="true"
                className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#EECC65] to-[#9B7930] opacity-30 blur transition-opacity duration-300 group-hover:opacity-50"
              />
              <div className="relative flex items-center rounded-2xl border-[1px] border-solid border-white/15 bg-white px-[20px] py-[12px] shadow-[0_10px_25px_-8px_rgba(11,26,55,0.18)]">
                <Search
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-[#0B1A37]/50"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    onQueryChange(e.target.value);
                    setOpen(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => setOpen(query.trim().length > 0)}
                  onKeyDown={onKeyDown}
                  placeholder="Search articles by title, topic or keyword..."
                  aria-label="Search articles"
                  role="combobox"
                  aria-expanded={open && q.length > 0}
                  aria-controls="blog-search-results"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    active >= 0 ? `blog-search-${active}` : undefined
                  }
                  className="!ml-3 w-full !border-0 bg-transparent !p-0 !text-base text-[#0B1A37] !shadow-none !outline-none placeholder:text-[#0B1A37]/45"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      onQueryChange("");
                      setOpen(false);
                    }}
                    className="!ml-2 shrink-0 text-[14px] font-medium text-[#0B1A37]/55 transition-colors hover:text-[#0B1A37]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {open && q && (
                <div
                  id="blog-search-results"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-50 mt-[12px] overflow-hidden rounded-2xl border-[1px] border-solid border-[#0B1A37]/10 bg-white text-left shadow-2xl"
                >
                  {suggestions.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {suggestions.map((post, i) => (
                        <Link
                          key={post.key}
                          id={`blog-search-${i}`}
                          role="option"
                          aria-selected={i === active}
                          href={`/blogs/${post.id}`}
                          onClick={() => setOpen(false)}
                          className={`group/item flex items-center gap-[12px] rounded-xl p-[12px] !no-underline ${
                            i === active
                              ? "border-l-4 border-solid border-[#EECC65] bg-[#EECC65]/15 pl-2"
                              : "transition-colors duration-75 hover:bg-[#EECC65]/10"
                          }`}
                        >
                          <img
                            src={post.image}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg border-[1px] border-solid border-[#0B1A37]/10 bg-[#F4EEE3] object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-[#9B7930]">
                              {post.category}
                            </span>
                            <span className="block truncate text-[14px] font-semibold text-[#0B1A37] transition-colors group-hover/item:text-[#9B7930]">
                              {post.title}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-[20px] text-center text-[14px] text-[#0B1A37]/55">
                      No matching articles found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* wider than the heading's column, so on laptops they fit one row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <CategoryPills active={category} onSelect={onCategory} />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute left-[8%] top-[18%] hidden h-16 w-16 rounded-xl border-[1px] border-solid border-[#EECC65]/30 md:block"
          {...float({ rotate: 360, y: [0, 20, 0] }, 8)}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-[22%] right-[12%] hidden h-12 w-12 rounded-full border-[1px] border-solid border-white/25 md:block"
          {...float({ rotate: -360, y: [0, -30, 0] }, 6)}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-[8%] top-[30%] hidden h-8 w-8 rounded-lg border-[1px] border-solid border-[#EECC65]/20 lg:block"
          {...float({ rotate: 180, x: [0, 15, 0] }, 10)}
        />
      </div>
    </section>
  );
};

// One large card: image on the left from lg up (on top below that). It comes
// after the articles, whose section's bottom padding spaces it from them.
// It shows the slider's centre article, so it changes with the slider: the
// picture crossfades, and the words fade out and the new ones in, the card
// keeping its size throughout.
const FeaturedPost = ({ post }) => (
  <section className="pb-16 md:pb-24">
    <div className="container">
      <motion.div
        className="mx-auto max-w-[1080px]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8 flex items-center gap-[12px]">
          <div className="h-px flex-1 bg-[#0B1A37]/15" />
          <span className={label}>Featured Article</span>
          <div className="h-px flex-1 bg-[#0B1A37]/15" />
        </div>
        <Link
          href={`/blogs/${post.id}`}
          aria-label={`${post.title}: read featured article`}
          className={`${cardLink} !rounded-3xl`}
        >
          <article className={`${card} !rounded-3xl`}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div
                className={`${media} aspect-[5/3] lg:aspect-auto lg:min-h-[320px]`}
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={post.key}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white/10"
                    />
                    <CategoryTag className="left-5 top-5 px-[12px]">
                      {post.category}
                    </CategoryTag>
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Every article's words sit stacked in one grid cell, only the
                  shown one visible: the cell is as tall as the longest, so
                  the card keeps one size whichever article it shows (on
                  laptops the picture beside it stretches to the same height) */}
              <div className="grid content-center p-6 md:p-8 lg:p-10">
                {posts.map((p) => {
                  const shown = p.key === post.key;
                  return (
                    <div
                      key={p.key}
                      aria-hidden={!shown}
                      className="col-start-1 row-start-1 self-center"
                      style={{
                        opacity: shown ? 1 : 0,
                        visibility: shown ? "visible" : "hidden",
                        // the old words fade out, then the new ones in
                        transition: shown
                          ? "opacity 0.35s ease-out 0.25s, visibility 0s"
                          : "opacity 0.25s ease-in, visibility 0s linear 0.25s",
                      }}
                    >
                      {/* the editor's pick says so; the others give their topic */}
                      <p className={`${label} !mb-2`}>
                        {p.key === featuredPost.key ? "Editor’s Pick" : p.tags?.[0] || p.category}
                      </p>
                      <h2
                        className={`${titleClass} !mb-3 !text-xl !leading-tight md:!text-2xl lg:!text-3xl`}
                      >
                        {p.title}
                      </h2>
                      <p
                        className={`${excerptClass} !mb-5 line-clamp-3 md:!text-base`}
                      >
                        {p.excerpt}
                      </p>
                      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#0B1A37]/55">
                        <span className="flex items-center gap-2">
                          <AuthorAvatar post={p} className="h-8 w-8" />
                          <span className="font-medium text-[#0B1A37]">
                            {p.author}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14} aria-hidden="true" />
                          {p.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} aria-hidden="true" />
                          {p.readTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <CardFooter label="Read featured article" />
              </div>
            </div>
          </article>
        </Link>
      </motion.div>
    </div>
  </section>
);

// The categories, under the hero's search box, on its navy: tags that wrap
// onto as many centred lines as they need, so every category shows at once
// (on phones too, rather than a row that scrolls sideways out of sight)
const CategoryPills = ({ active, onSelect }) => (
  <div className="mt-[1.25rem]">
    <div
      role="group"
      aria-label="Browse by category"
      className="flex flex-wrap justify-center gap-[8px]"
    >
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(category)}
            className={`whitespace-nowrap rounded-full border-[1px] border-solid px-[14px] py-[5px] text-[13px] font-semibold transition-all duration-300 ${
              isActive
                ? "border-[#EECC65] bg-[#EECC65] text-[#0B1A37] shadow-[0_0_15px_rgba(238,204,101,0.35)]"
                : "border-white/20 bg-white/[0.06] text-white/75 hover:border-[#EECC65] hover:text-white"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  </div>
);

// Up to 5 page numbers, centred on the current page where possible
const Pagination = ({ page, totalPages, onChange }) => {
  let start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const base =
    "flex h-10 w-10 items-center justify-center rounded-xl !p-0 text-[14px] font-semibold transition-all duration-300";
  const idle =
    "border-[1px] border-solid border-[#0B1A37]/15 bg-white text-[#0B1A37]/60 hover:border-[#EECC65] hover:text-[#0B1A37]";

  return (
    <motion.nav
      aria-label="Article pages"
      className="mt-12 flex items-center justify-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${base} ${idle} disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${base} ${
            p === page
              ? "bg-[#EECC65] text-[#0B1A37] shadow-[0_10px_20px_-6px_rgba(238,204,101,0.55)]"
              : idle
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${base} ${idle} disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronRight size={18} />
      </button>
    </motion.nav>
  );
};

const PostGrid = ({ posts: list, page, onPageChange, sidebarRef }) => {
  const topRef = useRef(null);
  const gridRef = useRef(null);
  const [perPage, setPerPage] = useState(POSTS_PER_PAGE);
  const hasPosts = list.length > 0;

  // Beside the sidebar (lg+), a page holds as many rows of cards as fill the
  // sidebar's height, so no empty space is left next to it; page numbers only
  // appear when there are more posts than that. Below lg the sidebar sits
  // under the cards, so a page is POSTS_PER_PAGE.
  useEffect(() => {
    const aside = sidebarRef?.current;
    if (!aside || !hasPosts) return;
    const fit = () => {
      const grid = gridRef.current;
      const card = grid?.firstElementChild;
      if (!grid || !card || window.innerWidth < 992) {
        setPerPage(POSTS_PER_PAGE);
        return;
      }
      const style = getComputedStyle(grid);
      const cols = style.gridTemplateColumns.split(" ").length;
      const gap = parseFloat(style.rowGap) || 0;
      const rows = Math.max(
        2,
        Math.round((aside.offsetHeight + gap) / (card.offsetHeight + gap)),
      );
      setPerPage(rows * cols);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(aside);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [sidebarRef, hasPosts]);

  if (!hasPosts) {
    return (
      <div className="min-w-0 py-20 text-center">
        <motion.div
          className="mx-auto max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <SearchX
            size={48}
            aria-hidden="true"
            className="mx-auto mb-[16px] text-[#0B1A37]/30"
          />
          <h3 className="!mb-2 !text-xl !font-semibold !text-[#0B1A37]">
            No articles found
          </h3>
          <p className="!mb-0 !text-[#0B1A37]/60">
            Try a different search, or choose another category.
          </p>
        </motion.div>
      </div>
    );
  }

  const totalPages = Math.ceil(list.length / perPage);
  // A bigger page (wider screen) can leave fewer pages than the one shown
  const current = Math.min(page, totalPages);
  const pagePosts = list.slice((current - 1) * perPage, current * perPage);
  const goToPage = (p) => {
    onPageChange(p);
    if (topRef.current) {
      const top =
        topRef.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div ref={topRef} className="min-w-0">
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 min-[1200px]:grid-cols-3"
      >
        {pagePosts.map((post, i) => (
          <PostCard key={post.key} post={post} index={i} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          page={current}
          totalPages={totalPages}
          onChange={goToPage}
        />
      )}
    </div>
  );
};

const SidebarCard = ({ title, Icon, delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="rounded-2xl border-[1px] border-solid border-[#0B1A37]/10 bg-white p-[20px] shadow-[0_10px_25px_-8px_rgba(11,26,55,0.18)] md:p-6"
  >
    <div className="mb-[20px] flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EECC65]/20">
        <Icon size={16} aria-hidden="true" className="text-[#9B7930]" />
      </div>
      <h3 className="!mb-0 !text-sm !font-bold uppercase !tracking-wider !text-[#0B1A37]">
        {title}
      </h3>
    </div>
    {children}
  </motion.div>
);

// Grid view sidebar: latest articles, categories, tags and a free trial card
// lg:self-start keeps the sidebar its own height (not stretched to the row),
// which PostGrid measures to size its pages
const BlogSidebar = ({
  activeCategory,
  onCategory,
  onTag,
  onTrial,
  sidebarRef,
}) => (
  <aside ref={sidebarRef} className="space-y-6 lg:self-start">
    <SidebarCard title="Latest Articles" Icon={Newspaper}>
      <div className="space-y-4">
        {latestPosts.map((post, i) => (
          <Link
            key={post.key}
            href={`/blogs/${post.id}`}
            className="group flex items-start gap-[12px] !no-underline"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F4EEE3]">
              <img
                src={post.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-br-lg bg-[#EECC65] text-[12px] font-bold text-[#0B1A37]">
                {i + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="!mb-0 line-clamp-2 !text-sm !font-semibold !leading-snug !text-[#0B1A37] transition-colors group-hover:!text-[#9B7930]">
                {post.title}
              </h4>
              <span className="mt-1 flex items-center gap-1 text-[12px] text-[#0B1A37]/55">
                <Clock size={10} aria-hidden="true" />
                {post.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SidebarCard>

    <SidebarCard title="Categories" Icon={FolderOpen} delay={0.1}>
      <ul className="!m-0 list-none space-y-2 !p-0">
        {Object.entries(categoryCounts).map(([category, count]) => {
          const isActive = category === activeCategory;
          return (
            <li key={category}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onCategory(category)}
                className={`group flex w-full items-center justify-between rounded-lg px-[12px] py-2 text-[14px] transition-all duration-200 ${
                  isActive
                    ? "bg-[#EECC65]/15 text-[#0B1A37]"
                    : "text-[#0B1A37]/60 hover:bg-[#EECC65]/10 hover:text-[#0B1A37]"
                }`}
              >
                <span className="text-left font-medium transition-transform duration-200 group-hover:translate-x-1">
                  {category}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B1A37]/5 text-[12px] font-semibold group-hover:bg-[#EECC65]/30">
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SidebarCard>

    <SidebarCard title="Popular Tags" Icon={Tag} delay={0.2}>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTag(tag)}
            className="rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-[#FFF6F0] px-[12px] py-1.5 text-[12px] font-medium text-[#0B1A37]/60 transition-all duration-200 hover:border-[#EECC65] hover:bg-[#EECC65]/10 hover:text-[#0B1A37]"
          >
            {tag}
          </button>
        ))}
      </div>
    </SidebarCard>

    <SidebarCard title="Free Trial" Icon={GraduationCap} delay={0.3}>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#EECC65]/25 to-[#9B7930]/20 opacity-60 blur-lg"
        />
        <div className="relative rounded-xl border-[1px] border-solid border-[#0B1A37]/10 bg-[#FFF6F0] p-[20px]">
          <p className="!mb-4 !text-sm !text-[#0B1A37]/65">
            Learn the Quran one-to-one with a qualified teacher. Book a free
            trial class, with no payment and no commitment.
          </p>
          <button
            type="button"
            onClick={onTrial}
            className="btn btn-secondary btn-standard w-full"
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
      </div>
    </SidebarCard>
  </aside>
);

// The view the visitor picked (slider or grid) lasts for their visit, so
// coming back from an article shows the same one until they switch it
const VIEW_KEY = "quranwest:blogs-view";

// useLayoutEffect in the browser (it runs before the first paint, so the
// saved view shows without the slider flashing first); React warns about it
// on the server, where useEffect is used instead
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Where the list's heading lands when a filter scrolls to it: under the 68px
// sticky header, with a little air. The slider keeps that much of the screen
// free, so after the scroll it shows whole.
const LIST_SCROLL_MARGIN = 120;

const VIEWS = [
  { value: "slider", label: "3D Slider" },
  { value: "grid", label: "Grid View" },
];

const Page = () => {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("slider");

  useBrowserLayoutEffect(() => {
    try {
      const saved = sessionStorage.getItem(VIEW_KEY);
      if (saved === "slider" || saved === "grid") setView(saved);
    } catch {
      // storage blocked (private mode, settings): stay on the slider
    }
  }, []);

  const chooseView = (value) => {
    setView(value);
    try {
      sessionStorage.setItem(VIEW_KEY, value);
    } catch {
      // storage blocked: the choice just won't be remembered
    }
  };
  const [page, setPage] = useState(1);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const listRef = useRef(null);
  const sidebarRef = useRef(null);

  const filtered = useMemo(
    () => filterPosts(category, query),
    [category, query],
  );

  // The featured article follows the slider's centre card; in the grid, or
  // when nothing matches the filter, it is the editor's pick
  const [slidePost, setSlidePost] = useState(null);
  const shownFeature =
    view === "slider" && filtered.length > 0 && slidePost ? slidePost : featuredPost;

  useEffect(() => {
    setPage(1);
  }, [category, query]);

  // The article pages link their tags and author here as /blogs?q=...
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setQuery(q);
      listRef.current?.scrollIntoView({ block: "start" });
    }
  }, []);

  // The hero's categories and the sidebar's filters change the list, so
  // bring the list into view
  const showInList = (apply) => {
    apply();
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Header />
      <div className="page-content bg-light">
        <BlogHero
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategory={(c) => showInList(() => setCategory(c))}
        />

        {/* overflow-x-clip: the slider's side cards reach past the screen
            edge on phones */}
        <section className="overflow-x-clip pb-24 pt-[3rem] md:pt-[4rem]">
          <div className="container">
            <div
              ref={listRef}
              className="mb-[16px] flex items-center justify-between gap-[16px] border-b border-solid border-[#0B1A37]/10 pb-[10px]"
              style={{ scrollMarginTop: LIST_SCROLL_MARGIN }}
            >
              {/* Named only in the grid; the slider needs no label */}
              {view === "grid" && (
                <span className="text-[12px] font-bold uppercase tracking-widest text-[#0B1A37]/55">
                  All Articles
                </span>
              )}
              <div
                role="group"
                aria-label="Choose how to show the articles"
                className="ml-auto flex rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-white p-1 shadow-[0_1px_3px_rgba(11,26,55,0.08)]"
              >
                {VIEWS.map(({ value, label: text }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={view === value}
                    onClick={() => chooseView(value)}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-[16px] py-1.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      view === value
                        ? "bg-[#EECC65] text-[#0B1A37] shadow-md"
                        : "text-[#0B1A37]/55 hover:text-[#0B1A37]"
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {view === "slider" ? (
              filtered.length === 0 ? (
                <div className="rounded-2xl border-[1px] border-solid border-[#0B1A37]/10 bg-white py-20 text-center text-[#0B1A37]/55">
                  No articles found matching this filter.
                </div>
              ) : (
                <CoverflowSlider
                  posts={filtered}
                  fitFromRef={listRef}
                  reserve={LIST_SCROLL_MARGIN}
                  autoplay={3000}
                  onChange={setSlidePost}
                />
              )
            ) : (
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px] lg:gap-[40px]">
                <PostGrid
                  posts={filtered}
                  page={page}
                  onPageChange={setPage}
                  sidebarRef={sidebarRef}
                />
                <BlogSidebar
                  sidebarRef={sidebarRef}
                  activeCategory={category}
                  onCategory={(c) => showInList(() => setCategory(c))}
                  onTag={(tag) =>
                    showInList(() => {
                      setCategory("All");
                      setQuery(tag);
                    })
                  }
                  onTrial={() => setEnrollOpen(true)}
                />
              </div>
            )}
          </div>
        </section>

        <FeaturedPost post={shownFeature} />
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
