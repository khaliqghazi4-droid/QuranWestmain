"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE, FIRST_YEAR, type View } from "./period";

// What the picker needs from the Period (strings only: it crosses from the
// server page to this client component)
export type PickerProps = {
  view: View;
  title: string;
  fromYmd: string;
  toYmd: string;
  month: string;
  year: number;
  prevHref: string | null;
  nextHref: string | null;
  thisMonth: string;
  thisYear: number;
  todayYmd: string;
};

// Sizes written out: the website's Bootstrap sheet overrides .text-sm/.text-xs
const FIELD =
  "rounded-full border-[1px] border-border bg-background px-[14px] py-[7px] text-[13px] font-medium leading-[18px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// The toolbar above the attendance: Week / Month / Year / Custom, then the
// way to move within that choice (arrows, a month or year picker, or two
// dates). Every choice is a page address, so it survives a refresh.
export function PeriodPicker(p: PickerProps) {
  const router = useRouter();
  const [from, setFrom] = React.useState(p.fromYmd);
  const [to, setTo] = React.useState(p.toYmd);
  React.useEffect(() => {
    setFrom(p.fromYmd);
    setTo(p.toYmd);
  }, [p.fromYmd, p.toYmd]);

  const tabs: { view: View; label: string; href: string }[] = [
    { view: "week", label: "Week", href: BASE },
    { view: "month", label: "Month", href: `${BASE}?view=month&month=${p.month}` },
    { view: "year", label: "Year", href: `${BASE}?view=year&year=${p.year}` },
    { view: "custom", label: "Custom", href: `${BASE}?view=custom&from=${p.fromYmd}&to=${p.toYmd}` },
  ];

  const years: number[] = [];
  for (let y = p.thisYear; y >= FIRST_YEAR; y--) years.push(y);

  return (
    <div className="adm-glass flex flex-wrap items-center gap-[12px] rounded-2xl border-[1px] border-border bg-card p-[12px] sm:px-[16px]">
      <nav aria-label="Period" className="adm-seg grid grid-cols-4 gap-[2px] rounded-full border-[1px] border-border bg-muted/60 p-[3px]">
        {tabs.map((t) => {
          const active = p.view === t.view;
          return (
            <Link
              key={t.view}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-[14px] py-[6px] text-center text-[13px] font-semibold leading-[18px] transition-all ${
                active
                  ? "adm-badge bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden flex-1 sm:block" />

      {p.view === "custom" ? (
        <form
          className="flex flex-wrap items-center gap-[8px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (from && to) router.push(`${BASE}?view=custom&from=${from}&to=${to}`);
          }}
        >
          <label className="sr-only" htmlFor="att-from">From</label>
          <input id="att-from" type="date" value={from} max={p.todayYmd} onChange={(e) => setFrom(e.target.value)} className={FIELD} />
          <span className="text-[13px] text-muted-foreground">to</span>
          <label className="sr-only" htmlFor="att-to">To</label>
          <input id="att-to" type="date" value={to} max={p.todayYmd} onChange={(e) => setTo(e.target.value)} className={FIELD} />
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[8px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md"
          >
            Show
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-[8px]">
          <Step href={p.prevHref} label="Previous" icon={<ChevronLeft className="h-4 w-4" />} />
          {p.view === "month" ? (
            <input
              type="month"
              aria-label="Month"
              value={p.month}
              min={`${FIRST_YEAR}-01`}
              max={p.thisMonth}
              onChange={(e) => e.target.value && router.push(`${BASE}?view=month&month=${e.target.value}`)}
              className={FIELD}
            />
          ) : p.view === "year" ? (
            <select
              aria-label="Year"
              value={p.year}
              onChange={(e) => router.push(`${BASE}?view=year&year=${e.target.value}`)}
              className={`${FIELD} cursor-pointer pr-[30px]`}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          ) : (
            <span className="inline-flex min-w-[170px] items-center justify-center gap-[6px] text-[13.5px] font-semibold leading-[18px]">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {p.title}
            </span>
          )}
          <Step href={p.nextHref} label="Next" icon={<ChevronRight className="h-4 w-4" />} />
        </div>
      )}
    </div>
  );
}

// A round arrow button, faded when there is nowhere to go (before the first
// year, or past today)
function Step({ href, label, icon }: { href: string | null; label: string; icon: React.ReactNode }) {
  const cls = "grid h-9 w-9 place-items-center rounded-full border-[1px] border-border bg-background/70 transition-colors";
  if (!href) {
    return (
      <span aria-disabled="true" title={label} className={`${cls} text-muted-foreground opacity-[0.4]`}>
        {icon}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} title={label} className={`${cls} hover:bg-muted`}>
      {icon}
    </Link>
  );
}
