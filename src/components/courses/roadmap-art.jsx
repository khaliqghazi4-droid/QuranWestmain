"use client";

import { useId } from "react";
import Image from "next/image";

// The courses roadmap's gold artwork: the course icons, the nodes along the
// path and the lanterns and Quran behind it. All drawn, no photos.

const NAVY = "#0B1E36";

// A gradient id from useId (React 18 puts colons in it, which url(#…) can trip on)
function useGradientId(prefix) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

// Metallic gold: light, deep, darker and light again along the diagonal of a
// `size` box. In user space, because a gradient sized to each shape's own box
// draws nothing on a straight vertical or horizontal line (its box has no width).
function GoldGradient({ id, size }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={size} y2={size}>
      <stop offset="0%" stopColor="#F3DC86" />
      <stop offset="38%" stopColor="#D4AF37" />
      <stop offset="68%" stopColor="#A97E22" />
      <stop offset="100%" stopColor="#E9C866" />
    </linearGradient>
  );
}

// A ten-pointed rosette, the frame of the design's icons: two pentagons, one
// pointing up and one down, centred on cx, cy with their points r away
function Rosette({ cx, cy, r, ...props }) {
  const pentagon = (start) =>
    Array.from({ length: 5 }, (_, k) => {
      const a = ((start + k * 72) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
  return (
    <g {...props}>
      <polygon points={pentagon(-90)} />
      <polygon points={pentagon(90)} />
    </g>
  );
}

// What sits inside each course icon's frame (drawn in a 120×120 box)
const GLYPHS = {
  // Alif and Waw, the letters of the design's icon
  qaida: (gold) => (
    <text x="60" y="70" textAnchor="middle" fontSize="48" fontWeight="700" fill={gold} stroke="none" className="font-arabic-glyph">
      او
    </text>
  ),
  // A sound wave
  tajweed: () => (
    <g strokeWidth="3.2">
      {[8, 16, 26, 36, 44, 36, 26, 16, 8].map((h, i) => (
        <line key={i} x1={42 + i * 4.5} y1={60 - h / 2} x2={42 + i * 4.5} y2={60 + h / 2} />
      ))}
    </g>
  ),
  // The Quran kept in the heart: a heart with a pearl inside
  hifz: (gold) => (
    <g>
      <path d="M60 80 C 46 70, 38 61, 41 52 C 44 43, 55 42, 60 50 C 65 42, 76 43, 79 52 C 82 61, 74 70, 60 80 Z" />
      <circle cx="60" cy="59" r="3.6" fill={gold} stroke="none" />
    </g>
  ),
  // Ayn, for the Arabic language
  arabic: (gold) => (
    <text x="60" y="72" textAnchor="middle" fontSize="44" fontWeight="700" fill={gold} stroke="none" className="font-arabic-glyph">
      ع
    </text>
  ),
  // A mihrab arch with a lamp hanging in it
  studies: (gold) => (
    <g>
      <path d="M45 82 V59 C45 48 52 41 60 35 C68 41 75 48 75 59 V82" />
      <path d="M40 82 H80" />
      <path d="M60 41 V49" strokeWidth="1.6" />
      <path d="M55 49 H65 L63 57 Q60 61 57 57 Z" fill={gold} stroke="none" />
    </g>
  ),
  // An open book on a rehal stand
  tafseer: () => (
    <g>
      <path d="M60 50 C 52 45, 44 45, 38 47 V 69 C 44 67, 52 67, 60 72 Z" />
      <path d="M60 50 C 68 45, 76 45, 82 47 V 69 C 76 67, 68 67, 60 72 Z" />
      <path d="M44 53 C 48 52, 52 52, 55 54 M44 59 C 48 58, 52 58, 55 60 M65 54 C 68 52, 72 52, 76 53 M65 60 C 68 58, 72 58, 76 59" strokeWidth="1.4" />
      <path d="M46 86 L74 74 M74 86 L46 74" />
    </g>
  ),
};

// A course's icon: its glyph in a gold ring inside a fine ten-pointed rosette
export function CourseIcon({ name, className = "" }) {
  const id = useGradientId("icon-gold");
  const gold = `url(#${id})`;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <GoldGradient id={id} size={120} />
      </defs>
      <g fill="none" stroke={gold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <Rosette cx={60} cy={60} r={56} strokeWidth="1.6" />
        <circle cx="60" cy="60" r="37" strokeWidth="2.8" />
        <g transform="translate(60 60) scale(1.12) translate(-60 -60)">{GLYPHS[name](gold)}</g>
      </g>
    </svg>
  );
}

// A node at a bend of the path: a navy planet with a gold orbit ("orbit"),
// a navy ten-pointed rosette ("star"), or both ("starOrbit")
export function RoadmapNode({ variant = "orbit", className = "" }) {
  const id = useGradientId("node-gold");
  const gold = `url(#${id})`;
  const star = variant !== "orbit";
  const orbit = variant !== "star";
  return (
    <svg
      viewBox="0 0 100 100"
      className={`overflow-visible drop-shadow-[0_6px_10px_rgba(11,30,54,0.35)] ${
        // will-change: its own GPU layer, so the turning isn't a repaint each frame
        orbit ? "animate-[noor-spin_30s_linear_infinite] will-change-transform motion-reduce:animate-none" : ""
      } ${className}`}
      aria-hidden="true"
    >
      <defs>
        <GoldGradient id={id} size={100} />
      </defs>
      {/* the back half of the orbit, behind the planet */}
      {orbit && <ellipse cx="50" cy="50" rx="47" ry="15" transform="rotate(-24 50 50)" fill="none" stroke={gold} strokeWidth="3.5" />}
      {/* filled first and outlined after, so both pentagons' lines show */}
      {star && <Rosette cx={50} cy={50} r={46} fill={NAVY} stroke="none" />}
      {star && <Rosette cx={50} cy={50} r={46} fill="none" stroke={gold} strokeWidth="2.6" strokeLinejoin="round" />}
      <circle cx="50" cy="50" r="28" fill={NAVY} stroke={gold} strokeWidth={star ? 3 : 4.5} />
      {/* the front half of the orbit, across the planet */}
      {orbit && (
        <path d="M3 50 A 47 15 0 0 0 97 50" transform="rotate(-24 50 50)" fill="none" stroke={gold} strokeWidth="3.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

// A hanging lantern with a flame glowing inside, on `chain` units of chain:
// fine lines in currentColor, the lantern itself 60×112. It swings from the
// top of its box (`origin-top`).
function Lantern({ chain = 40, className = "" }) {
  const glow = useGradientId("lantern-glow");
  return (
    <svg viewBox={`0 0 60 ${chain + 112}`} className={`h-auto origin-top ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#F1D67E" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F1D67E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={`M30 0 V${chain}`} stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2.4" />
      <g transform={`translate(0 ${chain})`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="30" cy="58" r="27" fill={`url(#${glow})`} stroke="none" />
        {/* the ring, the domed cap and its band */}
        <circle cx="30" cy="4" r="3.5" />
        <path d="M30 7.5 V11" />
        <path d="M20 22 C 20 15, 27 14, 30 11 C 33 14, 40 15, 40 22 Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M17 22 H43 L45 26 H15 Z" />
        {/* the six-sided body, seen face on, with a pointed-arch window and the flame */}
        <path d="M15 26 L10 38 V70 L15 82 H45 L50 70 V38 L45 26 Z" />
        <path d="M20 26 L18 38 V70 L20 82 M40 26 L42 38 V70 L40 82" strokeWidth="0.8" />
        <path d="M23 74 V47 C 23 41, 29 37, 30 34 C 31 37, 37 41, 37 47 V74 Z" strokeWidth="1" />
        <path d="M30 51 C 34 56, 34.5 62, 30 66 C 25.5 62, 26 56, 30 51 Z" fill="#E2B13C" stroke="none" />
        {/* the base, tapering to a drop */}
        <path d="M15 82 H45 L43 86 H17 Z" />
        <path d="M17 86 L30 100 L43 86" />
        <path d="M30 100 V105" />
        <circle cx="30" cy="108" r="2.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

// The courses page's backdrop (behind the section's content: the section
// needs `relative isolate overflow-hidden`): on laptops, lanterns swinging
// gently at the top left and, at the top right below the end of the heading,
// a Quran in navy smoke (public/decor). Phones and tablets stay plain,
// as the heading fills the width there.
export function QuranBackdrop() {
  const sway = "motion-reduce:animate-none";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden text-[#C9A13B] lg:block">
      <div className="absolute left-[1rem] top-0 flex items-start gap-[1rem] opacity-[0.75] xl:left-[1.5rem] xl:gap-[1.25rem] 2xl:left-[2rem]">
        <Lantern chain={34} className={`w-[2.2rem] animate-[noor-sway_5s_ease-in-out_infinite_alternate] xl:w-[2.6rem] 2xl:w-[2.8rem] ${sway}`} />
        <Lantern chain={84} className={`w-[2.7rem] animate-[noor-sway_6.5s_ease-in-out_-2s_infinite_alternate] xl:w-[3.2rem] 2xl:w-[3.5rem] ${sway}`} />
        <Lantern chain={52} className={`hidden w-[2.6rem] animate-[noor-sway_5.8s_ease-in-out_-4s_infinite_alternate] 2xl:block ${sway}`} />
      </div>
      <Image
        src="/decor/quran-cloud.webp"
        alt=""
        width={472}
        height={480}
        priority
        className="absolute right-[1rem] top-[7rem] h-auto w-[13rem] rotate-[8deg] opacity-[0.6] xl:right-[2rem] xl:top-[5.5rem] xl:w-[17rem] 2xl:top-[6rem] 2xl:w-[20rem]"
      />
    </div>
  );
}

// A ten-pointed rosette in a ring, in gold (the instructor page's medallion
// and the mark on its career cards). `filled` gives it a navy ground.
export function RosetteMark({ className = "", filled = false }) {
  const id = useGradientId("mark-gold");
  const gold = `url(#${id})`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <GoldGradient id={id} size={100} />
      </defs>
      {filled && <Rosette cx={50} cy={50} r={47} fill={NAVY} stroke="none" />}
      <Rosette cx={50} cy={50} r={47} fill="none" stroke={gold} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="31" fill={filled ? NAVY : "none"} stroke={gold} strokeWidth="2.4" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
