"use client";

import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Eyebrow, accentClass, leadClass } from "@/components/lux/effects";

// The parts of the sign-in pages (login, forgot and reset password), in the
// site's navy and gold and the home page's type. Heights and gaps follow the
// screen's height (vh), down to a floor, so a page fits one screen without
// scrolling even on a short laptop; on tall screens they stop at full size.

export const AUTH_LABEL = "mb-[0.35rem] block text-[0.82rem] font-semibold text-[#0B1A37]";
export const AUTH_INPUT =
  "h-[clamp(2.75rem,6.5vh,3.25rem)] w-full rounded-[12px] border-[1px] border-[#0B1A37]/15 bg-white pl-[2.75rem] pr-[1rem] text-[0.95rem] text-[#0B1A37] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#0B1A37]/40 hover:border-[#0B1A37]/30 focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(238,204,101,0.35)]";
// the icon inside a field, on its left
export const AUTH_FIELD_ICON =
  "pointer-events-none absolute left-[1rem] top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-[#9B7930]";
// a small link (a darker gold, so it reads on white)
export const AUTH_LINK = "font-semibold !text-[#7E5F22] !no-underline transition-colors hover:!text-[#0B1A37]";

// The white card the form sits on, with a fine gold edge
export function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-[28rem] animate-fade-in rounded-[1.5rem] border-[1px] border-[#D4AF37]/40 bg-white px-[1.5rem] py-[clamp(1.25rem,3.5vh,2.25rem)] shadow-[0_30px_60px_-30px_rgba(11,26,55,0.35),0_10px_24px_-14px_rgba(11,26,55,0.18)] sm:px-[2.25rem] ${className}`}
    >
      {children}
    </div>
  );
}

// The card's heading: a gold label, the title with its last words in the
// gold serif, and a line under it
/**
 * @param {{ eyebrow?: import("react").ReactNode, title: string, accent?: string,
 *   lead?: import("react").ReactNode, center?: boolean }} props
 */
export function AuthHeading({ eyebrow = null, title, accent = "", lead = null, center = false }) {
  return (
    <div className={`mb-[clamp(1rem,3vh,1.75rem)] ${center ? "text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1
        className={`!mb-0 !text-[clamp(1.6rem,min(4.5vw,5.8vh),2.2rem)] !font-extrabold !leading-[1.12] !tracking-[-0.03em] text-[#0B1A37] ${eyebrow ? "mt-[clamp(0.5rem,1.5vh,0.9rem)]" : ""}`}
      >
        {title} {accent && <span className={accentClass()}>{accent}</span>}
      </h1>
      {lead && <p className={`mt-[clamp(0.35rem,1vh,0.6rem)] ${leadClass()}`}>{lead}</p>}
    </div>
  );
}

// A round badge over a heading that reports how things went
export function AuthStatus({ tone = "good", children }) {
  const look = tone === "good" ? "bg-[#EECC65]/25 text-[#7E5F22]" : "bg-[#FDF0F0] text-[#A4262C]";
  return <div className={`mx-auto mb-[clamp(0.75rem,2.2vh,1.25rem)] grid h-[clamp(3.25rem,8vh,4rem)] w-[clamp(3.25rem,8vh,4rem)] place-items-center rounded-full ${look}`}>{children}</div>;
}

// An error above the form
export function AuthAlert({ children }) {
  return (
    <div
      role="alert"
      className="mb-[clamp(0.75rem,2vh,1.1rem)] flex items-start gap-[0.6rem] rounded-[12px] border-[1px] border-[#E5484D]/25 bg-[#FDF0F0] px-[0.9rem] py-[0.75rem] text-[0.85rem] leading-[1.5] text-[#A4262C]"
    >
      <AlertCircle className="mt-[0.15rem] h-[1rem] w-[1rem] shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

// The form's button: the header's navy pill with the gold arrow, which turns
// on hover (a spinner while it works)
export function AuthButton({ loading = false, loadingText = "", children, className = "", ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      {...props}
      className={`group flex h-[clamp(2.9rem,7vh,3.25rem)] w-full items-center justify-between !rounded-full bg-[#0B1A37] pl-[1.5rem] pr-[0.4rem] text-[0.95rem] font-semibold text-white transition-[box-shadow,background-color] duration-300 hover:bg-[#13254A] hover:shadow-[0_12px_26px_-12px_rgba(11,26,55,0.75)] disabled:cursor-not-allowed disabled:opacity-[0.75] ${className}`}
    >
      <span>{loading ? loadingText : children}</span>
      <span className="grid aspect-square h-[calc(100%-0.8rem)] place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] transition-transform duration-300 group-hover:-rotate-45 group-disabled:rotate-0">
        {loading ? <Loader2 className="h-[1rem] w-[1rem] animate-spin" aria-hidden="true" /> : <ArrowRight className="h-[1rem] w-[1rem]" aria-hidden="true" />}
      </span>
    </button>
  );
}
