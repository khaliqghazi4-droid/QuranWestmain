"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Mail, GraduationCap, Loader2, KeyRound, Copy, X, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/avatar";

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  createdAt: string;
  courses: string[];
};

export function StudentsTable({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();
  const [students, setStudents] = React.useState(initialStudents);
  const [query, setQuery] = React.useState("");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [resetting, setResetting] = React.useState<string | null>(null);
  const [resetResult, setResetResult] = React.useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  async function handleResetPassword(id: string, name: string, email: string) {
    if (!confirm(`Reset password for ${name}? A new random password will be generated.`)) return;
    setResetting(id);
    const res = await fetch(`/api/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setResetting(null);
    if (res.ok) {
      const data = await res.json();
      setResetResult({ name, email, password: data.newPassword });
    } else {
      const data = await res.json();
      alert(data.error ?? "Reset failed");
    }
  }

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.country?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This will remove all their enrollments. This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setStudents(students.filter((s) => s.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
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
            placeholder="Search by name, email, country..."
            className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            {query ? "No students match your search" : "No students yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Courses</th>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/20 transition-colors stagger-item"
                    style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size={36} style="micah" />
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.courses.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">
                          Not enrolled
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.courses.slice(0, 2).map((c, j) => (
                            <span
                              key={j}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                            >
                              {c}
                            </span>
                          ))}
                          {s.courses.length > 2 && (
                            <span className="text-[11px] text-muted-foreground self-center">
                              +{s.courses.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {s.country ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`mailto:${s.email}`}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                          title="Email"
                        >
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                        <button
                          onClick={() => handleResetPassword(s.id, s.name, s.email)}
                          disabled={resetting === s.id}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                          title="Reset password"
                        >
                          {resetting === s.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <KeyRound className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          disabled={deleting === s.id}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          title="Delete student"
                        >
                          {deleting === s.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground">
            <p>
              Showing {filtered.length} of {students.length} students
              {query && ` (filtered from "${query}")`}
            </p>
          </div>
        </div>
      )}

      {resetResult && (
        <PasswordRevealModal
          name={resetResult.name}
          email={resetResult.email}
          password={resetResult.password}
          onClose={() => setResetResult(null)}
        />
      )}
    </div>
  );
}

function PasswordRevealModal({
  name,
  email,
  password,
  onClose,
}: {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  function copyAll() {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl">
        <div className="bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-foreground/20 backdrop-blur-md mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Password Reset</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            New password generated for <span className="font-semibold">{name}</span>
          </p>
        </div>

        <div className="p-6 space-y-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Email</p>
            <p className="text-sm font-mono mt-1 break-all">{email}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">New Password</p>
            <p className="text-base font-mono mt-1 font-bold tracking-wider">{password}</p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold)/0.08)] p-3">
            <p className="text-xs text-foreground">
              ⚠️ <span className="font-semibold">Share this securely with the user!</span> The password
              will not be shown again. They should change it after first login.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={copyAll}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
