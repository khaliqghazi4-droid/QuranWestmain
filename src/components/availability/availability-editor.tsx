"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Plus,
  Trash2,
  Save,
  Loader2,
  Calendar,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { COMMON_TIMEZONES, DAYS, detectTimezone } from "@/lib/timezones";

type Slot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function AvailabilityEditor({
  userId,
  initialTimezone,
  initialSlots,
  canEdit = true,
  title = "Weekly Availability",
  description = "Set hours when you can take classes",
}: {
  userId: string;
  initialTimezone: string;
  initialSlots: Slot[];
  canEdit?: boolean;
  title?: string;
  description?: string;
}) {
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

    const res = await fetch(`/api/users/${userId}/availability`, {
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

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold inline-flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {description} ·{" "}
            <span className="font-bold text-foreground">{totalHours.toFixed(1)} hours/week</span>
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Timezone selector */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1">
          <Globe className="h-3 w-3" /> Your Timezone
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            disabled={!canEdit}
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.label}
              </option>
            ))}
          </select>
          {canEdit && (
            <button
              type="button"
              onClick={() => setTimezone(detectTimezone())}
              className="text-xs text-primary hover:text-accent font-semibold"
            >
              Use my system timezone
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Days grid */}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const daySlots = slotsByDay[day.id] ?? [];
          return (
            <div
              key={day.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
            >
              <div className="w-20 shrink-0 pt-1.5">
                <p className="text-sm font-bold">{day.short}</p>
                <p className="text-[10px] text-muted-foreground">{day.long.toLowerCase()}</p>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-1.5">Off</p>
                ) : (
                  daySlots.map(({ slot, index }) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="time"
                        disabled={!canEdit}
                        value={slot.startTime}
                        onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="time"
                        disabled={!canEdit}
                        value={slot.endTime}
                        onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60"
                      />
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => applyToAllWeekdays(index)}
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] text-primary hover:text-accent font-semibold"
                            title="Apply to Mon-Fri"
                          >
                            Apply to weekdays
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSlot(index)}
                            className="grid h-7 w-7 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => addSlot(day.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/5 shrink-0"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Availability
          </button>
        </div>
      )}
    </div>
  );
}
