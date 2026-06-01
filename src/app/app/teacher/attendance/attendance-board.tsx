"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  ClipboardCheck,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatSlotRange } from "@/lib/shifts";

export type AttendanceRow = {
  bookingSlotId: string;
  studentId: string;
  studentName: string;
  courseName: string;
  startTime: string;
  status: "PRESENT" | "ABSENT" | "LATE" | null;
};

export function AttendanceBoard({
  date,
  rows,
}: {
  date: string;
  rows: AttendanceRow[];
}) {
  const router = useRouter();

  function changeDate(next: string) {
    router.push(`/app/teacher/attendance?date=${next}`);
  }
  function shiftDate(days: number) {
    const d = new Date(`${date}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    changeDate(d.toISOString().slice(0, 10));
  }

  const dateLabel = new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const present = rows.filter((r) => r.status === "PRESENT").length;
  const absent = rows.filter((r) => r.status === "ABSENT").length;
  const late = rows.filter((r) => r.status === "LATE").length;
  const unmarked = rows.filter((r) => !r.status).length;

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => shiftDate(-1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <CalendarDays className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-bold">{dateLabel}</p>
            <p className="text-[11px] text-muted-foreground">PKT calendar day</p>
          </div>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => changeDate(e.target.value)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => shiftDate(1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SummaryCard label="Present" value={present} className="bg-emerald-500/10 text-emerald-700" />
          <SummaryCard label="Late" value={late} className="bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))]" />
          <SummaryCard label="Absent" value={absent} className="bg-destructive/10 text-destructive" />
          <SummaryCard label="Unmarked" value={unmarked} className="bg-muted text-muted-foreground" />
        </div>
      )}

      {/* Class rows */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm font-semibold">No classes on this day</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You have no booked classes scheduled for {dateLabel}.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <Row key={r.bookingSlotId} row={r} date={date} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl px-3 py-2 text-center ${className}`}>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      <p className="text-[10px] uppercase font-semibold tracking-wide">{label}</p>
    </div>
  );
}

function Row({ row, date }: { row: AttendanceRow; date: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function mark(status: "PRESENT" | "ABSENT" | "LATE") {
    setError(null);
    setBusy(status);
    const res = await fetch("/api/booking-attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingSlotId: row.bookingSlotId, date, status }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  async function clear() {
    setError(null);
    setBusy("clear");
    const res = await fetch(
      `/api/booking-attendance?bookingSlotId=${row.bookingSlotId}&date=${date}`,
      { method: "DELETE" }
    );
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="p-4 flex items-center gap-3 flex-wrap">
      <Avatar name={row.studentName} size={40} style="micah" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{row.studentName}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatSlotRange(row.startTime)} PKT · {row.courseName}
        </p>
        {error && <p className="text-[11px] text-destructive mt-0.5">{error}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        <MarkBtn
          label="Present"
          icon={CheckCircle2}
          active={row.status === "PRESENT"}
          activeClass="bg-emerald-500 text-white border-emerald-500"
          onClick={() => mark("PRESENT")}
          busy={busy === "PRESENT"}
        />
        <MarkBtn
          label="Late"
          icon={Clock}
          active={row.status === "LATE"}
          activeClass="bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)] border-[hsl(var(--gold))]"
          onClick={() => mark("LATE")}
          busy={busy === "LATE"}
        />
        <MarkBtn
          label="Absent"
          icon={XCircle}
          active={row.status === "ABSENT"}
          activeClass="bg-destructive text-white border-destructive"
          onClick={() => mark("ABSENT")}
          busy={busy === "ABSENT"}
        />
        {row.status && (
          <button
            onClick={clear}
            disabled={busy === "clear"}
            title="Clear mark"
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted disabled:opacity-50"
          >
            {busy === "clear" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function MarkBtn({
  label,
  icon: Icon,
  active,
  activeClass,
  onClick,
  busy,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  activeClass: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all disabled:opacity-60 ${
        active ? activeClass : "border-border bg-background text-muted-foreground hover:bg-muted"
      }`}
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}
