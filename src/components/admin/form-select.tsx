"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormOption = { value: string; label: string };

// A dropdown field for admin pop-up forms, in place of the browser's
// <select>: it looks like the text fields beside it (white in the light
// admin's .adm-modal, the night field look via .adm-field in globals.css),
// and opens the same white menu as FilterSelect, with a tick on the choice.
// The menu is rendered into the dashboard shell at a fixed spot under the
// field (or above it, when there is no room below), so a pop-up's scrolling
// body can't cut it off; it closes when anything scrolls or resizes.
// Sizes written out: Bootstrap's .text-sm/.text-xs have no line height.
export function FormSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  compact = false,
  className,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FormOption[];
  // for screen readers, when no <label> points at the field
  label?: string;
  // shown, faded, while `value` is none of the options; not a choice in the menu
  placeholder?: string;
  disabled?: boolean;
  // the smaller field inside a course row
  compact?: boolean;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [place, setPlace] = React.useState<React.CSSProperties | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const current = options.find((o) => o.value === value) ?? (placeholder === undefined ? options[0] : undefined);

  const close = React.useCallback(() => setOpen(false), []);

  // Where the menu goes: under the field, or above it near the screen's foot
  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const height = Math.min(options.length * 34 + 8, 260);
    const below = window.innerHeight - r.bottom;
    const up = below < height + 12 && r.top > below;
    setPlace({
      left: r.left,
      width: Math.max(r.width, 180),
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) close();
    }
    // the menu's own scrolling is fine; anything else moves the field away
    function onScroll(e: Event) {
      if (!menuRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  // Keep the highlighted choice in view while moving with the arrow keys
  React.useEffect(() => {
    if (open) menuRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") {
        // the pop-up around it stays open
        e.preventDefault();
        e.stopPropagation();
      }
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(options[active].value);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ? `${label}: ${current?.label ?? placeholder ?? ""}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "adm-field flex w-full items-center justify-between gap-[8px] border-[1px] border-border bg-background text-left transition-colors focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-expanded:border-primary aria-expanded:ring-2 aria-expanded:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
          compact
            ? "rounded-lg px-[10px] py-[6px] text-[13px] leading-[18px]"
            : "rounded-xl px-[14px] py-[10px] text-[14px] leading-[20px]",
          className
        )}
      >
        <span className={cn("min-w-0 truncate", !current && "text-muted-foreground")}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open &&
        place &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            aria-label={label}
            style={place}
            className="fixed z-[70] max-h-[260px] overflow-y-auto rounded-xl border-[1px] border-border bg-card p-[4px] shadow-[0_18px_40px_-16px_rgb(11_26_55/0.45)] animate-[adm-pop-in_0.14s_ease-out_backwards]"
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
                  className={cn(
                    "flex cursor-pointer items-center gap-[10px] rounded-lg px-[10px] py-[8px]",
                    i === active && "bg-primary/[0.07]"
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px] leading-[18px]",
                      selected ? "font-semibold text-primary" : "text-foreground"
                    )}
                  >
                    {o.label}
                  </span>
                  <Check className={cn("h-4 w-4 shrink-0 text-primary", !selected && "[visibility:hidden]")} />
                </li>
              );
            })}
          </ul>,
          document.querySelector(".admin-dashboard") ?? document.body
        )}
    </>
  );
}
