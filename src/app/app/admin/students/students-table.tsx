"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Mail,
  GraduationCap,
  Loader2,
  KeyRound,
  X,
  BookOpen,
  Clock,
  Filter,
  FileText,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Pencil,
  Plus,
  Ban,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import {
  LoginCredentialsModal,
  useLockPageScroll,
  type LoginTarget,
} from "@/components/admin/login-credentials-modal";

type CourseEnrollment = {
  id: string;
  name: string;
  duration: string | null;
  teacherId: string | null;
  teacherName: string | null;
};

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  loginPassword: string | null;
  suspended: boolean;
  createdAt: string;
  courses: CourseEnrollment[];
};

type CourseTeacher = { id: string; name: string; gender: "MALE" | "FEMALE" | null };
type CourseOption = { id: string; name: string; teachers: CourseTeacher[] };

type Prefill = {
  name: string;
  email: string;
  phone: string;
  country: string;
  courseId: string;
  courseName: string; // course requested on the website; may not exist in the LMS yet
  requestId: string; // enrollment request being converted; it leaves Enroll Requests / Free Trials
} | null;

// Select value for a requested course that isn't in the LMS; the API creates it on save.
const NEW_COURSE = "__new__";

export function StudentsTable({
  initialStudents,
  allCourses,
  prefill = null,
}: {
  initialStudents: Student[];
  allCourses: CourseOption[];
  prefill?: Prefill;
}) {
  const router = useRouter();
  const [students, setStudents] = React.useState(initialStudents);
  const [query, setQuery] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState<string>("all"); // "all" | courseId | "none"
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [suspending, setSuspending] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState<boolean>(!!prefill);
  const [loginTarget, setLoginTarget] = React.useState<LoginTarget | null>(null);
  const [editTarget, setEditTarget] = React.useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.country?.toLowerCase().includes(q) ?? false);

    const matchesCourse =
      courseFilter === "all" ||
      (courseFilter === "none" && s.courses.length === 0) ||
      s.courses.some((c) => c.id === courseFilter);

    return matchesQuery && matchesCourse;
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

  async function handleSuspend(s: Student, suspend: boolean) {
    if (
      suspend &&
      !confirm(`Suspend ${s.name}'s account? They will be signed out and can't log in until you reactivate it.`)
    )
      return;
    setSuspending(s.id);
    const res = await fetch(`/api/admin/students/${s.id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspend }),
    });
    setSuspending(null);
    if (res.ok) {
      setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...x, suspended: suspend } : x)));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? (suspend ? "Could not suspend" : "Could not reactivate"));
    }
  }

  const selectedCourseName =
    courseFilter === "all"
      ? null
      : courseFilter === "none"
      ? "Not Enrolled"
      : allCourses.find((c) => c.id === courseFilter)?.name ?? null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <label className="text-xs font-semibold text-muted-foreground">
            Filter by Course:
          </label>
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="flex-1 sm:flex-initial min-w-[200px] rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Courses ({students.length})</option>
          <option value="none">
            Not Enrolled ({students.filter((s) => s.courses.length === 0).length})
          </option>
          <optgroup label="Courses">
            {allCourses.map((c) => {
              const count = students.filter((s) =>
                s.courses.some((sc) => sc.id === c.id)
              ).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count})
                </option>
              );
            })}
          </optgroup>
        </select>

        <div className="flex-1" />

        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, country..."
            className="w-full sm:w-72 rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {selectedCourseName && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between">
          <p className="text-xs text-foreground inline-flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Showing students enrolled in{" "}
            <span className="font-bold text-primary">{selectedCourseName}</span>
          </p>
          <button
            onClick={() => setCourseFilter("all")}
            className="text-xs font-semibold text-primary hover:text-accent inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear filter
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            {query || courseFilter !== "all"
              ? "No students match your filter"
              : "No students yet"}
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
                  <th className="px-6 py-4 font-semibold">Duration</th>
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
                      <Link
                        href={`/app/admin/students/${s.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar name={s.name} size={36} style="micah" />
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground">{s.email}</p>
                          {s.suspended && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                              <Ban className="h-2.5 w-2.5" /> Suspended
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {s.courses.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">
                          Not enrolled
                        </span>
                      ) : (
                        <div className="space-y-1.5">
                          {s.courses.map((c) => (
                            <div key={c.id} className="h-6 flex items-center">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                {c.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {s.courses.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="space-y-1.5">
                          {s.courses.map((c) => (
                            <div
                              key={c.id}
                              className="h-6 flex items-center gap-1 text-xs text-foreground"
                            >
                              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                              {c.duration ?? "Self-paced"}
                            </div>
                          ))}
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
                        <Link
                          href={`/app/admin/students/${s.id}`}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary/10 hover:text-primary"
                          title="View progress report"
                        >
                          <FileText className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                        </Link>
                        <a
                          href={`mailto:${s.email}`}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                          title="Email"
                        >
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                        <button
                          onClick={() => setEditTarget(s)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary/10 hover:text-primary"
                          title="Edit student"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setLoginTarget({
                              id: s.id,
                              name: s.name,
                              email: s.email,
                              phone: s.phone,
                              password: s.loginPassword,
                            })
                          }
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary/10 hover:text-primary"
                          title="View / share login credentials"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        {s.suspended ? (
                          <button
                            onClick={() => handleSuspend(s, false)}
                            disabled={suspending === s.id}
                            className="grid h-8 w-8 place-items-center rounded-full text-[hsl(var(--primary))] hover:bg-primary/10 disabled:opacity-50"
                            title="Reactivate account"
                          >
                            {suspending === s.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(s, true)}
                            disabled={suspending === s.id}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            title="Suspend account"
                          >
                            {suspending === s.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
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
              {(query || courseFilter !== "all") && " (filtered)"}
            </p>
          </div>
        </div>
      )}

      {addOpen && (
        <AddStudentModal
          allCourses={allCourses}
          prefill={prefill}
          onClose={() => setAddOpen(false)}
          onCreated={(student, password, course) => {
            setStudents((prev) => [
              {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                country: student.country,
                loginPassword: password,
                suspended: false,
                createdAt: new Date().toISOString(),
                courses: course ? [course] : [],
              },
              ...prev,
            ]);
            setAddOpen(false);
            setLoginTarget({
              id: student.id,
              name: student.name,
              email: student.email,
              phone: student.phone,
              password,
            });
            router.refresh();
          }}
        />
      )}

      {editTarget && (
        <EditStudentModal
          student={editTarget}
          allCourses={allCourses}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setEditTarget(null);
            router.refresh();
          }}
        />
      )}

      {loginTarget && (
        <LoginCredentialsModal
          target={loginTarget}
          onClose={() => setLoginTarget(null)}
          onUpdated={(newPw) => {
            setLoginTarget((cur) => (cur ? { ...cur, password: newPw } : cur));
            setStudents((prev) =>
              prev.map((s) =>
                s.id === loginTarget.id ? { ...s, loginPassword: newPw } : s
              )
            );
          }}
        />
      )}
    </div>
  );
}


function genPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function AddStudentModal({
  allCourses,
  prefill,
  onClose,
  onCreated,
}: {
  allCourses: CourseOption[];
  prefill: Prefill;
  onClose: () => void;
  onCreated: (
    student: { id: string; name: string; email: string; phone: string | null; country: string | null },
    password: string,
    course: CourseEnrollment | null
  ) => void;
}) {
  useLockPageScroll();

  const [name, setName] = React.useState(prefill?.name ?? "");
  const [email, setEmail] = React.useState(prefill?.email ?? "");
  const [phone, setPhone] = React.useState(prefill?.phone ?? "");
  const [country, setCountry] = React.useState(prefill?.country ?? "");
  const newCourseName = prefill && !prefill.courseId && prefill.courseName ? prefill.courseName : null;
  const [courseId, setCourseId] = React.useState(
    prefill?.courseId || (newCourseName ? NEW_COURSE : "")
  );
  const [teacherId, setTeacherId] = React.useState("");
  const [password, setPassword] = React.useState(() => genPassword(10));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedCourse = React.useMemo(
    () => allCourses.find((c) => c.id === courseId) ?? null,
    [allCourses, courseId]
  );
  const courseTeachers = selectedCourse?.teachers ?? [];

  // Reset teacher when course changes (the picked teacher may not belong to the new course)
  React.useEffect(() => {
    if (!courseTeachers.some((t) => t.id === teacherId)) setTeacherId("");
  }, [courseTeachers, teacherId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || undefined,
        country: country || undefined,
        courseId: courseId && courseId !== NEW_COURSE ? courseId : undefined,
        courseName: courseId === NEW_COURSE ? newCourseName : undefined,
        requestId: prefill?.requestId || undefined,
        teacherId: teacherId || undefined,
        password,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to add student");
      return;
    }
    onCreated(data.student, data.password, data.course ?? null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-bold">Add Student</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create the account, then share the login with the student
            </p>
          </div>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Full Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hina Ahmed"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Email *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@email.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                WhatsApp / Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
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
                placeholder="United Kingdom"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Enroll in course {prefill?.courseId || newCourseName ? "(from website)" : "(optional)"}
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">No course yet</option>
                {newCourseName && (
                  <option value={NEW_COURSE}>{newCourseName} (new course)</option>
                )}
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Assign teacher{courseId ? "" : " (pick a course first)"}
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={!courseId || courseTeachers.length === 0}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              >
                <option value="">
                  {!courseId
                    ? "—"
                    : courseTeachers.length === 0
                    ? "No teachers on this course"
                    : "Pick a teacher"}
                </option>
                {courseTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.gender ? ` (${t.gender === "MALE" ? "♂" : "♀"})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {courseId && courseTeachers.length === 0 && (
            <p className="text-[11px] text-[hsl(var(--gold))]">
              ⚠ This course has no teachers assigned. Assign teachers in the Courses tab first.
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Login Password *
            </label>
            <div className="flex items-center gap-2">
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setPassword(genPassword(10))}
                title="Generate new password"
                className="grid h-10 w-10 place-items-center rounded-xl border border-border hover:bg-muted shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Auto-generated. You can edit it. Min 8 characters.
            </p>
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
              Create & Get Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditStudentModal({
  student,
  allCourses,
  onClose,
  onSaved,
}: {
  student: Student;
  allCourses: CourseOption[];
  onClose: () => void;
  onSaved: (student: Student) => void;
}) {
  useLockPageScroll();

  const [name, setName] = React.useState(student.name);
  const [email, setEmail] = React.useState(student.email);
  const [phone, setPhone] = React.useState(student.phone ?? "");
  const [country, setCountry] = React.useState(student.country ?? "");
  const [rows, setRows] = React.useState(() =>
    student.courses.map((c) => ({ courseId: c.id, teacherId: c.teacherId ?? "" }))
  );
  const [addCourseId, setAddCourseId] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const courseById = new Map(allCourses.map((c) => [c.id, c]));
  const current = (courseId: string) => student.courses.find((c) => c.id === courseId);
  const courseName = (courseId: string) =>
    courseById.get(courseId)?.name ?? current(courseId)?.name ?? "Course";
  const addable = allCourses.filter((c) => !rows.some((r) => r.courseId === c.id));

  function setTeacher(courseId: string, teacherId: string) {
    setRows((prev) => prev.map((r) => (r.courseId === courseId ? { ...r, teacherId } : r)));
  }

  function addCourse() {
    if (!addCourseId) return;
    setRows((prev) => [...prev, { courseId: addCourseId, teacherId: "" }]);
    setAddCourseId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const removed = student.courses.filter((c) => !rows.some((r) => r.courseId === c.id));
    if (
      removed.length > 0 &&
      !confirm(
        `Remove ${removed.map((c) => c.name).join(", ")} from ${student.name}? ` +
          `Their class schedule and attendance for ${removed.length === 1 ? "this course" : "these courses"} will be deleted.`
      )
    )
      return;

    setError(null);
    setSaving(true);
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        country,
        enrollments: rows.map((r) => ({ courseId: r.courseId, teacherId: r.teacherId || null })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to save changes");
      return;
    }
    onSaved(data.student);
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-bold">Edit Student</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update details and courses. Use the key button to change the password.
            </p>
          </div>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>WhatsApp / Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Courses</label>
            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                Not enrolled in any course
              </p>
            ) : (
              <div className="space-y-2">
                {rows.map((r) => {
                  const teachers = courseById.get(r.courseId)?.teachers ?? [];
                  const keepCurrent =
                    r.teacherId && !teachers.some((t) => t.id === r.teacherId)
                      ? { id: r.teacherId, name: current(r.courseId)?.teacherName ?? "Current teacher" }
                      : null;
                  const options = keepCurrent ? [keepCurrent, ...teachers] : teachers;
                  return (
                    <div
                      key={r.courseId}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 min-w-0 truncate text-sm font-semibold">
                        {courseName(r.courseId)}
                      </span>
                      <select
                        value={r.teacherId}
                        onChange={(e) => setTeacher(r.courseId, e.target.value)}
                        disabled={options.length === 0}
                        aria-label={`Teacher for ${courseName(r.courseId)}`}
                        className="w-40 rounded-lg border border-border bg-card px-2 py-1.5 text-xs focus:border-primary focus:outline-none disabled:opacity-60"
                      >
                        <option value="">{options.length === 0 ? "No teachers" : "No teacher yet"}</option>
                        {options.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setRows((prev) => prev.filter((x) => x.courseId !== r.courseId))}
                        title={`Remove ${courseName(r.courseId)}`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {addable.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={addCourseId}
                  onChange={(e) => setAddCourseId(e.target.value)}
                  aria-label="Add a course"
                  className={inputCls}
                >
                  <option value="">Add a course…</option>
                  {addable.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCourse}
                  disabled={!addCourseId}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            )}
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
