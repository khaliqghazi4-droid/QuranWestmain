"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  User,
  ClipboardCheck,
  Download,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatSlotRange } from "@/lib/shifts";
import { downloadCsv, safeFilename } from "@/lib/csv";

export type StudentHistoryRow = {
  id: string;
  date: string;       // ISO
  startTime: string;  // HH:MM PKT
  courseName: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  markedAt: string;   // ISO
};

type Student = { id: string; name: string };

export function StudentHistoryView({
  students,
  selectedStudentId,
  studentName,
  rows,
}: {
  students: Student[];
  selectedStudentId: string;
  studentName: string;
  rows: StudentHistoryRow[];
}) {
  const router = useRouter();

  function pickStudent(id: string) {
    if (!id) router.push("/app/teacher/attendance");
    else router.push(`/app/teacher/attendance?student=${id}`);
  }

  function exportCsv() {
    if (rows.length === 0) return;
    downloadCsv(
      `attendance-${safeFilename(studentName)}.csv`,
      ["Date", "Class Time (PKT)", "Course", "Status", "Marked At (PKT)"],
      rows.map((r) => [
        new Date(r.date).toLocaleDateString("en-US", {
          timeZone: "UTC",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        formatSlotRange(r.startTime),
        r.courseName,
        r.status,
        new Date(r.markedAt).toLocaleString("en-US", {
          timeZone: "Asia/Karachi",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      ])
    );
  }

  const present = rows.filter((r) => r.status === "PRESENT").length;
  const late = rows.filter((r) => r.status === "LATE").length;
  const absent = rows.filter((r) => r.status === "ABSENT").length;
  const total = rows.length;
  const attendancePct = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
          <Filter className="h-4 w-4" />
        </div>
        <select
          value={selectedStudentId}
          onChange={(e) => pickStudent(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]"
        >
          <option value="">All students (daily view)</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => pickStudent("")}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          ← Back to daily view
        </button>
        <div className="flex-1" />
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          title={`Download ${studentName}'s attendance as CSV`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* Student header card */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar name={studentName} size={48} style="micah" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold inline-flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> {studentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {total} class record{total === 1 ? "" : "s"} ·{" "}
              <span className="font-bold text-foreground">{attendancePct}%</span> attendance
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryCard
            label="Present"
            value={present}
            className="bg-emerald-500/10 text-emerald-700"
          />
          <SummaryCard
            label="Late"
            value={late}
            className="bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))]"
          />
          <SummaryCard
            label="Absent"
            value={absent}
            className="bg-destructive/10 text-destructive"
          />
        </div>
      </div>

      {/* History list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-semibold">No attendance records yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              When you mark a class for {studentName}, it will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Class
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Course
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                    Marked at
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 inline-flex items-center gap-1.5 font-semibold">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      {new Date(r.date).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatSlotRange(r.startTime)} <span className="text-[10px] text-muted-foreground">PKT</span>
                    </td>
                    <td className="px-4 py-3">{r.courseName}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.markedAt).toLocaleString("en-US", {
                        timeZone: "Asia/Karachi",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

function StatusPill({ status }: { status: "PRESENT" | "ABSENT" | "LATE" }) {
  if (status === "PRESENT")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Present
      </span>
    );
  if (status === "LATE")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold)/0.15)] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(var(--gold))]">
        <Clock className="h-3 w-3" /> Late
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold text-destructive">
      <XCircle className="h-3 w-3" /> Absent
    </span>
  );
}
