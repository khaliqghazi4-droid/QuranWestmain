"use client";

import * as React from "react";
import { Clock, Globe, Calendar, AlertCircle } from "lucide-react";
import {
  COMMON_TIMEZONES,
  DAYS,
  convertTime,
  formatTime12h,
  formatDayWithShift,
  detectTimezone,
} from "@/lib/timezones";

type Slot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function AvailabilityViewer({
  teacherTimezone,
  slots,
  showTimezoneSelector = true,
  compact = false,
}: {
  teacherTimezone: string;
  slots: Slot[];
  showTimezoneSelector?: boolean;
  compact?: boolean;
}) {
  const [viewerTz, setViewerTz] = React.useState(teacherTimezone);

  React.useEffect(() => {
    // Try to auto-detect viewer's timezone on first load
    const detected = detectTimezone();
    if (detected && detected !== teacherTimezone) {
      setViewerTz(detected);
    }
  }, [teacherTimezone]);

  const totalHours = slots.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    return sum + (eh - sh) + (em - sm) / 60;
  }, 0);

  // Group converted slots by day
  const grouped = React.useMemo(() => {
    const map: Record<number, { time: string; original: Slot; shift: number }[]> = {};
    for (const s of slots) {
      const start = convertTime(s.startTime, teacherTimezone, viewerTz, s.dayOfWeek);
      const end = convertTime(s.endTime, teacherTimezone, viewerTz, s.dayOfWeek);
      // Day in viewer's TZ may shift
      const viewerDay = ((s.dayOfWeek + start.dayShift) % 7 + 7) % 7;
      if (!map[viewerDay]) map[viewerDay] = [];
      map[viewerDay].push({
        time: `${formatTime12h(start.time)} - ${formatTime12h(end.time)}`,
        original: s,
        shift: start.dayShift,
      });
    }
    return map;
  }, [slots, teacherTimezone, viewerTz]);

  const teacherTzInfo = COMMON_TIMEZONES.find((t) => t.id === teacherTimezone);

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center">
        <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">
          No availability set yet
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {/* Timezone selector + total */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {showTimezoneSelector ? (
          <div className="inline-flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={viewerTz}
              onChange={(e) => setViewerTz(e.target.value)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Globe className="h-3 w-3" /> {teacherTzInfo?.label ?? teacherTimezone}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          <span className="font-bold text-foreground">{totalHours.toFixed(1)}h</span>{" "}
          available/week
        </p>
      </div>

      {viewerTz !== teacherTimezone && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px] text-foreground inline-flex items-start gap-1.5">
          <AlertCircle className="h-3 w-3 mt-0.5 text-primary shrink-0" />
          <span>
            Converted from teacher&apos;s timezone ({teacherTzInfo?.label ?? teacherTimezone})
            to <span className="font-semibold">{COMMON_TIMEZONES.find((t) => t.id === viewerTz)?.label ?? viewerTz}</span>
          </span>
        </div>
      )}

      {/* Schedule grid */}
      <div className="space-y-1.5">
        {DAYS.map((day) => {
          const daySlots = grouped[day.id] ?? [];
          const isOff = daySlots.length === 0;
          return (
            <div
              key={day.id}
              className={`flex items-start gap-3 rounded-lg ${
                isOff
                  ? "bg-muted/30"
                  : "border border-emerald-500/20 bg-emerald-500/5"
              } px-3 py-1.5`}
            >
              <p className="w-12 text-xs font-bold text-foreground shrink-0">
                {day.short}
              </p>
              {isOff ? (
                <p className="text-xs text-muted-foreground italic">—</p>
              ) : (
                <div className="flex-1 space-y-0.5">
                  {daySlots.map((s, i) => (
                    <div key={i} className="text-xs inline-flex items-center gap-2 flex-wrap">
                      <Clock className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{s.time}</span>
                      {s.shift !== 0 && (
                        <span className="text-[10px] text-muted-foreground italic">
                          (teacher&apos;s {DAYS[s.original.dayOfWeek].short} {formatTime12h(s.original.startTime)}{s.shift > 0 ? ", next day for them" : ", previous day for them"})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
