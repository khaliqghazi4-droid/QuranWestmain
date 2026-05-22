// Teacher shift definitions — all times in Pakistan Time (Asia/Karachi)
import { convertTime, formatTime12h } from "@/lib/timezones";

export const PK_TZ = "Asia/Karachi";

export type Shift = "DAY" | "NIGHT";

// Day: 1 PM - 9 PM PKT | Night: 9 PM - 4 AM PKT
export const SHIFT_RANGES: Record<Shift, { start: string; end: string; label: string }> = {
  DAY: { start: "13:00", end: "21:00", label: "Day (1 PM - 9 PM PKT)" },
  NIGHT: { start: "21:00", end: "04:00", label: "Night (9 PM - 4 AM PKT)" },
};

export const SLOT_MINUTES = 30;

// Generate 30-minute slot start-times for a shift (in PKT, "HH:MM")
export function generateShiftSlots(shift: Shift): string[] {
  const { start, end } = SHIFT_RANGES[shift];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  // Night shift wraps past midnight
  if (endMin <= startMin) endMin += 24 * 60;

  const slots: string[] = [];
  for (let m = startMin; m < endMin; m += SLOT_MINUTES) {
    const mm = m % (24 * 60);
    const h = Math.floor(mm / 60);
    const min = mm % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

// Add minutes to "HH:MM", wrapping at 24h
export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  let total = h * 60 + m + minutes;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

// Check if a PKT slot [slotStart, slotStart+30) falls within ANY of the student's
// availability windows. Student windows are in their own timezone, so we convert
// each window's bounds to PKT for comparison on the matching weekday.
export type AvailWindow = { dayOfWeek: number; startTime: string; endTime: string };

export function slotMatchesStudent(
  slotDay: number,
  slotStart: string, // PKT "HH:MM"
  studentWindows: AvailWindow[],
  studentTz: string
): boolean {
  const slotStartMin = toMinutes(slotStart);
  const slotEndMin = slotStartMin + SLOT_MINUTES;

  for (const w of studentWindows) {
    // Convert student's window bounds (their TZ) to PKT
    const startConv = convertTime(w.startTime, studentTz, PK_TZ, w.dayOfWeek);
    const endConv = convertTime(w.endTime, studentTz, PK_TZ, w.dayOfWeek);

    // The day in PKT for this window's start
    const winDay = ((w.dayOfWeek + startConv.dayShift) % 7 + 7) % 7;
    if (winDay !== slotDay) continue;

    let winStartMin = toMinutes(startConv.time);
    let winEndMin = toMinutes(endConv.time);
    // Handle window crossing midnight in PKT
    if (winEndMin <= winStartMin) winEndMin += 24 * 60;

    let s = slotStartMin;
    let e = slotEndMin;
    // If window wrapped, also try shifting slot
    if (winEndMin > 24 * 60 && s < winStartMin) {
      s += 24 * 60;
      e += 24 * 60;
    }

    if (s >= winStartMin && e <= winEndMin) return true;
  }
  return false;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Format a PKT slot for display: returns "1:00 PM - 1:30 PM"
export function formatSlotRange(slotStart: string): string {
  const end = addMinutes(slotStart, SLOT_MINUTES);
  return `${formatTime12h(slotStart)} - ${formatTime12h(end)}`;
}
