// Helpers for the "PKT calendar day" used by teacher workday attendance.

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Return midnight UTC of the PKT day that `now` falls in.
export function pktDayMidnightUTC(now: Date = new Date()): Date {
  const pkt = new Date(now.getTime() + PKT_OFFSET_MS);
  const ymd = `${pkt.getUTCFullYear()}-${String(pkt.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(pkt.getUTCDate()).padStart(2, "0")}`;
  return new Date(`${ymd}T00:00:00.000Z`);
}

// "YYYY-MM-DD" for the PKT day a given UTC instant falls in.
export function pktDayYmd(date: Date = new Date()): string {
  const pkt = new Date(date.getTime() + PKT_OFFSET_MS);
  return `${pkt.getUTCFullYear()}-${String(pkt.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(pkt.getUTCDate()).padStart(2, "0")}`;
}
