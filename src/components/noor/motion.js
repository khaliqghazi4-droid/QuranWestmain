// Motion presets of the "Noor" look: slow and graceful. Everything replays
// whenever it comes back into view, scrolling down or back up.

import { useEffect, useState } from "react";
import { useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

// How much of an element must be on screen before it plays (or replays)
export const VIEWPORT = { once: false, amount: 0.3 };

// Fade in while rising, each time the element scrolls into view
export const reveal = (delay = 0, y = 28) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.8, ease: EASE, delay },
});

// Variants for an SVG stroke drawing itself (motion.path / motion.line). The
// parent <motion.svg> sets initial="hidden" and whileInView="shown": a flat
// line has no height, so it can't reliably watch for the scroll itself.
export const drawLine = (delay = 0, duration = 1.2) => ({
  hidden: { pathLength: 0, opacity: 0 },
  shown: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration, ease: "easeInOut", delay },
      opacity: { duration: 0.2, delay },
    },
  },
});

// True while the screen is at least `px` wide
export function useMinWidth(px) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${px}px)`);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [px]);
  return matches;
}

// An entrance that follows the scroll: while the element's top travels from
// the bottom of the screen to 70% of the way up, it rises, grows to full size
// and fades in. `side` (-1 left, 1 right) also swings it in from that side
// (from a little less far on phones and tablets). Scrolling back up plays it
// in reverse.
// Put the ref on an element that isn't itself moved, and the returned style
// on one inside it (see ScrollIn).
export function useScrollEntrance(targetRef, { side = 0, rise = 90, shrink = 0.14 } = {}) {
  const reduceMotion = useReducedMotion();
  const wide = useMinWidth(1024);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start end", "start 0.7"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });
  const still = useMotionValue(1);
  const progress = reduceMotion ? still : smooth;
  const reach = wide ? 50 : 28;

  return {
    opacity: useTransform(progress, [0, 0.55], [0, 1]),
    y: useTransform(progress, [0, 1], [rise, 0]),
    x: useTransform(progress, [0, 1], [side * reach, 0]),
    rotate: useTransform(progress, [0, 1], [side * (wide ? 4 : 3), 0]),
    scale: useTransform(progress, [0, 1], [1 - shrink, 1]),
  };
}
