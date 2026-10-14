"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaChevronDown } from "react-icons/fa";

// One question open at a time, the first one to start with. Closed answers
// collapse to zero height but stay in the page's HTML, so search engines can
// still read them. Each item is { q, a, link? }; `link` is { label, href } for
// another page, or { label, trial: true } to open the free-trial form through
// `onTrial`.
export default function FaqAccordion({ items, idPrefix, onTrial }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex flex-col gap-[12px]">
      {items.map(({ q, a, link }, i) => {
        const isOpen = openIndex === i;
        const qId = `${idPrefix}-q${i}`;
        const aId = `${idPrefix}-a${i}`;
        return (
          <motion.div
            key={q}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: Math.min(i, 4) * 0.04 }}
            className={`overflow-hidden rounded-[14px] border-[1px] border-solid bg-white transition-[border-color,box-shadow] duration-300 ${
              isOpen
                ? "border-[#EECC65] shadow-[0_12px_30px_rgba(11,26,55,0.10)]"
                : "border-[#0B1A37]/[0.08] shadow-[0_4px_14px_rgba(11,26,55,0.04)] hover:border-[#EECC65]/60"
            }`}
          >
            <h3 className="!m-0">
              <button
                type="button"
                id={qId}
                aria-expanded={isOpen}
                aria-controls={aId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-[16px] !border-none !bg-transparent px-[20px] py-[18px] text-left text-[16px] font-semibold leading-snug !text-[#0B1A37] md:px-[24px] md:text-[17px]"
              >
                <span>{q}</span>
                <span
                  className={`grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? "rotate-180 bg-[#0B1A37] text-[#EECC65]"
                      : "bg-[#0B1A37]/[0.06] text-[#0B1A37]"
                  }`}
                >
                  <FaChevronDown className="h-[12px] w-[12px]" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div
              id={aId}
              role="region"
              aria-labelledby={qId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-[20px] pb-[20px] md:px-[24px]">
                  <p className="!m-0 !text-[15px] !leading-relaxed !text-[#3b4456] md:!text-[16px]">
                    {a}
                  </p>
                  {link && <FaqLink link={link} onTrial={onTrial} />}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function FaqLink({ link, onTrial }) {
  const className =
    "group mt-[10px] inline-flex cursor-pointer items-center gap-[8px] !border-none !bg-transparent !p-0 text-[15px] font-semibold !text-[#9B7930] !no-underline hover:!text-[#0B1A37]";
  const content = (
    <>
      {link.label}
      <FaArrowRight
        className="h-[11px] w-[11px] transition-transform duration-200 group-hover:translate-x-[3px]"
        aria-hidden="true"
      />
    </>
  );

  if (link.trial) {
    return (
      <button type="button" onClick={onTrial} className={className}>
        {content}
      </button>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}
