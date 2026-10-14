"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EnrollNow from "@/components/footer/enrollNow/enrollNow";

// Book a Free Trial: the enrolment form in a pop-up, which asks for the trial
// class time. It closes with the ✕ button, the Escape key, or a click
// outside the form. `defaultCourse` (optional) picks the course in the form,
// e.g. from a pricing table.
export default function EnrollModal({ open, onClose, defaultCourse }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center p-[12px] sm:p-[20px] w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 z-10" onClick={onClose}></div>
          <motion.div
            className="w-[900px] max-w-full z-40 max-h-[90vh] my-10 !rounded-lg overflow-y-auto scroller"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Stays at the top while the form scrolls */}
            <div className="sticky top-0 z-10 flex justify-end py-[12px]">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white !p-0 text-[#0B1A37] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)] transition-colors hover:bg-[#EECC65]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <EnrollNow defaultCourse={defaultCourse} />
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
