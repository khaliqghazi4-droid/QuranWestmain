"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserX,
  Mail,
  Award,
  Users,
  BookOpen,
  Loader2,
  X,
  Search,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Check,
  GraduationCap,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { AvailabilityEditor } from "@/components/availability/availability-editor";
import { LoginCredentialsModal } from "@/components/admin/login-credentials-modal";

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loginPassword: string | null;
  country: string | null;
  bio: string | null;
  createdAt: string;
  timezone: string;
  shift: "DAY" | "NIGHT" | null;
  gender: "MALE" | "FEMALE" | null;
  courses: { id: string; name: string; students: number }[];
  availability: AvailabilitySlot[];
  bookings: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    student: string;
    course: string;
  }[];
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
  const [genderFilter, setGenderFilter] = React.useState<"all" | "MALE" | "FEMALE">("all");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [loginFor, setLoginFor] = React.useState<Teacher | null>(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [assignTarget, setAssignTarget] = React.useState<Teacher | null>(null);
  const [availabilityOpenId, setAvailabilityOpenId] = React.useState<string | null>(null);
  const [editAvailabilityFor, setEditAvailabilityFor] = React.useState<Teacher | null>(null);

  function handleAssignmentSaved(teacherId: string, assigned: CourseOption[]) {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              courses: assigned.map((c) => ({
                id: c.id,
                name: c.name,
                students: t.courses.find((tc) => tc.id === c.id)?.students ?? 0,
              })),
            }
          : t
      )
    );
    setAssignTarget(null);
    router.refresh();
  }

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

  async function handleSetShift(id: string, shift: "DAY" | "NIGHT" | null) {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, shift } : t)));
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift }),
    });
    if (!res.ok) alert("Failed to update shift");
    router.refresh();
  }

  async function handleSetGender(id: string, gender: "MALE" | "FEMALE" | null) {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, gender } : t)));
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender }),
    });
    if (!res.ok) alert("Failed to update gender");
    router.refresh();
  }

  const filtered = teachers.filter((t) => {
    const q = query.toLowerCase();
    const matchesQuery =
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.country?.toLowerCase().includes(q) ?? false);
    const matchesGender = genderFilter === "all" || t.gender === genderFilter;
    return matchesQuery && matchesGender;
  });

  const dayTeachers = filtered.filter((t) => t.shift === "DAY");
  const nightTeachers = filtered.filter((t) => t.shift === "NIGHT");
  const unassignedTeachers = filtered.filter((t) => !t.shift);

  function renderCard(t: Teacher, i: number) {
    const totalStudents = t.courses.reduce((s, c) => s + c.students, 0);
    return (
      <div
        key={t.id}
        className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all stagger-item"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <Link
          href={`/app/admin/teachers/${t.id}`}
          className="flex items-start gap-3 group/profile hover:opacity-90 transition-opacity"
        >
          <Avatar name={t.name} size={56} style="micah" className="rounded-2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold truncate">{t.name}</p>
              <Award className="h-3.5 w-3.5 text-[hsl(var(--gold))] shrink-0" />
              {t.gender && (
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    t.gender === "MALE"
                      ? "bg-sky-500/10 text-sky-600"
                      : "bg-pink-500/10 text-pink-600"
                  }`}
                >
                  {t.gender === "MALE" ? "♂ Male" : "♀ Female"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.email}</p>
            {t.country && <p className="text-[11px] text-muted-foreground">{t.country}</p>}
          </div>
        </Link>

        {/* Shift selector */}
        <div className="mt-3">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">Shift</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSetShift(t.id, t.shift === "DAY" ? null : "DAY")}
              className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                t.shift === "DAY"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600"
                  : "border-border bg-background text-muted-foreground hover:border-amber-500/40"
              }`}
            >
              ☀️ Day (1-9 PM)
            </button>
            <button
              onClick={() => handleSetShift(t.id, t.shift === "NIGHT" ? null : "NIGHT")}
              className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                t.shift === "NIGHT"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                  : "border-border bg-background text-muted-foreground hover:border-indigo-500/40"
              }`}
            >
              🌙 Night (9-4 AM)
            </button>
          </div>
        </div>

        {/* Gender selector */}
        <div className="mt-3">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">Category</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSetGender(t.id, t.gender === "MALE" ? null : "MALE")}
              className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                t.gender === "MALE"
                  ? "border-sky-500 bg-sky-500/10 text-sky-600"
                  : "border-border bg-background text-muted-foreground hover:border-sky-500/40"
              }`}
            >
              ♂ Male
            </button>
            <button
              onClick={() => handleSetGender(t.id, t.gender === "FEMALE" ? null : "FEMALE")}
              className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${
                t.gender === "FEMALE"
                  ? "border-pink-500 bg-pink-500/10 text-pink-600"
                  : "border-border bg-background text-muted-foreground hover:border-pink-500/40"
              }`}
            >
              ♀ Female
            </button>
          </div>
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
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Classes</p>
            <p className="text-base font-bold mt-0.5 inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {t.bookings.length}
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
            onClick={() => setAvailabilityOpenId(availabilityOpenId === t.id ? null : t.id)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition-all ${
              availabilityOpenId === t.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule ({t.bookings.length})
            {availabilityOpenId === t.id ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {availabilityOpenId === t.id && (
          <div className="mt-3 rounded-xl border border-border bg-background p-3 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Booked Classes ({t.bookings.length})
              </p>
              {t.bookings.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  No classes booked yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {t.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-lg bg-card border border-border px-2 py-1.5 text-[11px]"
                    >
                      <span className="font-bold text-primary">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][b.dayOfWeek]}
                      </span>
                      <span className="font-mono">{b.startTime} PKT</span>
                      <span className="text-muted-foreground truncate flex-1">
                        {b.student} · {b.course}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <a
                href="/app/admin/availability"
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-md hover:shadow-lg"
              >
                <Calendar className="h-3.5 w-3.5" />
                Schedule a class
              </a>
              <button
                onClick={() => setEditAvailabilityFor(t)}
                className="mt-1 w-full text-center text-[10px] text-muted-foreground hover:text-foreground underline"
              >
                Set teacher&apos;s available hours ({t.availability.length})
              </button>
            </div>
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
            onClick={() => setLoginFor(t)}
            title="View / share login credentials"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-border px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            <KeyRound className="h-3 w-3" />
            Login
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
  }

  function renderSection(label: string, list: Teacher[], badgeClass: string) {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>
            {label}
          </span>
          <span className="text-xs text-muted-foreground">
            {list.length} teacher{list.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((t, i) => renderCard(t, i))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
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
          <div className="inline-flex rounded-full border border-border bg-card p-0.5 shrink-0">
            {(["all", "MALE", "FEMALE"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  genderFilter === g
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g === "all" ? "All" : g === "MALE" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>
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
            {query || genderFilter !== "all"
              ? "No teachers match your filter"
              : "No teachers yet. Invite your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection("☀️ Day Teachers", dayTeachers, "bg-amber-500/10 text-amber-600")}
          {renderSection("🌙 Night Teachers", nightTeachers, "bg-indigo-500/10 text-indigo-500")}
          {renderSection("⚠️ Unassigned (no shift)", unassignedTeachers, "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]")}
        </div>
      )}

      {inviteOpen && (
        <InviteTeacherModal onClose={() => setInviteOpen(false)} onInvited={handleInvited} />
      )}
      {loginFor && (
        <LoginCredentialsModal
          target={{
            id: loginFor.id,
            name: loginFor.name,
            email: loginFor.email,
            phone: loginFor.phone,
            password: loginFor.loginPassword,
          }}
          onClose={() => setLoginFor(null)}
          onUpdated={(newPassword) => {
            setTeachers((prev) =>
              prev.map((x) => (x.id === loginFor.id ? { ...x, loginPassword: newPassword } : x))
            );
            setLoginFor((cur) => (cur ? { ...cur, loginPassword: newPassword } : cur));
          }}
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
      {editAvailabilityFor && (
        <EditAvailabilityModal
          teacher={editAvailabilityFor}
          onClose={() => setEditAvailabilityFor(null)}
          onSaved={() => {
            setEditAvailabilityFor(null);
            router.refresh();
          }}
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
  React.useLayoutEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    const html = document.documentElement;
    if (main) main.style.overflow = "hidden";
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "";
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

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

    const toAssign: string[] = [];
    const toUnassign: string[] = [];
    for (const c of allCourses) {
      const wasAssigned = c.assignedTeacherId === teacher.id;
      const isAssigned = selected.has(c.id);
      if (!wasAssigned && isAssigned) toAssign.push(c.id);
      if (wasAssigned && !isAssigned) toUnassign.push(c.id);
    }

    try {
      for (const id of toAssign) {
        const res = await fetch(`/api/courses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId: teacher.id }),
        });
        if (!res.ok) throw new Error("Failed to assign");
      }
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
                Select which courses{" "}
                <span className="font-semibold text-foreground">{teacher.name}</span> will teach
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
                  c.assignedTeacherId && c.assignedTeacherId !== teacher.id
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
                        <span className="text-[10px] uppercase font-semibold text-primary">{c.level}</span>
                        {otherTeacher && (
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <Users className="h-3 w-3" /> Currently: {otherTeacher}
                          </span>
                        )}
                        {!c.assignedTeacherId && (
                          <span className="text-[11px] text-[hsl(var(--gold))] font-semibold">Unassigned</span>
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

function InviteTeacherModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: (t: Teacher) => void;
}) {
  React.useLayoutEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    const html = document.documentElement;
    if (main) main.style.overflow = "hidden";
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "";
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [gender, setGender] = React.useState<"MALE" | "FEMALE" | null>(null);
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

    if (country || bio || gender) {
      await fetch(`/api/users/${data.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country || null, bio: bio || null, gender }),
      });
    }

    setLoading(false);
    onInvited({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: null,
      loginPassword: password,
      country: country || null,
      bio: bio || null,
      createdAt: new Date().toISOString(),
      timezone: "UTC",
      shift: null,
      gender,
      courses: [],
      availability: [],
      bookings: [],
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full Name *</label>
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email *</label>
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Pakistan"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Temporary Password *</label>
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender(gender === "MALE" ? null : "MALE")}
                className={`inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${
                  gender === "MALE"
                    ? "border-sky-500 bg-sky-500/10 text-sky-600"
                    : "border-border bg-background text-muted-foreground hover:border-sky-500/40"
                }`}
              >
                ♂ Male Teacher
              </button>
              <button
                type="button"
                onClick={() => setGender(gender === "FEMALE" ? null : "FEMALE")}
                className={`inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${
                  gender === "FEMALE"
                    ? "border-pink-500 bg-pink-500/10 text-pink-600"
                    : "border-border bg-background text-muted-foreground hover:border-pink-500/40"
                }`}
              >
                ♀ Female Teacher
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Bio (optional)</label>
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

function EditAvailabilityModal({
  teacher,
  onClose,
  onSaved,
}: {
  teacher: Teacher;
  onClose: () => void;
  onSaved: () => void;
}) {
  React.useLayoutEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    const html = document.documentElement;
    if (main) main.style.overflow = "hidden";
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "";
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl my-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
            <div>
              <h2 className="text-base font-bold">Set Teacher Availability</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hours <span className="font-semibold text-foreground">{teacher.name}</span> is
                available for classes (teacher&apos;s local time)
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <AvailabilityEditor
              saveUrl={`/api/users/${teacher.id}/availability`}
              initialTimezone={teacher.timezone}
              initialSlots={teacher.availability}
              title={`${teacher.name}'s availability`}
              description="Set the weekly hours this teacher is available for classes"
              onSaved={onSaved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
