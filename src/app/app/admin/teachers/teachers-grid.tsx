"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserX,
  Mail,
  MapPin,
  Sun,
  Moon,
  CalendarDays,
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
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { AvailabilityDialog } from "@/components/availability/availability-editor";
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
  // their own uploaded photo, if any
  image: string | null;
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

// "Sep 2026", in Pakistan time so the server and the browser agree
function joined(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short",
    year: "numeric",
  });
}

// A two-way switch (shift, category) under its label. Tapping the chosen
// side again clears it, as the old toggle buttons did.
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string; hint?: string; icon: React.ReactNode }[];
  onChange: (value: T | null) => void;
}) {
  return (
    <div>
      {/* a span, not a p: the glass cards turn an uppercase p into an eyebrow */}
      <span className="mb-[6px] block text-[10px] font-bold uppercase leading-[14px] tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <div className="adm-seg grid grid-cols-2 gap-[2px] rounded-full border-[1px] border-border bg-muted/60 p-[3px]">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : o.value)}
              className={`inline-flex min-w-0 items-center justify-center gap-[6px] whitespace-nowrap rounded-full px-[8px] py-[6px] text-[12px] font-semibold leading-[16px] transition-all ${
                active
                  ? "adm-badge bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {o.icon}
              {o.label}
              {o.hint && <span className="font-medium opacity-[0.7]">{o.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
    const scheduleOpen = availabilityOpenId === t.id;
    return (
      <div
        key={t.id}
        className="adm-glass group flex flex-col overflow-hidden rounded-2xl border-[1px] border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 stagger-item"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        {/* Banner in the brand gradient, as on the teacher's own page */}
        <div className="adm-cover relative h-[76px] shrink-0 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary">
          <span className="absolute right-[12px] top-[12px] z-[1] inline-flex items-center gap-[6px] rounded-full bg-white/15 px-[10px] py-[4px] text-[11px] font-semibold leading-[14px] text-white ring-1 ring-white/25 backdrop-blur-sm">
            <CalendarDays className="h-3 w-3" /> Joined {joined(t.createdAt)}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-[20px] pb-[20px]">
          {/* Photo across the banner's edge, the quick actions beside it */}
          <div className="flex items-end justify-between gap-[12px]">
            <Link
              href={`/app/admin/teachers/${t.id}`}
              aria-label={`Open ${t.name}'s profile`}
              className="relative z-[1] -mt-[34px] block shrink-0"
            >
              <Avatar
                name={t.name}
                src={t.image}
                size={68}
                className="border-4 border-card shadow-[0_10px_24px_-10px_rgb(0_0_0/0.45)]"
              />
            </Link>
            <div className="inline-flex items-center gap-[2px] rounded-full border-[1px] border-border bg-background/70 p-[3px] text-muted-foreground">
              <a
                href={`mailto:${t.email}`}
                className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
                title="Email"
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => setLoginFor(t)}
                className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
                title="View / share login credentials"
                aria-label="View / share login credentials"
              >
                <KeyRound className="h-3.5 w-3.5" />
              </button>
              <span aria-hidden="true" className="mx-[3px] h-4 w-px bg-border" />
              <button
                onClick={() => handleDelete(t.id, t.name)}
                disabled={deleting === t.id}
                className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                title="Remove teacher"
                aria-label="Remove teacher"
              >
                {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Sizes written out: Bootstrap's .text-sm/.text-xs have no line height */}
          <Link href={`/app/admin/teachers/${t.id}`} className="group/name mt-[12px] block min-w-0">
            <p className="truncate text-[16px] font-bold leading-[22px] transition-opacity group-hover/name:opacity-80">
              {t.name}
            </p>
          </Link>
          <div className="mt-[4px] space-y-[2px] text-[12.5px] leading-[19px] text-muted-foreground">
            <p className="flex min-w-0 items-center gap-[6px]">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.email}</span>
            </p>
            {t.country && (
              <p className="flex min-w-0 items-center gap-[6px]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.country}</span>
              </p>
            )}
          </div>

          <div className="adm-tile mt-[16px] grid grid-cols-3 divide-x divide-border rounded-xl border-[1px] border-border bg-background/60">
            {[
              { icon: BookOpen, label: "Courses", value: t.courses.length },
              { icon: Users, label: "Students", value: totalStudents },
              { icon: Calendar, label: "Classes", value: t.bookings.length },
            ].map((s) => (
              <div key={s.label} className="px-[6px] py-[10px] text-center">
                <p className="text-[18px] font-bold leading-[24px]">{s.value}</p>
                <span className="mt-[2px] inline-flex items-center gap-[4px] text-[11px] font-medium leading-[14px] text-muted-foreground">
                  <s.icon className="h-3 w-3" /> {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Always two lines tall, so every card's switches line up */}
          <p className="mt-[12px] line-clamp-2 min-h-[38px] text-[12.5px] leading-[19px] text-muted-foreground">
            {t.bio || <span className="italic opacity-[0.7]">No bio added yet.</span>}
          </p>

          <div className="mt-[16px] space-y-[12px]">
            <Segmented
              label="Shift"
              value={t.shift}
              onChange={(v) => handleSetShift(t.id, v)}
              options={[
                { value: "DAY", label: "Day", hint: "1–9 PM", icon: <Sun className="h-3.5 w-3.5" /> },
                { value: "NIGHT", label: "Night", hint: "9–4 AM", icon: <Moon className="h-3.5 w-3.5" /> },
              ]}
            />
            <Segmented
              label="Category"
              value={t.gender}
              onChange={(v) => handleSetGender(t.id, v)}
              options={[
                { value: "MALE", label: "Male", icon: <span aria-hidden="true">♂</span> },
                { value: "FEMALE", label: "Female", icon: <span aria-hidden="true">♀</span> },
              ]}
            />
          </div>

          {/* mt-auto: the buttons line up along the bottom of a row of cards */}
          <div className="mt-auto grid grid-cols-2 gap-[8px] pt-[18px]">
            <button
              onClick={() => setAssignTarget(t)}
              className="inline-flex items-center justify-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[12px] py-[9px] text-[12.5px] font-bold leading-[16px] text-primary-foreground shadow-md transition-shadow hover:shadow-lg"
            >
              <GraduationCap className="h-4 w-4" /> Assign courses
            </button>
            <button
              onClick={() => setAvailabilityOpenId(scheduleOpen ? null : t.id)}
              aria-expanded={scheduleOpen}
              className={`inline-flex items-center justify-center gap-[6px] rounded-full border-[1px] px-[12px] py-[9px] text-[12.5px] font-bold leading-[16px] transition-all ${
                scheduleOpen
                  ? "border-[hsl(var(--primary))] bg-primary/10 text-primary"
                  : "border-border bg-background/70 text-foreground hover:border-primary/40"
              }`}
            >
              <Calendar className="h-4 w-4" /> Schedule
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${scheduleOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {scheduleOpen && (
            <div className="adm-tile mt-[12px] rounded-xl border-[1px] border-border bg-background p-[12px]">
              <p className="mb-[8px] text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Booked Classes ({t.bookings.length})
              </p>
              {t.bookings.length === 0 ? (
                <p className="text-[12px] italic leading-[18px] text-muted-foreground">No classes booked yet.</p>
              ) : (
                <div className="space-y-[4px]">
                  {t.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-[8px] rounded-lg border-[1px] border-border bg-card px-[8px] py-[6px] text-[11px] leading-[16px]"
                    >
                      <span className="font-bold text-primary">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][b.dayOfWeek]}
                      </span>
                      <span className="font-mono">{b.startTime} PKT</span>
                      <span className="flex-1 truncate text-muted-foreground">
                        {b.student} · {b.course}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <a
                href="/app/admin/availability"
                className="mt-[8px] inline-flex w-full items-center justify-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[12px] py-[7px] text-[12px] font-bold leading-[16px] text-primary-foreground shadow-md hover:shadow-lg"
              >
                <Calendar className="h-3.5 w-3.5" />
                Schedule a class
              </a>
              <button
                onClick={() => setEditAvailabilityFor(t)}
                className="mt-[6px] w-full text-center text-[11px] leading-[16px] text-muted-foreground underline hover:text-foreground"
              >
                Set teacher&apos;s available hours ({t.availability.length})
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // A shift's heading: a glass pill (it sits straight on the background
  // video) with the icon, name and count, then a line fading out
  function renderSection(label: string, icon: React.ReactNode, list: Teacher[]) {
    if (list.length === 0) return null;
    return (
      <div className="space-y-[14px]">
        <div className="flex items-center gap-[12px]">
          <div className="adm-glass inline-flex items-center gap-[10px] rounded-full border-[1px] border-border bg-card py-[5px] pl-[5px] pr-[12px]">
            <span className="adm-icon grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              {icon}
            </span>
            <h3 className="text-[14px] font-bold leading-[20px]">{label}</h3>
            <span className="rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-bold leading-[16px] text-primary">
              {list.length}
            </span>
          </div>
          <div aria-hidden="true" className="adm-fade-line h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
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
          {renderSection("Day Teachers", <Sun className="h-3.5 w-3.5" />, dayTeachers)}
          {renderSection("Night Teachers", <Moon className="h-3.5 w-3.5" />, nightTeachers)}
          {renderSection("No shift yet", <AlertCircle className="h-3.5 w-3.5" />, unassignedTeachers)}
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
      {/* adm-modal: white rows in the light admin (globals.css) */}
      <div className="adm-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <Avatar name={teacher.name} src={teacher.image} size={40} />
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
                    <div className="adm-icon grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary shrink-0">
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
      image: null,
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
      {/* adm-modal: white fields in the light admin (globals.css) */}
      <div className="adm-modal w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
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
  return (
    <AvailabilityDialog
      title="Teacher's available hours"
      subtitle={teacher.name}
      onClose={onClose}
      saveUrl={`/api/users/${teacher.id}/availability`}
      initialTimezone={teacher.timezone}
      initialSlots={teacher.availability}
      description="The weekly hours this teacher is free to take classes, in their own time zone."
      onSaved={onSaved}
    />
  );
}
