"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useScrollEntrance } from "./motion";

// Wraps content in the scroll-linked entrance (see useScrollEntrance). The
// outer box stays still so its position can be measured; the inner one moves.
// `className` styles the outer box (e.g. as a grid item), `innerClassName` the
// moving one, which fills it by default.
export default function ScrollIn({ children, className = "", innerClassName = "h-full", side, rise, shrink }) {
  const ref = useRef(null);
  const style = useScrollEntrance(ref, { side, rise, shrink });
  return (
    <div ref={ref} className={className}>
      <motion.div style={style} className={innerClassName}>
        {children}
      </motion.div>
    </div>
  );
}
