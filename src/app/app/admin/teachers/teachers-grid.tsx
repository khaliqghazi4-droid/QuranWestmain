"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Star,
  UserX,
  MoreVertical,
  Mail,
  Award,
  Users,
  BookOpen,
  Loader2,
  X,
  Search,
  AlertCircle,
  KeyRound,
  Copy,
  CheckCircle2,
  Check,
  GraduationCap,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { AvailabilityViewer } from "@/components/availability/availability-viewer";

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  bio: string | null;
  createdAt: string;
  timezone: string;
  courses: { id: string; name: string; students: number }[];
  availability: AvailabilitySlot[];
};

type CourseOption = {
  id: string;
  name: string;
  level: string;
  assignedTeacherId: string | null;
  assignedTeacherName: string | null;
};

export function TeachersGrid({
  initialTeachers,
  allCourses,
}: {
  initialTeachers: Teacher[];
  allCourses: CourseOption[];
}) {
  const router = useRouter();
  const [teachers, setTeachers] = React.useState(initialTeachers);
  const [query, setQuery] = React.useState("");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [resetting, setResetting] = React.useState<string | null>(null);
  const [resetResult, setResetResult] = React.useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [assignTarget, setAssignTarget] = React.useState<Teacher | null>(null);
  const [availabilityOpenId, setAvailabilityOpenId] = React.useState<string | null>(null);

  function handleAssignmentSaved(teacherId: string, assigned: CourseOption[]) {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              courses: assigned.map((c) => ({
                id: c.id,
                name: c.name,
                students:
                  t.courses.find((tc) => tc.id === c.id)?.students ?? 0,
              })),
            }
          : t
      )
    );
    setAssignTarget(null);
    router.refresh();
  }

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

  const filtered = teachers.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.country?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name}? Their assigned courses will be unassigned.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setTeachers(teachers.filter((t) => t.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
    }
  }

  function handleInvited(teacher: Teacher) {
    setTeachers([teacher, ...teachers]);
    setInviteOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teachers..."
            className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md"
        >
          <Plus className="h-4 w-4" /> Invite Teacher
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            {query ? "No teachers match your search" : "No teachers yet. Invite your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => {
            const totalStudents = t.courses.reduce((s, c) => s + c.students, 0);
            return (
              <div
                key={t.id}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all stagger-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={t.name} size={56} style="micah" className="rounded-2xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold truncate">{t.name}</p>
                      <Award className="h-3.5 w-3.5 text-[hsl(var(--gold))] shrink-0" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.email}</p>
                    {t.country && (
                      <p className="text-[11px] text-muted-foreground">{t.country}</p>
                    )}
                  </div>
                  <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {t.bio && (
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {t.bio}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Courses</p>
                    <p className="text-base font-bold mt-0.5 inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {t.courses.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Students</p>
                    <p className="text-base font-bold mt-0.5 inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {totalStudents}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Rating</p>
                    <p className="text-base font-bold mt-0.5 inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                      —
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAssignTarget(t)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-2 text-[11px] font-bold text-primary-foreground shadow-md hover:shadow-lg"
                  >
                    <GraduationCap className="h-3.5 w-3.5" /> Assign ({t.courses.length})
                  </button>
                  <button
                    onClick={() =>
                      setAvailabilityOpenId(availabilityOpenId === t.id ? null : t.id)
                    }
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition-all ${
                      availabilityOpenId === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule ({t.availability.length})
                    {availabilityOpenId === t.id ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {availabilityOpenId === t.id && (
                  <div className="mt-3 rounded-xl border border-border bg-background p-3">
                    <AvailabilityViewer
                      teacherTimezone={t.timezone}
                      slots={t.availability}
                      compact
                    />
                  </div>
                )}

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a
                    href={`mailto:${t.email}`}
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 py-1.5 text-[11px] font-semibold hover:bg-muted"
                    title="Email"
                  >
                    <Mail className="h-3 w-3" /> Email
                  </a>
                  <button
                    onClick={() => handleResetPassword(t.id, t.name, t.email)}
                    disabled={resetting === t.id}
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-50"
                  >
                    {resetting === t.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <KeyRound className="h-3 w-3" />
                    )}
                    Reset
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    disabled={deleting === t.id}
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 disabled:opacity-50 col-span-2"
                  >
                    {deleting === t.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserX className="h-3 w-3" />
                    )}
                    Remove Teacher
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {inviteOpen && (
        <InviteTeacherModal
          onClose={() => setInviteOpen(false)}
          onInvited={handleInvited}
        />
      )}
      {resetResult && (
        <PasswordRevealModal
          name={resetResult.name}
          email={resetResult.email}
          password={resetResult.password}
          onClose={() => setResetResult(null)}
        />
      )}
      {assignTarget && (
        <AssignCoursesModal
          teacher={assignTarget}
          allCourses={allCourses}
          onClose={() => setAssignTarget(null)}
          onSaved={handleAssignmentSaved}
        />
      )}
    </div>
  );
}

function AssignCoursesModal({
  teacher,
  allCourses,
  onClose,
  onSaved,
}: {
  teacher: Teacher;
  allCourses: CourseOption[];
  onClose: () => void;
  onSaved: (teacherId: string, assigned: CourseOption[]) => void;
}) {
  const initialAssigned = new Set(
    allCourses.filter((c) => c.assignedTeacherId === teacher.id).map((c) => c.id)
  );
  const [selected, setSelected] = React.useState<Set<string>>(initialAssigned);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggle(courseId: string) {
    const next = new Set(selected);
    if (next.has(courseId)) next.delete(courseId);
    else next.add(courseId);
    setSelected(next);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    // Diff: courses to assign (newly selected) and unassign (deselected)
    const toAssign: string[] = [];
    const toUnassign: string[] = [];
    for (const c of allCourses) {
      const wasAssigned = c.assignedTeacherId === teacher.id;
      const isAssigned = selected.has(c.id);
      if (!wasAssigned && isAssigned) toAssign.push(c.id);
      if (wasAssigned && !isAssigned) toUnassign.push(c.id);
    }

    try {
      // Assign new ones (overwrites any existing teacher)
      for (const id of toAssign) {
        const res = await fetch(`/api/courses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId: teacher.id }),
        });
        if (!res.ok) throw new Error("Failed to assign");
      }
      // Unassign deselected ones
      for (const id of toUnassign) {
        const res = await fetch(`/api/courses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId: null }),
        });
        if (!res.ok) throw new Error("Failed to unassign");
      }

      setSaving(false);
      onSaved(
        teacher.id,
        allCourses.filter((c) => selected.has(c.id))
      );
    } catch (e) {
      setSaving(false);
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <Avatar name={teacher.name} size={40} style="micah" />
            <div>
              <h2 className="text-lg font-bold inline-flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> Assign Courses
              </h2>
              <p className="text-xs text-muted-foreground">
                Select which courses <span className="font-semibold text-foreground">{teacher.name}</span> will teach
              </p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs text-foreground">
              <span className="font-semibold">💡 Note:</span> Assigning a course will move it
              from its current teacher (if any) to this teacher. Students remain enrolled.
            </p>
          </div>

          {allCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                No courses created yet. Go to Courses page to add some first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCourses.map((c) => {
                const isSelected = selected.has(c.id);
                const otherTeacher =
                  c.assignedTeacherId &&
                  c.assignedTeacherId !== teacher.id
                    ? c.assignedTeacherName
                    : null;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div
                      className={`grid h-6 w-6 place-items-center rounded-md border-2 transition-all shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] uppercase font-semibold text-primary">
                          {c.level}
                        </span>
                        {otherTeacher && (
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <Users className="h-3 w-3" /> Currently: {otherTeacher}
                          </span>
                        )}
                        {!c.assignedTeacherId && (
                          <span className="text-[11px] text-[hsl(var(--gold))] font-semibold">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Assignments ({selected.size})
            </button>
          </div>
        </div>
      </div>
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
              ⚠️ <span className="font-semibold">Share this securely!</span> The password
              will not be shown again. Teacher should change it after first login.
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

function InviteTeacherModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: (t: Teacher) => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "teacher" }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Invite failed");
      setLoading(false);
      return;
    }

    // Optionally update country/bio
    if (country || bio) {
      await fetch(`/api/users/${data.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country || null, bio: bio || null }),
      });
    }

    setLoading(false);
    onInvited({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      country: country || null,
      bio: bio || null,
      createdAt: new Date().toISOString(),
      timezone: "UTC",
      courses: [],
      availability: [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold">Invite a Teacher</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Full Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Qari Abdullah Rahman"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Email *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@academy.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Pakistan"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Temporary Password *
            </label>
            <input
              required
              type="text"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters (share with teacher securely)"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Bio (optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Brief introduction, qualifications, experience..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Invite Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
