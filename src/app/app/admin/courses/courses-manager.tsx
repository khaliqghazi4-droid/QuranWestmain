"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  DollarSign,
  X,
  Loader2,
  AlertCircle,
  GraduationCap,
  Check,
  Star,
  Mail,
} from "lucide-react";
import { Avatar } from "@/components/avatar";

type TeacherWithCount = {
  id: string;
  name: string;
  isPrimary: boolean;
  studentsCount: number;
};

type Course = {
  id: string;
  name: string;
  description: string | null;
  level: string;
  duration: string | null;
  classDuration: number;
  price: number;
  image: string | null;
  isActive: boolean;
  teacherId: string | null;
  teachers: TeacherWithCount[];
  totalEnrollments: number;
};

type Teacher = { id: string; name: string };

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const CLASS_DURATIONS = [30, 45, 60];

export function CoursesManager({
  initialCourses,
  teachers,
}: {
  initialCourses: Course[];
  teachers: Teacher[];
}) {
  const router = useRouter();
  const [courses, setCourses] = React.useState(initialCourses);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [studentsModal, setStudentsModal] = React.useState<{
    course: Course;
    teacherId: string;
  } | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCourses(courses.filter((c) => c.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete");
    }
  }

  function handleSaved() {
    setModalOpen(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Management"
        description={`${courses.length} courses · Manage academy offerings`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" /> Add Course
          </button>
        }
      />

      {courses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No courses yet. Click &quot;Add Course&quot; to create your first one.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <div
              key={c.id}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all stagger-item"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold">{c.name}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {c.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold)/0.15)] px-2.5 py-0.5 text-[11px] font-bold text-[hsl(var(--gold))]">
                  {c.classDuration}m / class
                </span>
                {c.duration && (
                  <span className="text-[11px] text-muted-foreground">{c.duration}</span>
                )}
              </div>

              {/* Teachers section - clickable */}
              {c.teachers.length > 0 ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Teachers
                  </p>
                  {c.teachers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setStudentsModal({ course: c, teacherId: t.id })}
                      className="w-full flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group/teacher"
                    >
                      <Avatar name={t.name} size={24} style="micah" />
                      <span className="text-xs font-semibold flex-1 truncate group-hover/teacher:text-primary">
                        {t.name}
                      </span>
                      {t.isPrimary && (
                        <Star className="h-3 w-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                      )}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary inline-flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" />
                        {t.studentsCount}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-[hsl(var(--gold))] italic">
                  No teacher assigned
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> Total Students
                  </p>
                  <p className="text-base font-bold mt-0.5">{c.totalEnrollments}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground inline-flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Price
                  </p>
                  <p className="text-base font-bold mt-0.5">${c.price}/mo</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CourseModal
          course={editing}
          teachers={teachers}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {studentsModal && (
        <TeacherStudentsModal
          course={studentsModal.course}
          teacherId={studentsModal.teacherId}
          onClose={() => setStudentsModal(null)}
        />
      )}
    </div>
  );
}

function CourseModal({
  course,
  teachers,
  onClose,
  onSaved,
}: {
  course: Course | null;
  teachers: Teacher[];
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

  const [name, setName] = React.useState(course?.name ?? "");
  const [description, setDescription] = React.useState(course?.description ?? "");
  const [level, setLevel] = React.useState(course?.level ?? "Beginner");
  const [duration, setDuration] = React.useState(course?.duration ?? "");
  const [classDuration, setClassDuration] = React.useState(course?.classDuration ?? 45);
  const [price, setPrice] = React.useState(course?.price ?? 30);
  const [image, setImage] = React.useState(course?.image ?? "");
  const [selectedTeachers, setSelectedTeachers] = React.useState<Set<string>>(
    new Set(course?.teachers.map((t) => t.id) ?? [])
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleTeacher(id: string) {
    const next = new Set(selectedTeachers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTeachers(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = course ? `/api/courses/${course.id}` : "/api/courses";
    const method = course ? "PATCH" : "POST";

    const teacherIds = Array.from(selectedTeachers);
    const body: Record<string, unknown> = {
      name,
      description,
      level,
      duration: duration || null,
      classDuration: Number(classDuration),
      price: Number(price),
      image: image || null,
    };
    if (course) {
      body.teacherIds = teacherIds; // multi-teacher for updates
    } else {
      body.teacherId = teacherIds[0] || null; // create accepts single primary
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Save failed");
      setLoading(false);
      return;
    }

    // For new course, attach additional teachers
    if (!course && teacherIds.length > 1) {
      const data = await res.json();
      await fetch(`/api/courses/${data.course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherIds }),
      });
    }

    setLoading(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">{course ? "Edit Course" : "Create New Course"}</h2>
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Course Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tajweed Mastery"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What will students learn?"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Level *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Course Length</label>
              <input
                value={duration ?? ""}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 months"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Class Duration (per session) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CLASS_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setClassDuration(d)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    classDuration === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Each class for this course will be {classDuration} minutes long
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Price (USD/month)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 inline-flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" /> Assign Teachers (select one or more)
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-border bg-background p-2">
              {teachers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No teachers yet. Invite teachers from Teachers page first.
                </p>
              ) : (
                teachers.map((t) => {
                  const isSelected = selectedTeachers.has(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTeacher(t.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`grid h-5 w-5 place-items-center rounded border-2 shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </div>
                      <Avatar name={t.name} size={28} style="micah" />
                      <span className="text-sm flex-1">{t.name}</span>
                    </button>
                  );
                })
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {selectedTeachers.size === 0
                ? "No teachers selected"
                : `${selectedTeachers.size} teacher${selectedTeachers.size === 1 ? "" : "s"} selected`}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Image URL</label>
            <input
              value={image ?? ""}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {course ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type StudentRow = {
  id: string;
  progress: number;
  startedAt: string;
  student: { id: string; name: string; email: string; country: string | null };
};

function TeacherStudentsModal({
  course,
  teacherId,
  onClose,
}: {
  course: Course;
  teacherId: string;
  onClose: () => void;
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

  const [data, setData] = React.useState<{
    teachers: Array<{ id: string; name: string; students: StudentRow[] }>;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/courses/${course.id}/teachers`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [course.id]);

  const teacher = data?.teachers.find((t) => t.id === teacherId);
  const students: StudentRow[] = teacher?.students ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={teacher?.name ?? "Teacher"} size={56} style="micah" className="border-2 border-primary-foreground/30" />
            <div>
              <p className="text-xs text-primary-foreground/80 uppercase font-semibold tracking-wide">
                {course.name}
              </p>
              <h2 className="text-xl font-bold mt-0.5">{teacher?.name ?? "—"}</h2>
              <p className="text-sm text-primary-foreground/80 mt-1 inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {students.length} {students.length === 1 ? "student" : "students"} assigned
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-3 text-base font-bold">No students yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No students are currently assigned to this teacher for this course.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((e, i) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-all stagger-item"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Avatar name={e.student.name} size={44} style="avataaars" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{e.student.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {e.student.email}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                      {e.student.country && <span>{e.student.country}</span>}
                      <span>
                        Joined{" "}
                        {new Date(e.startedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-primary shrink-0">
                        {e.progress}%
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${e.student.email}`}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted shrink-0"
                    title="Email"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
