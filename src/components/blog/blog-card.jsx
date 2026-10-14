"use client";

// Blog cards and their pieces, shared by the blog list (/blogs) and the
// article pages (/blogs/[id]). Colours are the site's navy (#0B1A37) and gold
// (#EECC65); on white, gold text uses the darker #9B7930.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

// Card styles shared by the blog list and the article pages. `group` sits on the card's link, so hovering anywhere
// on the card lifts it, draws the gold top edge and turns the title gold.
export const cardLink =
  "group block h-full rounded-2xl !no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B7930]";
export const card =
  "relative overflow-hidden rounded-2xl bg-white ring-1 ring-[#0B1A37]/10 transition-[transform,box-shadow] duration-300 ease-out before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-[2px] before:origin-left before:scale-x-0 before:bg-[#EECC65] before:transition-transform before:duration-300 group-hover:before:scale-x-100";
export const cardLift =
  "group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_-20px_rgba(11,26,55,0.35)] group-hover:ring-[#EECC65]/70";
export const media = "relative overflow-hidden bg-[#F4EEE3]";
export const label =
  "!text-[11px] !font-semibold uppercase !leading-normal !tracking-[0.14em] !text-[#9B7930]";
export const titleClass =
  "!font-bold !text-[#0B1A37] transition-colors duration-300 group-hover:!text-[#9B7930]";
export const excerptClass = "!text-sm !leading-relaxed !text-[#0B1A37]/65";

export const CategoryTag = ({ children, className = "" }) => (
  <span
    className={`absolute z-10 rounded-md bg-[#EECC65] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0B1A37] ${className}`}
  >
    {children}
  </span>
);

export const AuthorAvatar = ({ post, className }) =>
  post.authorImage ? (
    <img
      src={post.authorImage}
      alt=""
      loading="lazy"
      className={`${className} shrink-0 rounded-full object-cover ring-2 ring-[#0B1A37]/10`}
    />
  ) : null;

export const PostMeta = ({ post, size, className = "" }) => (
  <div
    className={`flex flex-wrap items-center gap-[12px] text-[12px] text-[#0B1A37]/55 ${className}`}
  >
    {post.date && (
      <span className="inline-flex items-center gap-1">
        <Calendar size={size} aria-hidden="true" />
        {post.date}
      </span>
    )}
    {post.readTime && (
      <span className="inline-flex items-center gap-1">
        <Clock size={size} aria-hidden="true" />
        {post.readTime}
      </span>
    )}
  </div>
);

// `small`: the tighter version used on the grid cards
export const CardFooter = ({ label: text, small = false }) => (
  <div
    className={`mt-auto flex items-center justify-between border-t border-solid border-[#0B1A37]/10 ${
      small ? "pt-[12px]" : "pt-[16px]"
    }`}
  >
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-[#0B1A37] transition-colors duration-300 group-hover:text-[#9B7930] ${
        small ? "text-[13px]" : "text-[14px]"
      }`}
    >
      {text}
      <ArrowUpRight
        size={small ? 14 : 15}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </span>
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full border-[1px] border-solid border-[#0B1A37]/15 bg-[#FFF6F0] text-[#0B1A37]/55 transition-all duration-300 group-hover:border-[#EECC65] group-hover:bg-[#EECC65] group-hover:text-[#0B1A37] ${
        small ? "h-7 w-7" : "h-8 w-8"
      }`}
    >
      <ArrowUpRight size={small ? 13 : 14} />
    </span>
  </div>
);

// Grid card; cards fade up one after another whenever a page is shown
export const PostCard = ({ post, index }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.4,
        delay: reduceMotion ? 0 : index * 0.06,
        ease: "easeOut",
      }}
    >
      <Link
        href={`/blogs/${post.id}`}
        aria-label={`${post.title}: read article`}
        className={cardLink}
      >
        <article className={`${card} ${cardLift} flex h-full flex-col`}>
          <div className={`${media} aspect-video shrink-0`}>
            <img
              src={post.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"
            />
            <CategoryTag className="left-[12px] top-[12px]">
              {post.category}
            </CategoryTag>
          </div>
          <div className="flex flex-grow flex-col p-[16px]">
            <PostMeta post={post} size={11} className="mb-[8px]" />
            <p className={`${label} !mb-[4px]`}>
              {post.tags?.[0] || post.category}
            </p>
            <h3
              className={`${titleClass} !mb-[6px] line-clamp-2 !text-[16px] !leading-snug`}
            >
              {post.title}
            </h3>
            <p className="!mb-[12px] line-clamp-2 flex-grow !text-[13px] !leading-relaxed !text-[#0B1A37]/65">
              {post.excerpt}
            </p>
            <div className="mb-[12px] flex items-center gap-2">
              <AuthorAvatar post={post} className="h-6 w-6" />
              <span className="truncate text-[12px] font-medium text-[#0B1A37]">
                {post.author}
              </span>
            </div>
            <CardFooter label="Read article" small />
          </div>
        </article>
      </Link>
    </motion.div>
  );
};
