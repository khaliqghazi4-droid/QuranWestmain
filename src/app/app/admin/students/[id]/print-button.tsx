"use client";

import { Printer } from "lucide-react";

// Prints the student's page as a report (globals.css, .adm-report). The short
// label on phones keeps it beside the back pill at 360px.
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex shrink-0 items-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[8px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md transition-shadow hover:shadow-lg"
    >
      <Printer className="h-4 w-4" />
      <span className="sm:hidden">Print</span>
      <span className="hidden sm:inline">Print / Save as PDF</span>
    </button>
  );
}
