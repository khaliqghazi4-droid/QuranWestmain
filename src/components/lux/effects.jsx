"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { EASE, VIEWPORT } from "@/components/noor/motion";

// Writes the pointer's position inside the element to --x / --y, for
// spotlight gradients. Sets the style directly, so nothing re-renders.
export function setPointerVars(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--x", `${e.clientX - r.left}px`);
  el.style.setProperty("--y", `${e.clientY - r.top}px`);
}

// A card that leans towards a mouse pointer in 3D and keeps --x / --y updated
// for a spotlight. Touch screens have no pointer to follow, so there the card
// tips back as it comes up the screen, is level mid-screen and tips forward
// as it leaves. Reduced motion gets no tilt.
export function TiltCard({ children, className = "", max = 7 }) {
  const reduceMotion = useReducedMotion();
  const outerRef = useRef(null);
  const [touch, setTouch] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 22 });

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (touch && !reduceMotion) rx.set((0.5 - v) * 2 * max);
  });

  const onPointerMove = (e) => {
    setPointerVars(e);
    if (reduceMotion || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    rx.set(0);
    ry.set(0);
  };

  return (
    <div ref={outerRef} className="h-full [perspective:1000px]">
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ rotateX, rotateY }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pulls its child a little towards a mouse pointer, and springs back
export function Magnetic({ children, strength = 0.3, className = "" }) {
  const reduceMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 18 });
  const y = useSpring(my, { stiffness: 260, damping: 18 });

  const onPointerMove = (e) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Variants for a heading whose words rise out of a mask. Put
// initial="hidden" whileInView="shown" on the heading itself (a fully masked
// word can't watch for the scroll), then the words inside with <Words>.
export const wordsParent = { hidden: {}, shown: {} };

export function Words({ text, className = "", delay = 0, step = 0.055 }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
        <motion.span
          className={`inline-block ${className}`}
          variants={{
            hidden: { y: "112%" },
            shown: { y: 0, transition: { duration: 0.85, ease: EASE, delay: delay + i * step } },
          }}
        >
          {word}
        </motion.span>
      </span>{" "}
    </Fragment>
  ));
}

// Small label above a heading: a short gold line and spaced capitals
export function Eyebrow({ children, tone = "light", className = "" }) {
  const color = tone === "dark" ? "text-[#EECC65]" : "text-[#9B7930]";
  return (
    <span className={`inline-flex items-center gap-[0.75rem] text-[0.78rem] font-bold uppercase tracking-[0.22em] ${color} ${className}`}>
      <span aria-hidden="true" className="h-px w-[2rem] bg-current" />
      {children}
    </span>
  );
}

// A page's title (its one h1), in the home page's heading style at a page
// title's size: its words rise one by one as the page opens, the last ones
// in the gold serif (<Accent>). `tone="dark"` is for navy heroes.
export function PageTitle({ children, tone = "light", className = "", ...props }) {
  return (
    <motion.h1
      initial="hidden"
      animate="shown"
      variants={wordsParent}
      {...props}
      className={`!mb-0 !text-[clamp(2rem,min(3.6vw,6.4vh),3.5rem)] !font-extrabold !leading-[1.1] !tracking-[-0.03em] [text-wrap:balance] ${
        tone === "dark" ? "text-white" : "text-[#0B1A37]"
      } ${className}`}
    >
      {children}
    </motion.h1>
  );
}

// The home page's one heading style: every section's heading has the same
// size and weight, its words rise one by one, and its last words are in the
// gold serif (<Accent>). `tone="dark"` is for navy sections.
export function SectionHeading({ children, tone = "light", className = "" }) {
  return (
    <motion.h2
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={wordsParent}
      className={`!mb-0 !text-[clamp(2rem,min(3.3vw,5.8vh),3.2rem)] !font-extrabold !leading-[1.08] !tracking-[-0.03em] ${
        tone === "dark" ? "text-white" : "text-[#0B1A37]"
      } ${className}`}
    >
      {children}
    </motion.h2>
  );
}

// The gold serif look of <Accent>, for accent words in a heading whose words
// don't rise (a card's title, say)
export const accentClass = (tone = "light") =>
  `font-accent text-[1.12em] !font-normal italic tracking-[-0.01em] ${
    tone === "dark" ? "lux-gold-text pr-[0.06em]" : "text-[#9B7930]"
  }`;

// The gold serif words of a SectionHeading
export function Accent({ text, tone = "light", delay = 0 }) {
  return <Words text={text} delay={delay} className={accentClass(tone)} />;
}

// The look of <Lead>, for a paragraph that keeps its own element
export const leadClass = (tone = "light") =>
  `!mb-0 !text-[clamp(0.95rem,2.2vh,1.08rem)] !font-normal !leading-[1.65] ${
    tone === "dark" ? "!text-white/65" : "!text-[#0B1A37]/65"
  }`;

// The line or two of text under a SectionHeading
export function Lead({ children, tone = "light", className = "" }) {
  return <p className={`${leadClass(tone)} ${className}`}>{children}</p>;
}
