"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

export type FilterOption<T extends string> = { value: T; label: string; count?: number };

// The navy filter pill of the admin list pages (Enrollments, Trials,
// Scheduling) with its own menu instead of the browser's: white, a count on
// each choice, a tick on the chosen one. Light-mode colours come from
// .adm-badge / .adm-select-chevron in globals.css.
// The toolbar holding it needs `relative z-[5]`: the glass cards below it are
// layers of their own (backdrop-filter) and would otherwise cover the menu.
// Sizes are written out ([13px]…): the website's Bootstrap sheet overrides
// .text-sm, .text-xs and friends.
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  label = "Filter",
}: {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  React.useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function choose(v: T) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(options[active].value);
    }
  }

  const text = (o: FilterOption<T>) => (o.count === undefined ? o.label : `${o.label} (${o.count})`);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${text(current)}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="adm-badge inline-flex items-center gap-[10px] rounded-full border-[1px] border-border bg-background py-[8px] pl-[16px] pr-[12px] text-[13.5px] font-semibold leading-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {text(current)}
        <ChevronDown
          className={`adm-select-chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          // max-h: long lists (the Classes schedule's days) scroll inside the menu
          className="absolute left-0 top-full z-30 mt-[6px] max-h-[320px] w-max min-w-full max-w-[320px] overflow-y-auto rounded-xl border-[1px] border-border bg-card p-[4px] shadow-[0_18px_40px_-16px_rgb(11_26_55/0.45)]"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o.value)}
                className={`flex cursor-pointer items-center gap-[10px] rounded-lg px-[10px] py-[7px] ${i === active ? "bg-primary/[0.07]" : ""}`}
              >
                <span
                  className={`flex-1 whitespace-nowrap text-[13px] leading-[18px] ${selected ? "font-semibold text-primary" : "text-foreground"}`}
                >
                  {o.label}
                </span>
                {o.count !== undefined && (
                  <span className="rounded-full bg-primary/10 px-[7px] py-[1px] text-[11px] font-semibold leading-[16px] text-primary">
                    {o.count}
                  </span>
                )}
                <Check className={`h-4 w-4 shrink-0 text-primary ${selected ? "" : "[visibility:hidden]"}`} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
