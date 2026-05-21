"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Users, Loader2, Save } from "lucide-react";
import { Avatar } from "@/components/avatar";

type Student = {
  studentId: string;
  name: string;
  email: string;
  currentStatus: "PRESENT" | "ABSENT" | "LATE" | null;
};

const options = [
  { id: "PRESENT", label: "Present", icon: CheckCircle2, color: "border-emerald-500 bg-emerald-500/10 text-emerald-600" },
  { id: "LATE", label: "Late", icon: Clock, color: "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))]" },
  { id: "ABSENT", label: "Absent", icon: XCircle, color: "border-destructive bg-destructive/10 text-destructive" },
] as const;

export function AttendanceForm({
  classId,
  roster,
}: {
  classId: string;
  roster: Student[];
}) {
  const router = useRouter();
  const [marks, setMarks] = React.useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>(
    Object.fromEntries(
      roster.map((s) => [s.studentId, s.currentStatus ?? "PRESENT"])
    )
  );
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        marks: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to save");
    }
  }

  function markAll(status: "PRESENT" | "ABSENT" | "LATE") {
    setMarks(Object.fromEntries(roster.map((s) => [s.studentId, status])));
  }

  if (roster.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-base font-bold">No students enrolled</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Students must enroll in this course before attendance can be marked
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{roster.length} students enrolled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Quick mark all:</span>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => markAll(opt.id)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold ${opt.color} hover:opacity-80`}
            >
              <opt.icon className="h-3 w-3" /> {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {roster.map((s, i) => (
          <div
            key={s.studentId}
            className="flex items-center gap-4 p-4 stagger-item"
            style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
          >
            <Avatar name={s.name} size={44} style="micah" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {options.map((opt) => {
                const active = marks[s.studentId] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMarks({ ...marks, [s.studentId]: opt.id })}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      active
                        ? opt.color
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <opt.icon className="h-3 w-3" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">
          {saved ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Attendance saved successfully!
            </span>
          ) : (
            "Changes are not saved until you click Save"
          )}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}
