import { CheckCircle2, Clock, XCircle } from "lucide-react";

export type AttendanceDay = {
  ymd: string;            // YYYY-MM-DD (PKT)
  label: string;          // e.g. "Mon"
  dayOfMonth: number;     // e.g. 3
  isToday: boolean;
  record: {
    signInAt: string;     // ISO
    signOutAt: string | null;
  } | null;
};

function fmtTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtDuration(ms: number) {
  if (ms <= 0) return "0m";
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function WeekAttendanceStrip({ days }: { days: AttendanceDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const r = d.record;
        const present = !!r;
        const live = !!r && !r.signOutAt;
        const durationMs =
          r && r.signOutAt
            ? new Date(r.signOutAt).getTime() - new Date(r.signInAt).getTime()
            : 0;

        // Visual state classes
        let cardCls = "border-border bg-background";
        if (present && live) cardCls = "border-primary/40 bg-primary/5";
        else if (present) cardCls = "border-emerald-500/40 bg-emerald-500/5";
        else if (!present && !d.isToday)
          cardCls = "border-dashed border-destructive/30 bg-destructive/5";
        if (d.isToday) cardCls += " ring-2 ring-primary/40";

        return (
          <div
            key={d.ymd}
            title={
              r
                ? `In: ${fmtTime(r.signInAt)}${r.signOutAt ? ` · Out: ${fmtTime(r.signOutAt)}` : " · still in"}`
                : "Absent"
            }
            className={`relative rounded-xl border p-2 text-center ${cardCls}`}
          >
            {d.isToday && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                TODAY
              </span>
            )}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              {d.label}
            </p>
            <p className="text-base font-bold mt-0.5">{d.dayOfMonth}</p>

            <div className="mt-2 flex flex-col items-center gap-0.5 min-h-[50px]">
              {present ? (
                <>
                  {live ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {fmtTime(r.signInAt)}
                    {r.signOutAt && (
                      <>
                        <br />→ {fmtTime(r.signOutAt)}
                      </>
                    )}
                  </p>
                  {r.signOutAt ? (
                    <p className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {fmtDuration(durationMs)}
                    </p>
                  ) : (
                    <p className="text-[10px] font-bold text-primary">still in</p>
                  )}
                </>
              ) : d.isToday ? (
                <p className="text-[10px] text-muted-foreground italic">Not yet</p>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive/70" />
                  <p className="text-[10px] text-destructive font-semibold">Absent</p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
