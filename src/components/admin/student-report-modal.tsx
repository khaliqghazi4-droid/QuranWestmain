"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ArrowUpRight, FileText, Loader2, Mail, Printer, X } from "lucide-react";
import { ReportAction, StudentReport, type StudentReportData } from "@/components/admin/student-report";

// A student's report in a pop-up, opened by the Reports page's "Report"
// button: the same report as the student's own page, on the cream page
// colour so its glass cards stand out. Portalled into the dashboard shell, so
// printing shows the report alone (globals.css, .adm-report) rather than the
// Reports page behind it; the shell keeps .admin-brand, so the admin colours
// still apply.
export function StudentReportModal({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [data, setData] = React.useState<StudentReportData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/students/${studentId}/report`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load report"));
  }, [studentId]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // The overlay scrolls itself, so the page behind needs no lock
  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in print:static print:overflow-visible print:bg-transparent print:backdrop-blur-none"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center p-[12px] sm:p-[24px] print:block print:p-0">
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Student progress report"
          className="w-full max-w-[1180px] rounded-3xl border-[1px] border-border bg-background text-foreground shadow-2xl print:max-w-none print:rounded-none print:border-0 print:bg-transparent print:shadow-none"
        >
          <div className="sticky top-0 z-10 flex items-center gap-[12px] rounded-t-3xl border-b border-border bg-card px-[16px] py-[12px] sm:px-[24px] print:hidden">
            <span className="adm-icon hidden h-9 w-9 shrink-0 place-items-center rounded-xl sm:grid bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              <FileText className="h-[17px] w-[17px]" />
            </span>
            <div className="mr-auto min-w-0">
              <h2 className="truncate text-[15px] font-bold leading-[20px]">Student progress report</h2>
              <p className="truncate text-[12px] leading-[16px] text-muted-foreground">
                {data ? data.student.name : "Loading…"}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              disabled={!data}
              className="inline-flex shrink-0 items-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[8px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span className="sm:hidden">Print</span>
              <span className="hidden sm:inline">Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-[12px] sm:p-[24px] print:p-0">
            {error ? (
              <div className="flex items-start gap-[12px] rounded-2xl border-[1px] border-destructive/30 bg-destructive/10 p-[16px] text-[13px] leading-[19px] text-destructive">
                <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Couldn&apos;t load this report</p>
                  <p className="mt-[2px] opacity-80">{error}</p>
                </div>
              </div>
            ) : !data ? (
              <div className="grid place-items-center py-[80px] text-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="mt-[10px] text-[13px] leading-[18px] text-muted-foreground">Loading report…</p>
              </div>
            ) : (
              <StudentReport
                data={data}
                actions={
                  <>
                    <ReportAction href={`mailto:${data.student.email}`} icon={Mail}>
                      Email
                    </ReportAction>
                    <ReportAction href={`/app/admin/students/${data.student.id}`} icon={ArrowUpRight} primary>
                      Full profile
                    </ReportAction>
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.querySelector(".admin-dashboard") ?? document.body
  );
}
