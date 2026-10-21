"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Download, Receipt } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { FilterSelect } from "@/components/admin/filter-select";
import { downloadCsv } from "@/lib/csv";
import { money } from "./money";

export type FeeRow = {
  // the student's id
  id: string;
  name: string;
  email: string;
  image: string | null;
  // their first active enrollment, ISO
  since: string;
  courses: { id: string; name: string; fee: number; startedAt: string }[];
  total: number;
};

// "Sep 30, 2026", in Pakistan time so the server and the browser agree
function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FeesTable({ rows }: { rows: FeeRow[] }) {
  const [query, setQuery] = React.useState("");
  const [course, setCourse] = React.useState("all");

  const courseOptions = React.useMemo(() => {
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const r of rows)
      for (const c of r.courses) {
        const o = map.get(c.id) ?? { value: c.id, label: c.name.trim(), count: 0 };
        o.count++;
        map.set(c.id, o);
      }
    return [
      { value: "all", label: "All courses", count: rows.length },
      ...Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [rows]);

  const q = query.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (course === "all" || r.courses.some((c) => c.id === course)) &&
      (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
  );
  const allTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const shownTotal = filtered.reduce((sum, r) => sum + r.total, 0);

  // One line per course a student takes, for what is on screen
  function exportCsv() {
    downloadCsv(
      `student-fees-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Student", "Email", "Course", "Monthly fee (USD)", "Enrolled"],
      filtered.flatMap((r) => r.courses.map((c) => [r.name, r.email, c.name.trim(), c.fee, day(c.startedAt)]))
    );
  }

  // Each course as a chip with its fee beside it
  const courseList = (r: FeeRow) => (
    <div className="flex flex-col items-start gap-[6px]">
      {r.courses.map((c) => (
        <div key={c.id} className="flex items-center gap-[8px]">
          <span className="whitespace-nowrap rounded-full bg-primary/10 px-[10px] py-[2px] text-[11.5px] font-semibold leading-[18px] text-primary">
            {c.name.trim()}
          </span>
          {c.fee > 0 ? (
            <span className="whitespace-nowrap text-[12px] leading-[18px] tabular-nums text-muted-foreground">
              ${money(c.fee)}
            </span>
          ) : (
            <span className="whitespace-nowrap text-[12px] italic leading-[18px] text-muted-foreground">No fee set</span>
          )}
        </div>
      ))}
    </div>
  );

  // Name and email, linking to the student's page
  const identity = (r: FeeRow) => (
    <Link href={`/app/admin/students/${r.id}`} className="group flex min-w-0 items-center gap-[12px]">
      <Avatar name={r.name} src={r.image} size={36} />
      <div className="min-w-0">
        {/* Sizes written out: Bootstrap's .text-sm/.text-xs have no line height */}
        <p className="truncate text-[14.5px] font-semibold leading-[21px] transition-colors group-hover:text-primary">
          {r.name}
        </p>
        <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">{r.email}</p>
      </div>
    </Link>
  );

  const fee = (r: FeeRow) =>
    r.total > 0 ? (
      <p className="whitespace-nowrap">
        <span className="text-[16px] font-bold leading-[22px] tabular-nums">${money(r.total)}</span>
        <span className="ml-[3px] text-[11.5px] leading-[16px] text-muted-foreground">/ mo</span>
      </p>
    ) : (
      <p className="whitespace-nowrap text-[14px] font-semibold leading-[20px] tabular-nums text-muted-foreground">$0</p>
    );

  return (
    // No overflow-hidden: the course menu opens below the toolbar and can run
    // past the card. relative z-[5]: it opens over the glass card beside or
    // below this one (a layer of its own) instead of under it.
    <div className="adm-glass relative z-[5] min-w-0 flex-[3_1_560px] rounded-2xl border-[1px] border-border bg-card">
      <div className="relative z-[5] flex flex-wrap items-center gap-[12px] border-b border-border px-[16px] py-[14px] sm:px-[20px]">
        <div className="mr-auto min-w-0">
          <h2 className="text-[15px] font-bold leading-[20px]">Student fees</h2>
          <p className="text-[11.5px] leading-[16px] text-muted-foreground">
            {rows.length} {rows.length === 1 ? "student" : "students"} · ${money(allTotal)} due each month
          </p>
        </div>
        {/* Phones: the filter and Export (an icon) on one row, the search
            full width under them; it was squeezed to nothing beside them */}
        <div className="flex w-full flex-wrap items-center gap-[8px] sm:w-auto sm:flex-nowrap">
          <FilterSelect label="Course" value={course} onChange={setCourse} options={courseOptions} />
          <div className="relative order-last w-full sm:order-none sm:w-56">
            <Search className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="w-full rounded-full border-[1px] border-border bg-background py-[8px] pl-[36px] pr-[16px] text-[13.5px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            aria-label="Export CSV"
            title="Download these fees as a spreadsheet (CSV)"
            className="ml-auto inline-flex shrink-0 items-center gap-[6px] rounded-full sm:ml-0 border-[1px] border-border bg-background/70 px-[11px] py-[9px] text-[13px] font-semibold leading-[18px] transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 sm:px-[14px]"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-[24px] py-[52px] text-center">
          <span className="adm-icon mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Receipt className="h-5 w-5" />
          </span>
          <p className="mt-[12px] text-[14px] font-semibold leading-[20px]">
            {rows.length === 0 ? "No active enrollments yet" : "No students match your search"}
          </p>
          <p className="mt-[2px] text-[12.5px] leading-[18px] text-muted-foreground">
            {rows.length === 0
              ? "Fees show here once students are enrolled in a course."
              : "Try another name or course."}
          </p>
        </div>
      ) : (
        <>
          {/* Tablets and up: a table. `adm-rows` gives the rows a little more
              white than the glass card in light mode. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="whitespace-nowrap border-b border-border text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  <th className="py-[12px] pl-[20px] pr-[12px] font-semibold">Student</th>
                  <th className="px-[12px] py-[12px] font-semibold">Courses</th>
                  <th className="px-[12px] py-[12px] font-semibold">Enrolled</th>
                  <th className="py-[12px] pl-[12px] pr-[20px] text-right font-semibold">Monthly fee</th>
                </tr>
              </thead>
              <tbody className="adm-rows divide-y divide-border">
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className="stagger-item align-middle transition-colors hover:bg-muted/30"
                    style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                  >
                    <td className="max-w-[260px] py-[14px] pl-[20px] pr-[12px]">{identity(r)}</td>
                    <td className="px-[12px] py-[14px]">{courseList(r)}</td>
                    <td className="whitespace-nowrap px-[12px] py-[14px] text-[13px] leading-[19px] tabular-nums text-muted-foreground">
                      {day(r.since)}
                    </td>
                    <td className="py-[14px] pl-[12px] pr-[20px] text-right">{fee(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: one block per student instead of a sideways-scrolling table */}
          <ul className="adm-rows divide-y divide-border md:hidden">
            {filtered.map((r) => (
              <li key={r.id} className="space-y-[10px] px-[16px] py-[14px]">
                <div className="flex items-center justify-between gap-[12px]">
                  {identity(r)}
                  {fee(r)}
                </div>
                {courseList(r)}
                <p className="text-[12px] leading-[17px] text-muted-foreground">Enrolled {day(r.since)}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[4px] border-t border-border px-[16px] py-[12px] text-[12px] leading-[17px] text-muted-foreground sm:px-[20px]">
        <span>
          Showing {filtered.length} of {rows.length} · ${money(shownTotal)} / month
        </span>
        <span>From each course&apos;s current fee · payments aren&apos;t recorded yet</span>
      </div>
    </div>
  );
}
