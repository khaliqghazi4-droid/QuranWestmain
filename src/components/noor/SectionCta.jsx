import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Each tone's colours: navy fill on light sections (the default), gold outline
// on navy ones, and a quieter navy outline for a second button beside the first
const TONES = {
  light: "bg-[#0B1A37] text-white hover:shadow-[0_10px_24px_-10px_rgba(11,26,55,0.7)]",
  dark: "border-[1px] border-[#EECC65]/60 text-[#EECC65] hover:bg-[#EECC65]/10",
  outline: "border-[1px] border-[#0B1A37]/20 text-[#0B1A37] hover:border-[#0B1A37]/50",
};

// The "go to that page" button of a home section that previews another page.
// A little tighter on phones, so two fit side by side on a 360px screen.
export default function SectionCta({ href, children, tone = "light", className = "" }) {
  const look = TONES[tone];

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-[0.5rem] rounded-full py-[0.375rem] pl-[1rem] pr-[0.375rem] text-[0.9rem] font-semibold !no-underline transition-[background-color,box-shadow] duration-300 sm:gap-[0.75rem] sm:pl-[1.5rem] sm:text-[0.95rem] ${look} ${className}`}
    >
      {children}
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] transition-transform duration-300 group-hover:-rotate-45 sm:h-9 sm:w-9">
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
