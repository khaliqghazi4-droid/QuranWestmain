"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 400;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center !rounded-full bg-[#0C1A37] text-white shadow-[0_8px_20px_rgba(11,26,55,0.35)] transition-all duration-300 hover:bg-[#997C36] hover:scale-[1.08] active:scale-95 ${
        visible ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-2.5 scale-75"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
