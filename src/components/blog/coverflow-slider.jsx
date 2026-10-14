"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AuthorAvatar,
  CategoryTag,
  PostMeta,
  label,
  media,
  titleClass,
} from "./blog-card";

// Excerpt lines that fit a slider card of a given height (see excerptLines)
const EXCERPT_CLAMP = [
  "hidden",
  "line-clamp-1",
  "line-clamp-2",
  "line-clamp-3",
];

// The slider's CSS perspective, also used to place the side cards (below)
const PERSPECTIVE = 1200;

// How the cards glide from one place to the next: a gentle start and finish
const MOVE_MS = 800;
const MOVE_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

// 3D slider: the centre card faces forward and the cards either side turn
// away into the distance. Clicking a side card brings it to the centre;
// clicking the centre card opens the article.
//
// Cards are sized so the categories, the view switch and the whole slider fit
// in one screen: the card gets the window height left after everything from
// `fitFromRef` (the categories) down to the slider, less `reserve` px for
// anything else that must share the screen (the home page keeps room for the
// sticky header and its section's padding). How many cards show each side
// depends on the width: on wide screens more fan out, out to the arrows.
//
// `autoplay` (ms) moves on to the next card by itself, that long after each
// change, so an arrow, a dot or a card click restarts the wait. `onChange`
// hears which post is at the centre, each time that changes.
export default function CoverflowSlider({ posts: list, fitFromRef, reserve = 0, autoplay = 0, onChange }) {
  const [current, setCurrent] = useState(0);
  const [moving, setMoving] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({
    mobile: false,
    w: 300,
    h: 420,
    half: 600,
  });
  const wrapRef = useRef(null);

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth <= 768;
      const above =
        fitFromRef?.current && wrapRef.current
          ? wrapRef.current.getBoundingClientRect().top -
            fitFromRef.current.getBoundingClientRect().top
          : 140;
      // 56 = the dots under the slider plus a little air; 40 = slack, so it
      // still fits when the visitor stops scrolling a little early or late.
      // The centre card is drawn at 1.05x its size.
      const room = (window.innerHeight - above - 56 - 40 - reserve) / 1.05;
      const h = Math.round(
        Math.min(mobile ? 380 : 440, Math.max(mobile ? 320 : 300, room)),
      );
      setSize({
        mobile,
        h,
        w: Math.round(h * (mobile ? 0.68 : 0.72)),
        half: (wrapRef.current?.offsetWidth || 1200) / 2,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fitFromRef, reserve]);

  useEffect(() => {
    setCurrent(0);
  }, [list]);

  useEffect(() => {
    if (list[current]) onChange?.(list[current]);
  }, [current, list, onChange]);

  // Autoplay holds while a keyboard user is inside the slider, and stays off
  // for visitors who ask for reduced motion
  useEffect(() => {
    if (!autoplay || keyboardFocus || reduceMotion || list.length < 2) return;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % list.length), autoplay);
    return () => clearTimeout(timer);
  }, [autoplay, keyboardFocus, reduceMotion, current, list.length]);

  // The centre glow fades out while the cards are on the move
  useEffect(() => {
    setMoving(true);
    const timer = setTimeout(() => setMoving(false), MOVE_MS * 0.8);
    return () => clearTimeout(timer);
  }, [current]);

  const count = list.length;
  if (count === 0) return null;

  const { mobile, w, h, half } = size;
  // Room left in the card body under the 16:9 image, after its padding and
  // the date, tag, title and author rows (131px); a line is 21px, plus a
  // 10px gap under the excerpt
  const excerptLines = Math.max(
    0,
    Math.min(3, Math.floor((h - w * 0.5625 - 32 - 131 - 10) / 21)),
  );

  const prev = () => setCurrent((c) => (c === 0 ? count - 1 : c - 1));
  const next = () => setCurrent((c) => (c === count - 1 ? 0 : c + 1));

  // Signed distance from the centre card, wrapping round so the slider loops
  const offsetOf = (i) => {
    if (count <= 1) return 0;
    let d = i - current;
    if (d > (count - 1) / 2) d -= count;
    else if (d <= -count / 2) d += count;
    return d;
  };

  // Side cards, all in proportion to the card width so smaller cards keep the
  // same look. `first` is how far the nearest side card sits from the centre
  // (as seen, after perspective); each further card sits `gap` beyond it.
  // Phones keep two cards each side. Wider screens fit as many as reach the
  // arrows (64px each side), up to 6, spread evenly over that room.
  const first = w * (mobile ? 0.21 : 0.34);
  let sideCount = 2;
  let gap = w * (mobile ? 0.26 : 0.42);
  if (!mobile) {
    const room = half - 64 - first - w * 0.25;
    sideCount = Math.min(6, Math.max(2, Math.floor(room / (w * 0.42)) + 1));
    gap = Math.min(w * 0.55, room / (sideCount - 1));
  }

  // Side card n (1 = next to the centre): pushed back in depth, then moved
  // out far enough that perspective still shows it at first + (n-1) * gap.
  // Depth grows more slowly after the second card so far cards stay readable.
  const slot = (n) => {
    const depth = w * (mobile ? 0.33 : 0.42);
    const z = -depth * Math.min(n, 2) - w * 0.18 * Math.max(0, n - 2);
    const seen = first + (n - 1) * gap;
    return {
      x: (seen * (PERSPECTIVE - z)) / PERSPECTIVE,
      z,
      scale: 0.88 - (n - 1) * 0.04,
      opacity: 0.7 - (n - 1) * 0.1,
    };
  };

  const cardStyle = (i) => {
    const d = offsetOf(i);
    const dist = Math.abs(d);
    const side = d > 0 ? 1 : -1;
    if (d === 0) {
      return {
        transform: "translate3d(0, 0, 0) scale(1.05) rotateY(0deg)",
        opacity: 1,
        zIndex: 20,
        pointerEvents: "auto",
      };
    }
    // Cards past the last slot wait, hidden, just beyond it, so they slide
    // in from the outside rather than across the slider
    const { x, z, scale, opacity } = slot(Math.min(dist, sideCount + 1));
    const hidden = dist > sideCount;
    return {
      transform: `translate3d(${side * x}px, 0, ${z}px) scale(${scale}) rotateY(${-side * 40}deg)`,
      opacity: hidden ? 0 : opacity,
      visibility: hidden ? "hidden" : "visible",
      zIndex: 20 - dist,
      // Side cards take clicks too (see onClick below); without this a click
      // on one fell through to the centre card behind it and opened that
      pointerEvents: hidden ? "none" : "auto",
    };
  };

  // A plain click on a side card brings it to the centre; a click on the
  // centre card opens it. Ctrl/Cmd/middle-click still opens any card in a
  // new tab, as a link would.
  const onCardClick = (e, i) => {
    if (i === current) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setCurrent(i);
  };

  const navButton =
    "absolute top-1/2 z-30 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full border-[1px] border-solid border-white/15 bg-[#0B1A37]/85 !p-0 text-white backdrop-blur-[8px] transition-all duration-300 hover:scale-[1.08] hover:border-[#EECC65] hover:bg-[#EECC65] hover:text-[#0B1A37] hover:shadow-[0_0_20px_rgba(238,204,101,0.45)] active:scale-95";

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none"
      onFocus={(e) => setKeyboardFocus(e.target.matches(":focus-visible"))}
      onBlur={() => setKeyboardFocus(false)}
    >
      <div
        className="relative flex w-full items-center justify-center"
        style={{ height: Math.round(h * 1.05) + 12, perspective: PERSPECTIVE }}
      >
        {count > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Previous article"
            className={`${navButton} left-1 lg:-left-2.5`}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* The centre card's gold glow and deep shadow, drawn once behind the
            centre slot rather than on the cards: big shadows on the moving
            cards had to be redrawn at the start of every move, and the slide
            stuttered. It fades while the cards move. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl transition-opacity duration-300 ease-out"
          style={{
            width: w,
            height: h,
            transform: "scale(1.05)",
            boxShadow: "0 0 40px rgba(238, 204, 101, 0.25), 0 20px 50px rgba(11, 26, 55, 0.35)",
            opacity: moving ? 0 : 1,
          }}
        />

        {/* pointer-events-none: in 3D this track sits in front of the side
            cards (they are pushed back in depth) and would take their clicks */}
        <div className="pointer-events-none relative flex h-full w-full items-center justify-center [transform-style:preserve-3d]">
          {list.map((post, i) => {
            const isActive = i === current;
            return (
              <Link
                key={post.key}
                href={`/blogs/${post.id}`}
                onClick={(e) => onCardClick(e, i)}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
                className={`absolute flex flex-col overflow-hidden rounded-2xl border-[1px] border-solid border-[#0B1A37]/10 bg-white !no-underline [backface-visibility:hidden] [transform-style:preserve-3d] ${
                  isActive ? "group" : ""
                }`}
                style={{
                  width: w,
                  height: h,
                  // small and the same on every card, so a move redraws nothing
                  boxShadow: "0 8px 18px -6px rgba(11, 26, 55, 0.22)",
                  // visibility too, so a card leaving past the last slot fades
                  // out before it is hidden
                  transition: `transform ${MOVE_MS}ms ${MOVE_EASE}, opacity ${MOVE_MS}ms ${MOVE_EASE}, visibility ${MOVE_MS}ms`,
                  ...cardStyle(i),
                }}
              >
                <div className={`${media} aspect-video shrink-0`}>
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <CategoryTag className="left-[12px] top-[12px]">
                    {post.category}
                  </CategoryTag>
                </div>
                <div className="flex min-h-0 flex-grow flex-col justify-between p-[16px] text-left">
                  <div className="flex min-h-0 flex-grow flex-col">
                    <PostMeta
                      post={post}
                      size={11}
                      className="mb-[8px] shrink-0"
                    />
                    <p className={`${label} !mb-[4px] shrink-0`}>
                      {post.tags?.[0] || post.category}
                    </p>
                    <h3
                      className={`${titleClass} !mb-[6px] line-clamp-2 shrink-0 !text-[16px] !leading-snug`}
                    >
                      {post.title}
                    </h3>
                    <p
                      className={`!mb-[10px] min-h-0 !text-[13px] !leading-relaxed !text-[#0B1A37]/65 ${EXCERPT_CLAMP[excerptLines]}`}
                    >
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5 border-t border-solid border-[#0B1A37]/10 pt-[10px]">
                    <AuthorAvatar post={post} className="h-6 w-6" />
                    <span className="truncate text-[12px] font-semibold text-[#0B1A37]">
                      {post.author}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {count > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next article"
            className={`${navButton} right-1 lg:-right-2.5`}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="mt-[10px] flex justify-center gap-2">
          {list.map((post, i) => (
            <button
              key={post.key}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to article ${i + 1}`}
              aria-current={i === current}
              className={`h-2.5 w-2.5 rounded-full !p-0 transition-all duration-300 ${
                i === current
                  ? "scale-125 bg-[#EECC65] shadow-[0_0_8px_rgba(238,204,101,0.6)]"
                  : "bg-[#0B1A37]/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
