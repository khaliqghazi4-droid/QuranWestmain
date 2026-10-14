"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, useMinWidth } from "@/components/noor/motion";
import { Magnetic } from "@/components/lux/effects";

// The headline, word by word: the middle line is the gold serif accent
let wordCount = 0;
const headline = [
  ["The Quran Deserves a", "plain"],
  ["Teacher Who Cares.", "accent"],
  ["Not Just a Screen.", "soft"],
].map(([text, tone]) => ({
  text,
  tone,
  words: text.split(" ").map((word) => ({ word, index: wordCount++ })),
}));

const WORD_LOOK = {
  plain: "text-white",
  accent: "font-accent lux-gold-text pr-[0.06em] italic",
  soft: "text-white/55",
};

// Thin gold lines behind the hero: they start close together on the left and
// fan out to the right, round behind the photo
const LINES = Array.from(
  { length: 9 },
  (_, i) => `M -50 ${560 + i * 14} C 420 ${760 + i * 6}, 900 ${180 + i * 30}, 1490 ${260 + i * 38}`
);

// First screen, kept calm: plain navy with a fan of thin gold lines that draw
// in and drift slowly; the headline, a line of text and two buttons on the left,
// and the class photo on the right, leaning gently towards the mouse in 3D
// (on phones, following the phone's tilt, or swaying on its own). Scrolling away, the words lift and
// fade and the photo sinks back; scrolling up brings them back. On phones and
// tablets the photo comes first with the words under it, and both stay put
// on scroll: the words are still being read as the photo goes off the top.
export default function HeroLux({ onEnroll }) {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const wide = useMinWidth(1024);
  const still = reduceMotion || !wide;

  // Pointer position over the section, -0.5..0.5 each way
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // The photo rests turned slightly away; it settles in from a steeper angle
  const entrance = useMotionValue(18);
  useEffect(() => {
    if (reduceMotion) {
      entrance.set(0);
      return;
    }
    const controls = animate(entrance, 0, { duration: 1.4, ease: EASE, delay: 0.25 });
    return () => controls.stop();
  }, [entrance, reduceMotion]);
  // Touch screens have no pointer for the photo to follow. Where the phone
  // reports its tilt (its gyroscope), the photo turns with it: about 20° of
  // tilt either way takes it as far as the mouse would. Until the first
  // reading, or where there is none, it sways gently on its own.
  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(hover: none)").matches) return;
    const sway = { repeat: Infinity, repeatType: "mirror", ease: "easeInOut" };
    const a = animate(px, [-0.45, 0.45], { ...sway, duration: 6 });
    const b = animate(py, [0.4, -0.4], { ...sway, duration: 8 });
    // The angle the phone is held at, so the photo rests straight however
    // it's held; it eases slowly towards each reading, so after a change of
    // grip the photo drifts back to rest over a few seconds
    let restX = null;
    let restY = null;
    const clamp = (v) => Math.max(-0.5, Math.min(0.5, v));
    const onTilt = (e) => {
      if (e.beta == null || e.gamma == null) return;
      a.stop();
      b.stop();
      // Side to side and front to back, swapped round in landscape
      const angle = window.screen.orientation?.angle ?? 0;
      const [x, y] =
        angle === 90 ? [e.beta, -e.gamma] : angle === 270 ? [-e.beta, e.gamma] : [e.gamma, e.beta];
      restX = restX === null ? x : restX + (x - restX) * 0.002;
      restY = restY === null ? y : restY + (y - restY) * 0.002;
      px.set(clamp((x - restX) / 40));
      py.set(clamp((y - restY) / 40));
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      a.stop();
      b.stop();
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [px, py, reduceMotion]);
  // iPhones share the tilt only once the visitor allows it, and can ask only
  // from a tap: the first tap on the photo asks (it keeps swaying till then)
  const askedTilt = useRef(false);
  const askForTilt = () => {
    const ask = window.DeviceOrientationEvent?.requestPermission;
    if (askedTilt.current || typeof ask !== "function") return;
    askedTilt.current = true;
    ask.call(window.DeviceOrientationEvent).catch(() => {});
  };
  const sx = useSpring(px, { stiffness: 110, damping: 18 });
  const sy = useSpring(py, { stiffness: 110, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-20, 10]);
  const tiltX = useTransform(sy, [-0.5, 0.5], [12, -8]);
  const rotateX = useTransform([tiltX, entrance], ([a, b]) => a + b);
  // A soft light on the glass that slides the way the photo turns
  const glare = useTransform(
    [sx, sy],
    ([x, y]) => `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.22), transparent 55%)`
  );

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const away = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });
  const textY = useTransform(away, [0, 1], [0, still ? 0 : -110]);
  const textOpacity = useTransform(away, [0, 0.7], [1, still ? 1 : 0]);
  const windowY = useTransform(away, [0, 1], [0, still ? 0 : 90]);
  const windowScale = useTransform(away, [0, 1], [1, still ? 1 : 0.9]);

  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse" || reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return; // a lifted finger leaves the sway running
    px.set(0);
    py.set(0);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex flex-1 items-center overflow-hidden bg-[#0B1A37] text-white"
    >
      {/* Backdrop: the fan of lines on plain navy */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -inset-[4%] animate-[lux-lines_24s_ease-in-out_infinite_alternate] motion-reduce:animate-none">
          <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" fill="none" className="h-full w-full">
            <defs>
              {/* Faint on the left, under the words; brightest round the photo */}
              <linearGradient id="hero-lines" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#EECC65" stopOpacity="0" />
                <stop offset="0.4" stopColor="#EECC65" stopOpacity="0.16" />
                <stop offset="0.75" stopColor="#EECC65" stopOpacity="0.28" />
                <stop offset="1" stopColor="#EECC65" stopOpacity="0" />
              </linearGradient>
            </defs>
            {LINES.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                stroke="url(#hero-lines)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.6, ease: EASE, delay: 0.2 + i * 0.08 }}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-[88rem] items-center gap-[3rem] px-[1rem] py-[clamp(1.75rem,5vh,3.5rem)] sm:px-[1.5rem] lg:grid-cols-[1.02fr_1fr] lg:gap-[5rem] lg:px-[2.5rem]">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative max-lg:text-center">
          <h1 className="!mb-0 !text-[clamp(2.4rem,min(4.5vw,7.6vh),4.7rem)] !font-extrabold !leading-[1.04] !tracking-[-0.04em] text-white [text-wrap:balance]">
            {headline.map(({ text, tone, words }) => (
              <span key={text} className={`lg:block ${tone === "accent" ? "text-[1.14em] !font-normal tracking-[-0.01em]" : ""}`}>
                {words.map(({ word, index }) => (
                  <Fragment key={index}>
                    <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
                      <motion.span
                        className={`inline-block ${WORD_LOOK[tone]}`}
                        initial={{ y: "112%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.15 + index * 0.06 }}
                      >
                        {word}
                      </motion.span>
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>

          {/* The two buttons straight under the headline, then the line of text */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
            className="mt-[clamp(1.25rem,3.6vh,2.25rem)] flex flex-wrap items-center justify-center gap-[0.75rem] sm:gap-[0.9rem] lg:justify-start"
          >
            <Magnetic>
              <button
                type="button"
                onClick={onEnroll}
                className="group relative inline-flex items-center gap-[0.9rem] overflow-hidden !rounded-full bg-[#EECC65] py-[0.45rem] pl-[1.35rem] pr-[0.45rem] sm:pl-[1.75rem] text-[1rem] font-bold text-[#0B1A37] shadow-[0_18px_44px_-14px_rgba(238,204,101,0.6)]"
              >
                <span className="relative">Enroll Now</span>
                <span className="relative grid h-[42px] w-[42px] place-items-center rounded-full bg-[#0B1A37] text-[#EECC65] transition-transform duration-300 group-hover:-rotate-45">
                  <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              </button>
            </Magnetic>
            <Link
              href="/coursesGrid"
              className="inline-flex items-center gap-[0.6rem] rounded-full border-[1px] border-white bg-white px-[1.35rem] py-[0.85rem] sm:px-[1.6rem] text-[1rem] font-semibold !text-[#0B1A37] !no-underline shadow-[0_18px_44px_-18px_rgba(255,255,255,0.45)] transition-colors duration-300 hover:border-[#EECC65] hover:bg-[#FBF7EE]"
            >
              Courses
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            className="!mb-0 mt-[clamp(1.25rem,3.6vh,2rem)] max-w-[32rem] !text-[clamp(0.98rem,2.2vh,1.12rem)] !leading-[1.7] text-white/65 max-lg:mx-auto max-lg:text-justify max-lg:[text-align-last:center]"
          >
            Every child learns differently. Our qualified Quran teachers get to know your child their pace, their learning style, their confidence and build a programme around that.
          </motion.p>
        </motion.div>

        {/* The class photo. Scroll moves the outer layer, the pointer tilts
            the inner one, so the two never pull at the same values. */}
        <motion.div
          onClick={askForTilt}
          style={{ y: windowY, scale: windowScale }}
          className="relative mx-auto w-full max-w-[34rem] max-lg:order-first lg:max-w-[min(100%,calc((100svh_-_15.5rem)*1.33))]"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            className="[perspective:1000px]"
          >
            <motion.div style={{ rotateX, rotateY }} className="relative [transform-style:preserve-3d]">
              <div className="rounded-[28px] bg-white/[0.08] p-[8px] shadow-[0_60px_110px_-50px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(255,255,255,0.12)]">
                <div className="relative aspect-[1057/795] overflow-hidden rounded-[22px]">
                  <Image
                    src="/hero.png"
                    alt="Child learning Quran online with a qualified teacher"
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 34rem"
                    className="object-cover"
                  />
                  <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden" style={{ background: glare }} />
                </div>
              </div>
              {/* The badge floats in front of the photo, so it shifts against it as the photo turns */}
              <span
                className="absolute left-[1.5rem] top-[1.5rem] inline-flex items-center gap-[7px] rounded-full bg-[#0B1A37]/75 px-[0.8rem] py-[0.35rem] text-[0.75rem] font-bold tracking-[0.08em] text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)] backdrop-blur-sm"
                style={{ transform: "translateZ(60px)" }}
              >
                <span className="h-[7px] w-[7px] rounded-full bg-[#EECC65]" />
                LIVE · 1-to-1
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
