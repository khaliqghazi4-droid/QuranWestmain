"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Clock,
  Copy,
  Plus,
  Trash2,
  Save,
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { COMMON_TIMEZONES, DAYS, detectTimezone } from "@/lib/timezones";

type Slot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type EditorProps = {
  userId?: string;
  saveUrl?: string; // overrides userId path; e.g. /api/enrollments/abc/availability
  initialTimezone: string;
  initialSlots: Slot[];
  canEdit?: boolean;
  description?: string;
  onSaved?: () => void;
};

// Sizes and gaps are written out ([13px], [12px]…) in this file: the
// website's Bootstrap sheet overrides .text-sm, .text-xs, .p-4, .gap-2…
const FIELD =
  "rounded-lg border-[1px] border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

// The weekly hours someone can take classes: a time zone, then each day's
// time windows. It fills the dialog below its header: the days scroll, and
// the Save row stays pinned at the bottom.
export function AvailabilityEditor({
  userId,
  saveUrl,
  initialTimezone,
  initialSlots,
  canEdit = true,
  description = "Set hours when you can take classes",
  onSaved,
}: EditorProps) {
  const router = useRouter();
  const [timezone, setTimezone] = React.useState(initialTimezone);
  const [slots, setSlots] = React.useState<Slot[]>(initialSlots);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function addSlot(day: number) {
    setSlots([...slots, { dayOfWeek: day, startTime: "09:00", endTime: "17:00" }]);
  }

  function updateSlot(index: number, key: keyof Slot, value: string | number) {
    setSlots(
      slots.map((s, i) => (i === index ? { ...s, [key]: value } : s))
    );
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function applyToAllWeekdays(slotIndex: number) {
    const template = slots[slotIndex];
    if (!template) return;
    // Add slot template for Mon-Fri (1-5) where missing
    const next = [...slots];
    for (let d = 1; d <= 5; d++) {
      const hasDay = next.some(
        (s, i) => i !== slotIndex && s.dayOfWeek === d && s.startTime === template.startTime
      );
      if (!hasDay && template.dayOfWeek !== d) {
        next.push({ dayOfWeek: d, startTime: template.startTime, endTime: template.endTime });
      }
    }
    setSlots(next);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    // Validate
    for (const s of slots) {
      if (s.startTime >= s.endTime) {
        setError(`Invalid time on ${DAYS[s.dayOfWeek].long}: end must be after start`);
        setSaving(false);
        return;
      }
    }

    const url = saveUrl ?? `/api/users/${userId}/availability`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots, timezone }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Save failed");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved?.();
    router.refresh();
  }

  const slotsByDay = React.useMemo(() => {
    const map: Record<number, { slot: Slot; index: number }[]> = {};
    slots.forEach((s, i) => {
      if (!map[s.dayOfWeek]) map[s.dayOfWeek] = [];
      map[s.dayOfWeek].push({ slot: s, index: i });
    });
    return map;
  }, [slots]);

  const totalHours = slots.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    return sum + (eh - sh) + (em - sm) / 60;
  }, 0);
  // "24 h", "7.5 h"
  const hours = Number(totalHours.toFixed(1)).toString();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-[16px] overflow-y-auto px-[20px] py-[18px] sm:px-[24px]">
        <div className="flex flex-wrap items-start justify-between gap-[10px]">
          <p className="max-w-[420px] text-[13px] leading-[19px] text-muted-foreground">{description}</p>
          <span className="inline-flex shrink-0 items-center gap-[6px] rounded-full bg-primary/10 px-[10px] py-[4px] text-[12px] font-semibold leading-[16px] text-primary">
            <Clock className="h-3.5 w-3.5" /> {hours} h a week
          </span>
        </div>

        {/* Time zone */}
        <div>
          <label
            id="availability-tz-label"
            htmlFor="availability-tz"
            className="mb-[6px] inline-flex items-center gap-[6px] text-[12.5px] font-semibold leading-[18px] text-muted-foreground"
          >
            <Globe className="h-3.5 w-3.5" /> Time zone
          </label>
          <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px]">
            <TimezoneSelect id="availability-tz" value={timezone} onChange={setTimezone} disabled={!canEdit} />
            {canEdit && (
              <button
                type="button"
                onClick={() => setTimezone(detectTimezone())}
                className="text-[12.5px] font-semibold leading-[18px] text-primary hover:underline"
              >
                Use this computer&apos;s time zone
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-[8px] rounded-xl border-[1px] border-destructive/30 bg-destructive/10 p-[12px] text-[12.5px] leading-[18px] text-destructive">
            <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* The week: one row per day. Phones: day and Add on top, the times
            below. The wrap and order are arbitrary values because Bootstrap's
            .flex-wrap and .order-last are !important and would beat sm: ones. */}
        <ul className="adm-rows divide-y divide-border overflow-hidden rounded-xl border-[1px] border-border">
          {DAYS.map((day) => {
            const daySlots = slotsByDay[day.id] ?? [];
            return (
              <li
                key={day.id}
                className="flex items-start gap-x-[12px] gap-y-[8px] px-[14px] py-[12px] [flex-wrap:wrap] sm:[flex-wrap:nowrap]"
              >
                <p className="flex-1 pt-[6px] text-[13.5px] font-semibold leading-[18px] sm:w-[92px] sm:flex-none">
                  <span className="hidden sm:inline">{day.long}</span>
                  <span className="sm:hidden">{day.short}</span>
                </p>
                <div className="order-[99] w-full min-w-0 space-y-[8px] sm:order-[0] sm:w-auto sm:flex-1">
                  {daySlots.length === 0 ? (
                    <p className="pt-[6px] text-[13px] italic leading-[18px] text-muted-foreground">Off</p>
                  ) : (
                    daySlots.map(({ slot, index }) => (
                      <div key={index} className="flex flex-wrap items-center gap-[8px]">
                        <input
                          type="time"
                          aria-label={`${day.long} from`}
                          disabled={!canEdit}
                          value={slot.startTime}
                          onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                          className={`${FIELD} px-[8px] py-[5px] text-[13px] leading-[18px]`}
                        />
                        <span className="text-[12.5px] text-muted-foreground">to</span>
                        <input
                          type="time"
                          aria-label={`${day.long} until`}
                          disabled={!canEdit}
                          value={slot.endTime}
                          onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                          className={`${FIELD} px-[8px] py-[5px] text-[13px] leading-[18px]`}
                        />
                        {canEdit && (
                          <span className="inline-flex items-center gap-[2px]">
                            <button
                              type="button"
                              onClick={() => applyToAllWeekdays(index)}
                              title="Copy this time to Monday–Friday"
                              className="inline-flex items-center gap-[4px] rounded-full px-[8px] py-[5px] text-[12px] font-semibold leading-[16px] text-primary transition-colors hover:bg-primary/10"
                            >
                              <Copy className="h-3.5 w-3.5" /> Mon–Fri
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSlot(index)}
                              title="Remove this time"
                              aria-label={`Remove this ${day.long} time`}
                              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => addSlot(day.id)}
                    className="inline-flex shrink-0 items-center gap-[4px] rounded-full border-[1px] border-dashed border-border px-[10px] py-[5px] text-[12px] font-semibold leading-[16px] text-primary transition-colors hover:bg-primary/5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {canEdit && (
        <div className="flex items-center justify-end gap-[10px] border-t border-border px-[20px] py-[14px] sm:px-[24px]">
          {saved && (
            <span className="mr-auto inline-flex items-center gap-[6px] text-[13px] font-semibold leading-[18px] text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[20px] py-[9px] text-[13.5px] font-semibold leading-[18px] text-primary-foreground shadow-md disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save times
          </button>
        </div>
      )}
    </div>
  );
}

// A time zone's parts for display: the country code from its flag emoji
// (Windows can't draw flag emojis, it shows the two letters anyway), the name,
// the short name in brackets and the offset right now ("UTC+5")
function tzParts(id: string) {
  const tz = COMMON_TIMEZONES.find((t) => t.id === id);
  const label: string = tz?.label ?? id.replace(/_/g, " ");
  const flag = /^([\u{1F1E6}-\u{1F1FF}]{2})\s*/u.exec(label);
  const code = flag
    ? [...flag[1]].map((c) => String.fromCharCode(c.codePointAt(0)! - 0x1f1e6 + 65)).join("")
    : null;
  const rest = label.replace(/^\S+\s+/u, (m) => (flag || /^\p{Extended_Pictographic}/u.test(m) ? "" : m));
  const m = /^(.*?)\s*\(([^)]+)\)$/.exec(rest);
  let offset = "";
  try {
    offset =
      new Intl.DateTimeFormat("en-US", { timeZone: id, timeZoneName: "shortOffset" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")
        ?.value.replace("GMT", "UTC") ?? "";
    if (offset === "UTC") offset = "UTC+0";
  } catch {
    offset = tz?.offset ?? "";
  }
  return { code, name: m ? m[1] : rest, abbr: m ? m[2] : null, offset };
}

function TzBadge({ code }: { code: string | null }) {
  return (
    <span className="grid h-7 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-[10.5px] font-bold tracking-[0.04em] text-primary">
      {code ?? <Globe className="h-3.5 w-3.5" />}
    </span>
  );
}

// The time zone dropdown: our own list instead of the browser's, so it matches
// the rest of the pop-up (white, navy, a tick on the chosen one). A zone that
// isn't in the list (from "Use this computer's time zone") still shows by name.
function TimezoneSelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (tz: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const options = COMMON_TIMEZONES.map((t) => t.id as string);
  const current = tzParts(value);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Opening: start the highlight on the chosen zone and bring it into view
  React.useEffect(() => {
    if (!open) return;
    const i = Math.max(0, options.indexOf(value));
    setActive(i);
    listRef.current?.children[i]?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function choose(tz: string) {
    onChange(tz);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActive(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(options[active]);
    }
  }

  return (
    <div ref={ref} className="relative w-full sm:w-[320px]">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`${FIELD} flex w-full items-center gap-[10px] px-[10px] py-[6px] text-left ${open ? "!border-[hsl(var(--primary))] ring-2 ring-primary/20" : ""}`}
      >
        <TzBadge code={current.code} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold leading-[18px]">{current.name}</span>
          <span className="block truncate text-[11.5px] leading-[15px] text-muted-foreground">
            {[current.abbr, current.offset].filter(Boolean).join(" · ")}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 top-full z-30 mt-[6px] max-h-[300px] overflow-y-auto rounded-xl border-[1px] border-border bg-card p-[4px] shadow-[0_18px_40px_-16px_rgb(11_26_55/0.45)]"
        >
          {options.map((tz, i) => {
            const p = tzParts(tz);
            const selected = tz === value;
            return (
              <li
                key={tz}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(tz)}
                className={`flex cursor-pointer items-center gap-[10px] rounded-lg px-[8px] py-[6px] ${
                  i === active ? "bg-muted" : ""
                }`}
              >
                <TzBadge code={p.code} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[13px] leading-[18px] ${selected ? "font-semibold text-primary" : ""}`}>
                    {p.name}
                    {p.abbr && <span className="font-normal text-muted-foreground"> · {p.abbr}</span>}
                  </span>
                </span>
                <span className="shrink-0 text-[11.5px] leading-[16px] text-muted-foreground">{p.offset}</span>
                <Check className={`h-4 w-4 shrink-0 text-primary ${selected ? "" : "[visibility:hidden]"}`} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// The editor in a pop-up: icon, title and subtitle, then the editor. White
// and navy in the light admin (.adm-modal); rendered into the dashboard
// shell, so a glass card's blur around the opener can't trap the overlay.
export function AvailabilityDialog({
  title,
  subtitle,
  onClose,
  ...editor
}: EditorProps & { title: string; subtitle: React.ReactNode; onClose: () => void }) {
  React.useLayoutEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    const html = document.documentElement;
    if (main) main.style.overflow = "hidden";
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "";
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-[16px] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="adm-modal flex max-h-[min(92vh,780px)] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl border-[1px] border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-[12px] border-b border-border px-[20px] py-[16px] sm:px-[24px]">
          <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <CalendarClock className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold leading-[24px]">{title}</h2>
            <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <AvailabilityEditor {...editor} />
      </div>
    </div>,
    document.querySelector(".admin-dashboard") ?? document.body
  );
}
