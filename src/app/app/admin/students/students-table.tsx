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
  FileText,
  UserPlus,
  RefreshCw,
  Pencil,
  Plus,
  Ban,
  ShieldCheck,
  AlertTriangle,
  Save,
  RotateCcw,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FormSelect, type FormOption } from "@/components/admin/form-select";
import {
  AdminModal,
  MODAL_FIELD,
  MODAL_LABEL,
  ModalError,
  ModalSecondary,
  ModalSubmit,
} from "@/components/admin/modal-frame";
import {
  LoginCredentialsModal,
  useLockPageScroll,
  type LoginTarget,
} from "@/components/admin/login-credentials-modal";
import {
  ActiveStudentFilters,
  NO_FILTERS,
  StudentsFilterMenu,
  activeFilterCount,
  localDateKey,
  type FilterOption,
  type StudentFilters,
} from "./students-filter";

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
  const [filters, setFilters] = React.useState<StudentFilters>(NO_FILTERS);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [suspending, setSuspending] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState<boolean>(!!prefill);
  const [loginTarget, setLoginTarget] = React.useState<LoginTarget | null>(null);
  const [editTarget, setEditTarget] = React.useState<Student | null>(null);

  // Teachers on any active course plus anyone currently teaching an enrolled student
  const teacherOptions = React.useMemo(() => {
    const map = new Map<string, FilterOption>();
    for (const c of allCourses) {
      for (const t of c.teachers) {
        if (!map.has(t.id)) map.set(t.id, { id: t.id, name: t.name, count: 0 });
      }
    }
    for (const s of students) {
      const ids = new Set<string>();
      for (const c of s.courses) {
        if (!c.teacherId) continue;
        ids.add(c.teacherId);
        if (!map.has(c.teacherId)) {
          map.set(c.teacherId, { id: c.teacherId, name: c.teacherName ?? "Teacher", count: 0 });
        }
      }
      ids.forEach((id) => map.get(id)!.count++);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allCourses, students]);

  const courseOptions = React.useMemo<FilterOption[]>(() => {
    const names = new Map(allCourses.map((c) => [c.id, c.name]));
    // Students can still be enrolled in a course that has since been deactivated
    for (const s of students) {
      for (const c of s.courses) if (!names.has(c.id)) names.set(c.id, c.name);
    }
    return Array.from(names, ([id, name]) => ({
      id,
      name,
      count: students.filter((s) => s.courses.some((sc) => sc.id === id)).length,
    }));
  }, [allCourses, students]);

  const filterCounts = React.useMemo(
    () => ({
      total: students.length,
      notEnrolled: students.filter((s) => s.courses.length === 0).length,
      unassigned: students.filter((s) => s.courses.some((c) => !c.teacherId)).length,
    }),
    [students]
  );

  const filtersActive = activeFilterCount(filters) > 0;

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.country?.toLowerCase().includes(q) ?? false);

    // Teacher and course are checked against the same enrollment, so
    // "Course A + Teacher X" means X teaches this student in A.
    const matchesEnrollment =
      filters.course === "none"
        ? s.courses.length === 0 && filters.teacher === "all"
        : (filters.course === "all" && filters.teacher === "all") ||
          s.courses.some(
            (c) =>
              (filters.course === "all" || c.id === filters.course) &&
              (filters.teacher === "all" ||
                (filters.teacher === "none" ? !c.teacherId : c.teacherId === filters.teacher))
          );

    const joined = filters.from || filters.to ? localDateKey(s.createdAt) : "";
    const matchesDate =
      (!filters.from || joined >= filters.from) && (!filters.to || joined <= filters.to);

    return matchesQuery && matchesEnrollment && matchesDate;
  });

  // The Delete / Suspend pop-up (ConfirmDialog, not the browser's confirm):
  // which student it asks about, and how the request is going. Reactivating
  // asks nothing; the pop-up opens only if it fails, to show why and retry.
  const [confirmAction, setConfirmAction] = React.useState<{
    kind: "delete" | "suspend" | "reactivate";
    student: Student;
  } | null>(null);
  const [actionBusy, setActionBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function ask(kind: "delete" | "suspend", s: Student) {
    setActionError(null);
    setConfirmAction({ kind, student: s });
  }

  async function handleDelete(s: Student) {
    setDeleting(s.id);
    setActionBusy(true);
    setActionError(null);
    const res = await fetch(`/api/users/${s.id}`, { method: "DELETE" }).catch(() => null);
    setDeleting(null);
    setActionBusy(false);
    if (res?.ok) {
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
      setConfirmAction(null);
      router.refresh();
    } else {
      const data = (await res?.json().catch(() => ({}))) ?? {};
      setActionError(data.error ?? "Couldn't delete this student. Try again in a moment.");
    }
  }

  async function handleSuspend(s: Student, suspend: boolean) {
    setSuspending(s.id);
    setActionBusy(true);
    setActionError(null);
    const res = await fetch(`/api/admin/students/${s.id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspend }),
    }).catch(() => null);
    setSuspending(null);
    setActionBusy(false);
    if (res?.ok) {
      setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...x, suspended: suspend } : x)));
      setConfirmAction(null);
      router.refresh();
    } else {
      const data = (await res?.json().catch(() => ({}))) ?? {};
      setActionError(data.error ?? (suspend ? "Couldn't suspend this account." : "Couldn't reactivate this account."));
      setConfirmAction({ kind: suspend ? "suspend" : "reactivate", student: s });
    }
  }

  const joined = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Each course as a chip with its duration beside it
  const courseList = (s: Student) =>
    s.courses.length === 0 ? (
      <span className="text-xs italic text-muted-foreground">Not enrolled</span>
    ) : (
      <div className="flex flex-col items-start gap-[6px]">
        {s.courses.map((c) => (
          <div key={c.id} className="flex items-center gap-[8px]">
            <span className="whitespace-nowrap rounded-full bg-primary/10 px-[10px] py-[2px] text-[11px] font-semibold text-primary">
              {c.name}
            </span>
            <span className="inline-flex items-center gap-[4px] whitespace-nowrap text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              {c.duration ?? "Self-paced"}
            </span>
          </div>
        ))}
      </div>
    );

  // The row's actions as one group; suspend and delete after a divider, red on hover
  const actions = (s: Student) => (
    <div className="inline-flex items-center gap-[2px] rounded-full border-[1px] border-border bg-background/70 p-[3px] text-muted-foreground">
      <Link
        href={`/app/admin/students/${s.id}`}
        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
        title="View progress report"
        aria-label="View progress report"
      >
        <FileText className="h-3.5 w-3.5" />
      </Link>
      <a
        href={`mailto:${s.email}`}
        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
        title="Email"
        aria-label="Email"
      >
        <Mail className="h-3.5 w-3.5" />
      </a>
      <button
        onClick={() => setEditTarget(s)}
        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
        title="Edit student"
        aria-label="Edit student"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() =>
          setLoginTarget({ id: s.id, name: s.name, email: s.email, phone: s.phone, password: s.loginPassword })
        }
        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
        title="View / share login credentials"
        aria-label="View / share login credentials"
      >
        <KeyRound className="h-3.5 w-3.5" />
      </button>
      <span aria-hidden="true" className="mx-[3px] h-4 w-px bg-border" />
      {s.suspended ? (
        <button
          onClick={() => handleSuspend(s, false)}
          disabled={suspending === s.id}
          className="grid h-7 w-7 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          title="Reactivate account"
          aria-label="Reactivate account"
        >
          {suspending === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        </button>
      ) : (
        <button
          onClick={() => ask("suspend", s)}
          disabled={suspending === s.id}
          className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          title="Suspend account"
          aria-label="Suspend account"
        >
          {suspending === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
        </button>
      )}
      <button
        onClick={() => ask("delete", s)}
        disabled={deleting === s.id}
        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        title="Delete student"
        aria-label="Delete student"
      >
        {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  // Name, email and the suspended badge, linking to the student's page
  const identity = (s: Student) => (
    <Link href={`/app/admin/students/${s.id}`} className="group flex min-w-0 items-center gap-[12px]">
      <Avatar name={s.name} size={36} style="micah" />
      <div className="min-w-0">
        {/* Sizes written out: the website's Bootstrap sheet makes .text-sm and
            .text-xs 16px and 15px but keeps Tailwind's tighter line height, so
            `truncate` (overflow hidden) cut off the bottoms of g, p and @ */}
        <p className="truncate text-[15px] font-semibold leading-[22px] transition-colors group-hover:text-primary">
          {s.name}
        </p>
        <p className="truncate text-[13px] leading-[19px] text-muted-foreground">{s.email}</p>
        {s.suspended && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
            <Ban className="h-2.5 w-2.5" /> Suspended
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <div className="space-y-4">
      {/* One card: the toolbar on top, then the table and a footer with the
          count. `adm-glass` makes it the dashboard's glass card in light mode.
          Gaps and borders are written out ([12px], [1px]) because the
          website's Bootstrap sheet overrides .gap-3 and .border. No
          overflow-hidden: the Filter menu opens below the toolbar and runs
          past the card's bottom when there are few rows. */}
      <div className="adm-glass rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-[12px] border-b border-border px-[16px] py-[14px] sm:px-[20px]">
          <div className="mr-auto min-w-0">
            <h2 className="text-sm font-bold">All students</h2>
            <p className="text-[11px] text-muted-foreground">
              {students.length} {students.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          {/* Phones: one row, with Add as an icon so all three fit */}
          <div className="flex w-full items-center gap-[8px] sm:w-auto">
            <StudentsFilterMenu
              value={filters}
              onChange={setFilters}
              teachers={teacherOptions}
              courses={courseOptions}
              counts={filterCounts}
            />
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, country"
                className="w-full rounded-full border-[1px] border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => setAddOpen(true)}
              aria-label="Add student"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-[12px] py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg sm:px-4"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Student</span>
            </button>
          </div>
        </div>

        {filtersActive && (
          <div className="border-b border-border px-[16px] py-[12px] sm:px-[20px]">
            <ActiveStudentFilters
              value={filters}
              onChange={setFilters}
              teachers={teacherOptions}
              courses={courseOptions}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {query || filtersActive ? "No students match your filter" : "No students yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Tablets and up: a table. `adm-rows` gives the rows a little
                more white than the glass card in light mode, so the data
                reads clearly over the background video. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    <th className="px-[20px] py-[12px] font-semibold">Student</th>
                    <th className="px-[20px] py-[12px] font-semibold">Courses</th>
                    <th className="px-[20px] py-[12px] font-semibold">Country</th>
                    <th className="px-[20px] py-[12px] font-semibold">Joined</th>
                    <th className="px-[20px] py-[12px] text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="adm-rows divide-y divide-border">
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className="stagger-item align-middle transition-colors hover:bg-muted/30"
                      style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                    >
                      <td className="px-[20px] py-[14px]">{identity(s)}</td>
                      <td className="px-[20px] py-[14px]">{courseList(s)}</td>
                      <td className="px-[20px] py-[14px] text-sm">
                        {s.country ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-[20px] py-[14px] text-sm tabular-nums text-muted-foreground">
                        {joined(s.createdAt)}
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="flex justify-end">{actions(s)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phones: one block per student instead of a sideways-scrolling table */}
            <ul className="adm-rows divide-y divide-border md:hidden">
              {filtered.map((s) => (
                <li key={s.id} className="space-y-[10px] px-[16px] py-[14px]">
                  {identity(s)}
                  {courseList(s)}
                  <div className="flex flex-wrap items-center justify-between gap-[8px]">
                    <p className="text-xs text-muted-foreground">
                      {s.country ?? "—"} · Joined {joined(s.createdAt)}
                    </p>
                    {actions(s)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-[16px] py-[12px] text-xs text-muted-foreground sm:px-[20px]">
              Showing {filtered.length} of {students.length} students
              {(query || filtersActive) && " (filtered)"}
            </div>
          </>
        )}
      </div>

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

      {/* Deleting a student deletes their enrollments too, and with them the
          weekly classes and attendance (onDelete: Cascade in the schema) */}
      {confirmAction?.kind === "delete" && (
        <ConfirmDialog
          title={`Delete ${confirmAction.student.name}?`}
          confirmLabel="Delete student"
          busy={actionBusy}
          error={actionError}
          onConfirm={() => handleDelete(confirmAction.student)}
          onCancel={() => setConfirmAction(null)}
        >
          <span className="font-semibold text-foreground">{confirmAction.student.name}</span>&apos;s account will be
          removed for good, with their enrollments, weekly classes and attendance. This can&apos;t be undone.
        </ConfirmDialog>
      )}
      {confirmAction?.kind === "suspend" && (
        <ConfirmDialog
          title={`Suspend ${confirmAction.student.name}?`}
          icon={Ban}
          confirmLabel="Suspend"
          busy={actionBusy}
          error={actionError}
          onConfirm={() => handleSuspend(confirmAction.student, true)}
          onCancel={() => setConfirmAction(null)}
        >
          They are signed out and can&apos;t log in until you reactivate the account. Nothing is deleted; their
          courses and classes stay as they are.
        </ConfirmDialog>
      )}
      {confirmAction?.kind === "reactivate" && (
        <ConfirmDialog
          title={`Reactivate ${confirmAction.student.name}?`}
          icon={ShieldCheck}
          tone="primary"
          confirmLabel="Try again"
          busy={actionBusy}
          error={actionError}
          onConfirm={() => handleSuspend(confirmAction.student, false)}
          onCancel={() => setConfirmAction(null)}
        >
          Once it goes through, they can log in again with their current password.
        </ConfirmDialog>
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

  const courseOptions: FormOption[] = [
    { value: "", label: "No course yet" },
    ...(newCourseName ? [{ value: NEW_COURSE, label: `${newCourseName} (new course)` }] : []),
    ...allCourses.map((c) => ({ value: c.id, label: c.name })),
  ];
  const teacherOptions: FormOption[] = [
    {
      value: "",
      label: !courseId ? "Pick a course first" : courseTeachers.length === 0 ? "No teachers on this course" : "Pick a teacher",
    },
    ...courseTeachers.map((t) => ({
      value: t.id,
      label: `${t.name}${t.gender ? ` (${t.gender === "MALE" ? "♂" : "♀"})` : ""}`,
    })),
  ];

  return (
    <AdminModal
      icon={UserPlus}
      title="Add student"
      sub="Create the account, then share the login with the student"
      onClose={onClose}
      onSubmit={handleSubmit}
      closeOnBackdrop={false}
      maxWidth="max-w-[560px]"
      footer={
        <ModalSubmit busy={loading} icon={UserPlus}>
          Create &amp; get login
        </ModalSubmit>
      }
    >
      {error && <ModalError>{error}</ModalError>}

      <div className="grid gap-[16px] sm:grid-cols-2">
        <TextField label="Full name" required value={name} onChange={setName} placeholder="e.g. Hina Ahmed" />
        <TextField
          label="Email"
          required
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="student@email.com"
        />
      </div>
      <div className="grid gap-[16px] sm:grid-cols-2">
        <TextField label="WhatsApp / Phone" value={phone} onChange={setPhone} placeholder="+44 7700 900000" />
        <TextField label="Country" value={country} onChange={setCountry} placeholder="United Kingdom" />
      </div>

      <div className="grid gap-[16px] sm:grid-cols-2">
        <div>
          <label htmlFor="add-student-course" className={MODAL_LABEL}>
            Enroll in course {prefill?.courseId || newCourseName ? "(from website)" : "(optional)"}
          </label>
          <FormSelect id="add-student-course" value={courseId} onChange={setCourseId} options={courseOptions} />
        </div>
        <div>
          <label htmlFor="add-student-teacher" className={MODAL_LABEL}>
            Assign teacher
          </label>
          <FormSelect
            id="add-student-teacher"
            value={teacherId}
            onChange={setTeacherId}
            options={teacherOptions}
            disabled={!courseId || courseTeachers.length === 0}
          />
        </div>
      </div>
      {courseId && courseTeachers.length === 0 && (
        <p className="flex items-start gap-[8px] rounded-xl bg-amber-500/10 px-[12px] py-[10px] text-[12.5px] leading-[18px] text-amber-700">
          <AlertTriangle className="mt-[1px] h-4 w-4 shrink-0" />
          This course has no teachers yet. Add them on the Courses page first.
        </p>
      )}

      <div>
        <label htmlFor="add-student-password" className={MODAL_LABEL}>
          Login password<span className="text-destructive"> *</span>
        </label>
        <div className="flex items-center gap-[8px]">
          <input
            id="add-student-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${MODAL_FIELD} font-mono`}
          />
          <button
            type="button"
            onClick={() => setPassword(genPassword(10))}
            title="Generate a new password"
            aria-label="Generate a new password"
            className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border-[1px] border-border bg-background/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-[6px] text-[11.5px] leading-[16px] text-muted-foreground">
          Made for you; you can change it. At least 8 characters.
        </p>
      </div>
    </AdminModal>
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
  const savedRows = React.useMemo(
    () => student.courses.map((c) => ({ courseId: c.id, teacherId: c.teacherId ?? "" })),
    [student]
  );
  const [rows, setRows] = React.useState(savedRows);
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

  // Taking off a course the student is enrolled in asks first (its schedule
  // and attendance go when the form is saved); a course added in this
  // pop-up and not saved yet just goes
  const [confirmRemove, setConfirmRemove] = React.useState<string | null>(null);

  function removeRow(courseId: string) {
    if (current(courseId)) setConfirmRemove(courseId);
    else setRows((prev) => prev.filter((x) => x.courseId !== courseId));
  }

  // Anything changed since the pop-up opened: Cancel becomes Discard changes,
  // which puts the saved details and courses back (the pop-up stays open)
  const dirty =
    name !== student.name ||
    email !== student.email ||
    phone !== (student.phone ?? "") ||
    country !== (student.country ?? "") ||
    JSON.stringify(rows) !== JSON.stringify(savedRows);

  function discard() {
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone ?? "");
    setCountry(student.country ?? "");
    setRows(savedRows);
    setAddCourseId("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  const addOptions: FormOption[] = addable.map((c) => ({ value: c.id, label: c.name }));

  return (
    <>
      <AdminModal
        icon={Pencil}
        title="Edit student"
        sub="Details and courses. The key button in the list changes the password."
        onClose={onClose}
        onSubmit={handleSubmit}
        closeOnBackdrop={false}
        maxWidth="max-w-[560px]"
        cancel={
          dirty ? (
            <ModalSecondary onClick={discard} icon={RotateCcw}>
              Discard changes
            </ModalSecondary>
          ) : undefined
        }
        footer={
          <ModalSubmit busy={saving} icon={Save}>
            Save changes
          </ModalSubmit>
        }
      >
        {error && <ModalError>{error}</ModalError>}

        <div className="grid gap-[16px] sm:grid-cols-2">
          <TextField label="Full name" required value={name} onChange={setName} />
          <TextField label="Email" required type="email" value={email} onChange={setEmail} />
        </div>
        <div className="grid gap-[16px] sm:grid-cols-2">
          <TextField label="WhatsApp / Phone" value={phone} onChange={setPhone} />
          <TextField label="Country" value={country} onChange={setCountry} />
        </div>

        <div>
          <span className={MODAL_LABEL}>Courses</span>
          {rows.length === 0 ? (
            <p className="rounded-xl border-[1px] border-dashed border-border px-[14px] py-[12px] text-[13px] leading-[18px] text-muted-foreground">
              Not enrolled in any course
            </p>
          ) : (
            <ul className="space-y-[8px]">
              {rows.map((r) => {
                const teachers = courseById.get(r.courseId)?.teachers ?? [];
                const keepCurrent =
                  r.teacherId && !teachers.some((t) => t.id === r.teacherId)
                    ? { id: r.teacherId, name: current(r.courseId)?.teacherName ?? "Current teacher" }
                    : null;
                const options = keepCurrent ? [keepCurrent, ...teachers] : teachers;
                return (
                  // phones: the teacher field drops to its own line under the course
                  // (order-[99], not order-last: Bootstrap has an !important .order-last)
                  <li
                    key={r.courseId}
                    className="flex flex-wrap items-center gap-[10px] rounded-xl border-[1px] border-border bg-muted/40 p-[10px]"
                  >
                    <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-[20px]">
                      {courseName(r.courseId)}
                    </span>
                    <div className="order-[99] w-full sm:order-[0] sm:w-[180px]">
                      <FormSelect
                        compact
                        label={`Teacher for ${courseName(r.courseId)}`}
                        value={r.teacherId}
                        onChange={(v) => setTeacher(r.courseId, v)}
                        disabled={options.length === 0}
                        options={[
                          { value: "", label: options.length === 0 ? "No teachers" : "No teacher yet" },
                          ...options.map((t) => ({ value: t.id, label: t.name })),
                        ]}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(r.courseId)}
                      title={`Remove ${courseName(r.courseId)}`}
                      aria-label={`Remove ${courseName(r.courseId)}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {addable.length > 0 && (
            <div className="mt-[8px] flex items-center gap-[8px]">
              <FormSelect
                label="Add a course"
                placeholder="Add a course…"
                value={addCourseId}
                onChange={setAddCourseId}
                options={addOptions}
              />
              <button
                type="button"
                onClick={addCourse}
                disabled={!addCourseId}
                className="inline-flex h-[42px] shrink-0 items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[16px] text-[13.5px] font-semibold leading-[18px] transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          )}
        </div>
      </AdminModal>

      {confirmRemove && (
        <ConfirmDialog
          title={`Remove ${courseName(confirmRemove)}?`}
          confirmLabel="Remove course"
          onConfirm={() => {
            setRows((prev) => prev.filter((x) => x.courseId !== confirmRemove));
            setConfirmRemove(null);
          }}
          onCancel={() => setConfirmRemove(null)}
        >
          <span className="font-semibold text-foreground">{courseName(confirmRemove)}</span> comes off{" "}
          <span className="font-semibold text-foreground">{student.name}</span> when you save, and their class
          schedule and attendance for it are deleted then. Until you save, Discard changes brings it back.
        </ConfirmDialog>
      )}
    </>
  );
}

// A labelled text field of the pop-ups above
function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className={MODAL_LABEL}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={MODAL_FIELD}
      />
    </div>
  );
}
