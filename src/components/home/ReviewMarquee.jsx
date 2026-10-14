"use client";

import VelocityMarquee from "@/components/lux/VelocityMarquee";

const reviews = [
  "Parent Review — Manchester, UK",
  "“We tried two other academies before QuranWest. Our son actually asks to attend his class now.”",
  "Sister Hafsa R. — Manchester, United Kingdom",
  "14 live classes happening right now across 3 time zones",
  "Hifz Programme — Mariam, age 11 · Juz 18 of 30",
];

// The reviews ribbon under the hero. It drifts on its own, races while the
// page scrolls and turns round when the scroll does.
export default function ReviewMarquee() {
  return (
    <div className="relative shrink-0 border-y-[1px] border-white/10 bg-[#071026] py-[0.95rem]">
      {/* Only the words fade out at the edges; the dark band runs edge to edge */}
      <VelocityMarquee speed={-1.4} className="[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        {reviews.map((text, i) => {
          const quote = text.startsWith("“");
          return (
            <span key={i} className="flex items-center gap-[1.6rem] whitespace-nowrap px-[1.6rem]">
              <span aria-hidden="true" className="h-[7px] w-[7px] rotate-45 bg-[#EECC65]" />
              <span className={`text-[0.95rem] font-medium ${quote ? "text-[#EECC65]" : "text-white/80"}`}>
                {text}
              </span>
            </span>
          );
        })}
      </VelocityMarquee>
    </div>
  );
}
