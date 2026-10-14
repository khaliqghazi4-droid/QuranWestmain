"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 1600;
const EMPTY_MS = 400;

const CARET_CSS = `
  @keyframes tw-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  .tw-caret { animation: tw-blink 1s steps(1) infinite; }
`;

// Types each phrase out like a keyboard, holds it, backspaces it, then moves
// on to the next, on a loop. The server renders the first phrase in full (so
// it reads fine before JS loads); typing then starts from empty. Screen
// readers get the first phrase as plain text, and with reduced motion it just
// stays put.
export default function Typewriter({ phrases, className = "" }) {
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(phrases[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion || started) return;
    setCount(0);
    setStarted(true);
  }, [reduceMotion, started]);

  useEffect(() => {
    if (reduceMotion || !started) return;
    const phrase = phrases[index];
    let delay;
    let step;
    if (!deleting && count < phrase.length) {
      delay = TYPE_MS;
      step = () => setCount(count + 1);
    } else if (!deleting) {
      delay = HOLD_MS;
      step = () => setDeleting(true);
    } else if (count > 0) {
      delay = DELETE_MS;
      step = () => setCount(count - 1);
    } else {
      delay = EMPTY_MS;
      step = () => {
        setDeleting(false);
        setIndex((index + 1) % phrases.length);
      };
    }
    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [reduceMotion, started, phrases, index, count, deleting]);

  return (
    <div className={className}>
      <style>{CARET_CSS}</style>
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden="true">
        {phrases[index].slice(0, count)}
        <span
          className={`ml-[3px] inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-current ${
            reduceMotion ? "opacity-0" : "tw-caret"
          }`}
        />
      </span>
    </div>
  );
}
