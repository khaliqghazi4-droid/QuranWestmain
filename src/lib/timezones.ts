// Common timezones for Quran academy global students
export const COMMON_TIMEZONES = [
  { id: "Asia/Karachi", label: "🇵🇰 Pakistan (PKT)", offset: "+05:00" },
  { id: "Asia/Dubai", label: "🇦🇪 UAE (GST)", offset: "+04:00" },
  { id: "Asia/Riyadh", label: "🇸🇦 Saudi Arabia (AST)", offset: "+03:00" },
  { id: "Asia/Kolkata", label: "🇮🇳 India (IST)", offset: "+05:30" },
  { id: "Europe/London", label: "🇬🇧 UK (GMT/BST)", offset: "+00:00 / +01:00" },
  { id: "America/New_York", label: "🇺🇸 US East (EST/EDT)", offset: "-05:00 / -04:00" },
  { id: "America/Chicago", label: "🇺🇸 US Central (CST/CDT)", offset: "-06:00 / -05:00" },
  { id: "America/Denver", label: "🇺🇸 US Mountain (MST/MDT)", offset: "-07:00 / -06:00" },
  { id: "America/Los_Angeles", label: "🇺🇸 US West (PST/PDT)", offset: "-08:00 / -07:00" },
  { id: "America/Toronto", label: "🇨🇦 Canada East", offset: "-05:00 / -04:00" },
  { id: "Australia/Sydney", label: "🇦🇺 Australia East (AEST/AEDT)", offset: "+10:00 / +11:00" },
  { id: "Australia/Perth", label: "🇦🇺 Australia West (AWST)", offset: "+08:00" },
  { id: "UTC", label: "🌐 UTC", offset: "+00:00" },
] as const;

export const DAYS = [
  { id: 0, short: "Sun", long: "Sunday" },
  { id: 1, short: "Mon", long: "Monday" },
  { id: 2, short: "Tue", long: "Tuesday" },
  { id: 3, short: "Wed", long: "Wednesday" },
  { id: 4, short: "Thu", long: "Thursday" },
  { id: 5, short: "Fri", long: "Friday" },
  { id: 6, short: "Sat", long: "Saturday" },
];

// Auto-detect user's timezone
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

// Convert "HH:MM" in source timezone to "HH:MM" in target timezone
// Returns { time, dayShift } where dayShift is -1, 0, or +1 (day rolls over)
export function convertTime(
  hhmm: string,
  fromTz: string,
  toTz: string,
  dayOfWeek: number = 0
): { time: string; dayShift: number } {
  if (fromTz === toTz) return { time: hhmm, dayShift: 0 };

  try {
    // Use a fixed reference date (Monday)
    // Find a date that matches dayOfWeek
    const refDate = new Date("2025-01-06T00:00:00Z"); // Monday
    refDate.setUTCDate(refDate.getUTCDate() + ((dayOfWeek - 1 + 7) % 7));

    const [hours, minutes] = hhmm.split(":").map(Number);

    // Build the date as if it's in `fromTz`
    // We use a hack: format reference date in source TZ and shift
    const sourceOffset = getOffsetMinutes(fromTz, refDate);
    const utc = new Date(refDate);
    utc.setUTCHours(hours, minutes, 0, 0);
    utc.setUTCMinutes(utc.getUTCMinutes() - sourceOffset);

    // Now format in target TZ
    const targetParts = new Intl.DateTimeFormat("en-US", {
      timeZone: toTz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(utc);

    const get = (type: string) =>
      Number(targetParts.find((p) => p.type === type)?.value ?? 0);

    const targetH = get("hour") % 24;
    const targetM = get("minute");
    const targetDay = get("day");
    const refDay = refDate.getUTCDate();

    let dayShift = 0;
    if (targetDay > refDay) dayShift = 1;
    if (targetDay < refDay) dayShift = -1;

    return {
      time: `${String(targetH).padStart(2, "0")}:${String(targetM).padStart(2, "0")}`,
      dayShift,
    };
  } catch {
    return { time: hhmm, dayShift: 0 };
  }
}

function getOffsetMinutes(tz: string, date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
    // Parses "GMT+5", "GMT-5:30", "GMT+5:00"
    const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    const hours = Number(match[2] ?? 0);
    const mins = Number(match[3] ?? 0);
    return sign * (hours * 60 + mins);
  } catch {
    return 0;
  }
}

// Format "HH:MM" as 12-hour with AM/PM
export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Format day with optional shift
export function formatDayWithShift(dayOfWeek: number, shift: number): string {
  const newDay = ((dayOfWeek + shift) % 7 + 7) % 7;
  return DAYS[newDay].short;
}
