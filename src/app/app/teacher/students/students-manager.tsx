"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, MessageSquare, Users, Loader2, Edit3, Check } from "lucide-react";
import { Avatar } from "@/components/avatar";

type Enrollment = {
  id: string;
  courseName: string;
  level: string;
  progress: number;
};

type Student = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  createdAt: string;
  enrollments: Enrollment[];
};

export function StudentsManager({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();
  const [students, setStudents] = React.useState(initialStudents);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null); // enrollment id
  const [editValue, setEditValue] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.enrollments.some((e) => e.courseName.toLowerCase().includes(q))
    );
  });

  function startEdit(enrollmentId: string, currentProgress: number) {
    setEditing(enrollmentId);
    setEditValue(currentProgress);
  }

  async function saveProgress(enrollmentId: string) {
    setSaving(true);
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: editValue }),
    });
    setSaving(false);
    if (res.ok) {
      setStudents(
        students.map((s) => ({
          ...s,
          enrollments: s.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, progress: editValue } : e
          ),
        }))
      );
      setEditing(null);
      router.refresh();
    } else {
      alert("Failed to update progress");
    }
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-base font-bold">No students yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Students will appear here once they enroll in your courses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, course..."
            className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => {
          const avgProgress = Math.round(
            s.enrollments.reduce((sum, e) => sum + e.progress, 0) / s.enrollments.length
          );
          return (
            <div
              key={s.id}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all stagger-item"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={s.name} size={48} style="micah" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.country ?? "—"} · {avgProgress}% avg
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Course progress
                </p>
                {s.enrollments.map((e) => (
                  <div key={e.id}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <p className="font-semibold truncate">{e.courseName}</p>
                      {editing === e.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editValue}
                            onChange={(ev) => setEditValue(Number(ev.target.value))}
                            className="w-14 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                            autoFocus
                          />
                          <button
                            onClick={() => saveProgress(e.id)}
                            disabled={saving}
                            className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-accent disabled:opacity-50"
                            aria-label="Save"
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(e.id, e.progress)}
                          className="inline-flex items-center gap-1 text-xs font-bold hover:text-primary"
                        >
                          {e.progress}%
                          <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                        style={{
                          width: `${editing === e.id ? editValue : e.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground">
                  Since{" "}
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    title="Message"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <a
                    href={`mailto:${s.email}`}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    title="Email"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">No students match &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
