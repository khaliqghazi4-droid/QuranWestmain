"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Users,
  DollarSign,
  X,
  Loader2,
  AlertCircle,
  GraduationCap,
  Check,
  Mail,
  Clock,
  CalendarRange,
  UserPlus,
  ChevronRight,
  Save,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { IconBadge } from "@/components/dashboard/icon-badge";
import { StatTiles, type StatTile } from "@/components/admin/stat-tiles";

type TeacherWithCount = {
  id: string;
  name: string;
  // their own uploaded photo, if any
  image?: string | null;
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

type Teacher = { id: string; name: string; image?: string | null };

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const CLASS_DURATIONS = [30, 45, 60];

// "BEGINNER" (the sample data) and "Beginner" both read "Beginner"
function levelLabel(level: string) {
  return level.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// 30 → "30", 29.5 → "29.50"
function money(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// The modals are rendered into the dashboard shell, not inside the page: a
// glass card's blur (backdrop-filter) would trap a fixed overlay inside it.
// The shell keeps .admin-brand, so the admin colours still apply.
function portal(node: React.ReactNode) {
  return createPortal(node, document.querySelector(".admin-dashboard") ?? document.body);
}

// Locks the page behind an open modal
function useScrollLock() {
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
}

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

  const enrollments = courses.reduce((sum, c) => sum + c.totalEnrollments, 0);
  // the average of the courses that have a fee set ($0 ones aren't priced yet)
  const priced = courses.filter((c) => c.price > 0);
  const averageFee = priced.length
    ? Math.round(priced.reduce((sum, c) => sum + c.price, 0) / priced.length)
    : null;
  const stats: StatTile[] = [
    { icon: BookOpen, label: "Courses offered", value: String(courses.length) },
    { icon: GraduationCap, label: "Total enrollments", value: String(enrollments) },
    { icon: DollarSign, label: "Average monthly fee", value: averageFee === null ? "—" : `$${averageFee}` },
    { icon: UserPlus, label: "Need a teacher", value: String(courses.filter((c) => c.teachers.length === 0).length) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Management"
        description={`${courses.length} ${courses.length === 1 ? "course" : "courses"} · Manage academy offerings`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[18px] py-[10px] text-[13.5px] font-semibold leading-[18px] text-primary-foreground shadow-md transition-all hover:-translate-y-px hover:shadow-[0_12px_24px_-10px_rgb(11_26_55/0.6)]"
          >
            <Plus className="h-4 w-4" /> Add Course
          </button>
        }
      />

      <StatTiles stats={stats} />

      {/* As many ~300px columns as fit beside the sidebar, one on phones */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-[16px]">
        {courses.map((c, i) => (
          <CourseCard
            key={c.id}
            course={c}
            index={i}
            onEdit={() => openEdit(c)}
            onDelete={() => handleDelete(c.id)}
            onOpenTeacher={(teacherId) => setStudentsModal({ course: c, teacherId })}
          />
        ))}

        {/* Always last in the grid: fills the empty spot and starts a new course */}
        <button
          onClick={openCreate}
          className="adm-add group flex min-h-[260px] flex-col items-center justify-center gap-[12px] rounded-2xl border-[2px] border-dashed border-border bg-card/40 p-[24px] text-center transition-all hover:-translate-y-0.5 hover:bg-card/70 stagger-item"
          style={{ animationDelay: `${courses.length * 60}ms` }}
        >
          <span className="adm-icon grid h-[56px] w-[56px] place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
            <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
          </span>
          <span className="text-[15px] font-bold leading-[20px]">Add a new course</span>
          <span className="max-w-[240px] text-[12.5px] leading-[19px] text-muted-foreground">
            Set its level, class length, monthly fee and teachers
          </span>
        </button>
      </div>

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

// White glass chips on the banner
const COVER_CHIP =
  "inline-flex items-center gap-[5px] rounded-full bg-white/15 px-[10px] py-[4px] text-[11px] font-semibold leading-[14px] text-white ring-1 ring-white/25 backdrop-blur-sm";

function CourseCard({
  course: c,
  index,
  onEdit,
  onDelete,
  onOpenTeacher,
}: {
  course: Course;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onOpenTeacher: (teacherId: string) => void;
}) {
  // a picture link that no longer loads falls back to the plain banner
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = !!c.image && !imageFailed;

  return (
    <article
      className="adm-glass group flex flex-col overflow-hidden rounded-2xl border-[1px] border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 stagger-item"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Banner in the brand gradient, as on the teacher cards, with the
          course's own picture over it when one is set */}
      <div className="adm-cover relative h-[88px] shrink-0 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary">
        {showImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- any link the admin pastes; next/image needs each host listed */}
            <img
              src={c.image!}
              alt=""
              onError={() => setImageFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/40" />
          </>
        )}
        <div className="relative z-[1] flex items-start justify-between gap-[8px] p-[12px]">
          <div className="flex flex-wrap items-center gap-[6px]">
            <span className={COVER_CHIP}>
              <GraduationCap className="h-3 w-3" /> {levelLabel(c.level)}
            </span>
            {!c.isActive && <span className={COVER_CHIP}>Inactive</span>}
          </div>
          <div className="inline-flex shrink-0 items-center gap-[2px] rounded-full bg-white/15 p-[3px] text-white ring-1 ring-white/25 backdrop-blur-sm">
            <button
              onClick={onEdit}
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-white/25"
              title="Edit course"
              aria-label="Edit course"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <span aria-hidden="true" className="mx-[2px] h-4 w-px bg-white/25" />
            <button
              onClick={onDelete}
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-destructive"
              title="Delete course"
              aria-label="Delete course"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-[20px] pb-[20px]">
        {/* The icon square across the banner's edge, the monthly fee beside it */}
        <div className="flex items-end justify-between gap-[12px]">
          <span className="adm-icon relative z-[1] -mt-[28px] grid h-[56px] w-[56px] shrink-0 place-items-center rounded-2xl border-[3px] !border-card bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <BookOpen className="h-6 w-6" />
          </span>
          <p className="whitespace-nowrap">
            <span className="text-[24px] font-bold leading-[28px] tabular-nums">${money(c.price)}</span>
            <span className="ml-[4px] text-[12px] font-medium leading-[16px] text-muted-foreground">/ month</span>
          </p>
        </div>

        {/* Sizes written out: Bootstrap's .text-sm/.text-xs have no line height */}
        <h3 className="mt-[14px] truncate text-[17px] font-bold leading-[24px]" title={c.name}>
          {c.name}
        </h3>
        {/* Always two lines tall, so the teachers line up across a row of cards */}
        <p className="mt-[4px] line-clamp-2 min-h-[38px] text-[12.5px] leading-[19px] text-muted-foreground">
          {c.description?.trim() || <span className="italic opacity-[0.7]">No description added yet.</span>}
        </p>

        <div className="mt-[16px]">
          {/* an uppercase p: the glass card gives it the navy eyebrow line */}
          <p className="mb-[8px] text-[10px] font-bold uppercase leading-[14px] tracking-[0.1em] text-muted-foreground">
            {c.teachers.length > 1 ? `Teachers · ${c.teachers.length}` : "Teacher"}
          </p>
          {c.teachers.length > 0 ? (
            <div className="space-y-[6px]">
              {c.teachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onOpenTeacher(t.id)}
                  className="adm-tile group/teacher flex w-full items-center gap-[10px] rounded-xl border-[1px] border-border bg-background/60 px-[10px] py-[8px] text-left transition-all hover:border-primary/40"
                  title={`See ${t.name}'s students in this course`}
                >
                  <Avatar name={t.name} src={t.image} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold leading-[18px]">{t.name}</span>
                    <span className="block truncate text-[11.5px] leading-[16px] text-muted-foreground">
                      {t.isPrimary && "Lead teacher · "}
                      {t.studentsCount} {t.studentsCount === 1 ? "student" : "students"}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover/teacher:translate-x-0.5" />
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={onEdit}
              className="adm-dashed flex w-full items-center gap-[10px] rounded-xl border-[1px] border-dashed border-border px-[10px] py-[8px] text-left transition-colors hover:bg-primary/5"
            >
              <IconBadge icon={UserPlus} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold leading-[18px]">No teacher assigned</span>
                <span className="block truncate text-[11.5px] leading-[16px] text-muted-foreground">
                  Add one to place students
                </span>
              </span>
              <span className="shrink-0 text-[12px] font-bold leading-[16px] text-primary">Assign</span>
            </button>
          )}
        </div>

        {/* mt-auto: the figures line up along the bottom of a row of cards */}
        <div className="mt-auto pt-[16px]">
          <div className="adm-tile grid grid-cols-3 divide-x divide-border rounded-xl border-[1px] border-border bg-background/60">
            {[
              { icon: Users, label: "Students", value: String(c.totalEnrollments) },
              { icon: Clock, label: "Per class", value: `${c.classDuration} min` },
              { icon: CalendarRange, label: "Length", value: c.duration?.trim() || "—" },
            ].map((s) => (
              <div key={s.label} className="min-w-0 px-[6px] py-[10px] text-center">
                <p className="truncate text-[15px] font-bold leading-[21px]" title={s.value}>
                  {s.value}
                </p>
                <span className="mt-[3px] inline-flex items-center gap-[5px] text-[11px] font-medium leading-[16px] text-muted-foreground">
                  <IconBadge icon={s.icon} size={16} /> {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

// Sizes written out: the website's Bootstrap sheet overrides .text-sm/.text-xs
const LABEL = "mb-[6px] block text-[12.5px] font-semibold leading-[18px] text-muted-foreground";
const FIELD =
  "w-full rounded-xl border-[1px] border-border bg-background px-[14px] py-[10px] text-[14px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
// Level and class-length choices: the chosen one in the navy gradient
const CHOICE = "rounded-xl border-[1px] px-[10px] py-[9px] text-[13px] font-semibold leading-[18px] transition-all";
const CHOICE_ON = "adm-badge border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md";
const CHOICE_OFF = "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground";

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
  useScrollLock();

  const [name, setName] = React.useState(course?.name ?? "");
  const [description, setDescription] = React.useState(course?.description ?? "");
  // matched to the listed spelling, so the sample data's "BEGINNER" shows as chosen
  const [level, setLevel] = React.useState(
    LEVELS.find((l) => l.toLowerCase() === course?.level.toLowerCase()) ?? course?.level ?? "Beginner"
  );
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

  return portal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-[16px] backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSubmit}
        // adm-modal: white fields and navy edges in the light admin (globals.css)
        className="adm-modal flex max-h-[min(90vh,760px)] w-full max-w-[560px] flex-col overflow-hidden rounded-3xl border-[1px] border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-[12px] border-b border-border px-[24px] py-[18px]">
          <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            {course ? <Pencil className="h-[18px] w-[18px]" /> : <BookOpen className="h-[18px] w-[18px]" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold leading-[24px]">{course ? "Edit course" : "Create a new course"}</h2>
            <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">
              {course ? course.name : "Level, class length, monthly fee and teachers"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The fields scroll on short screens; header and buttons stay put */}
        <div className="min-h-0 flex-1 space-y-[18px] overflow-y-auto px-[24px] py-[20px]">
          {error && (
            <div className="flex items-start gap-[8px] rounded-xl border-[1px] border-destructive/30 bg-destructive/10 p-[12px] text-[12.5px] leading-[18px] text-destructive">
              <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label htmlFor="course-name" className={LABEL}>
              Course name<span className="text-destructive"> *</span>
            </label>
            <input
              id="course-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tajweed Mastery"
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="course-description" className={LABEL}>
              Description
            </label>
            <textarea
              id="course-description"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What will students learn?"
              className={`${FIELD} resize-none`}
            />
          </div>

          <div>
            <span className={LABEL}>
              Level<span className="text-destructive"> *</span>
            </span>
            <div className="grid grid-cols-2 gap-[8px] sm:grid-cols-4">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={level === l}
                  onClick={() => setLevel(l)}
                  className={`${CHOICE} ${level === l ? CHOICE_ON : CHOICE_OFF}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={LABEL}>
              Class duration (per session)<span className="text-destructive"> *</span>
            </span>
            <div className="grid grid-cols-3 gap-[8px]">
              {CLASS_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={classDuration === d}
                  onClick={() => setClassDuration(d)}
                  className={`${CHOICE} inline-flex items-center justify-center gap-[6px] ${classDuration === d ? CHOICE_ON : CHOICE_OFF}`}
                >
                  <Clock className="h-3.5 w-3.5" /> {d} min
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-[16px] sm:grid-cols-2">
            <div>
              <label htmlFor="course-length" className={LABEL}>
                Course length
              </label>
              <input
                id="course-length"
                value={duration ?? ""}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 months"
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="course-price" className={LABEL}>
                Monthly fee
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] font-semibold leading-[20px] text-muted-foreground">
                  $
                </span>
                <input
                  id="course-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={`${FIELD} pl-[28px] pr-[72px]`}
                />
                <span className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12.5px] leading-[18px] text-muted-foreground">
                  USD / mo
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className={`${LABEL} inline-flex items-center gap-[6px]`}>
              <GraduationCap className="h-3.5 w-3.5" /> Teachers
              <span className="font-normal">(select one or more)</span>
            </span>
            <div className="max-h-48 space-y-[4px] overflow-y-auto rounded-xl border-[1px] border-border bg-background p-[6px]">
              {teachers.length === 0 ? (
                <p className="py-[16px] text-center text-[12.5px] leading-[18px] text-muted-foreground">
                  No teachers yet. Invite teachers from Teachers page first.
                </p>
              ) : (
                teachers.map((t) => {
                  const isSelected = selectedTeachers.has(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleTeacher(t.id)}
                      className={`flex w-full items-center gap-[12px] rounded-lg px-[10px] py-[8px] text-left transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${
                          isSelected
                            ? "adm-badge bg-gradient-to-br from-primary to-accent text-primary-foreground"
                            : "border-[2px] border-border bg-card"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <Avatar name={t.name} src={t.image} size={30} />
                      <span className="flex-1 truncate text-[13.5px] font-medium leading-[18px]">{t.name}</span>
                    </button>
                  );
                })
              )}
            </div>
            <p className="mt-[6px] text-[11.5px] leading-[16px] text-muted-foreground">
              {selectedTeachers.size === 0
                ? "No teachers selected"
                : `${selectedTeachers.size} teacher${selectedTeachers.size === 1 ? "" : "s"} selected`}
            </p>
          </div>

          <div>
            <label htmlFor="course-image" className={LABEL}>
              Image URL
            </label>
            <input
              id="course-image"
              value={image ?? ""}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className={FIELD}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-[8px] border-t border-border px-[24px] py-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-[1px] border-border bg-background/70 px-[20px] py-[9px] text-[13.5px] font-semibold leading-[18px] transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[20px] py-[9px] text-[13.5px] font-semibold leading-[18px] text-primary-foreground shadow-md disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : course ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {course ? "Save changes" : "Create course"}
          </button>
        </div>
      </form>
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
  useScrollLock();

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
  // the photo comes with the course list; the name too, before the fetch lands
  const known = course.teachers.find((t) => t.id === teacherId);
  const teacherName = teacher?.name ?? known?.name ?? "Teacher";

  return portal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-[16px] backdrop-blur-sm animate-fade-in">
      <div className="adm-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-[1px] border-border bg-card shadow-2xl">
        <div className="adm-cover relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary to-accent p-[24px] text-primary-foreground">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-[16px] top-[16px] z-[1] grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative z-[1] flex items-center gap-[12px]">
            <Avatar name={teacherName} src={known?.image} size={56} className="!border-white/30" />
            <div>
              <p className="text-[11px] font-semibold uppercase leading-[16px] tracking-wide text-primary-foreground/80">
                {course.name}
              </p>
              <h2 className="mt-[2px] text-[20px] font-bold leading-[28px]">{teacherName}</h2>
              <p className="mt-[4px] inline-flex items-center gap-[4px] text-[13px] leading-[18px] text-primary-foreground/80">
                <Users className="h-3.5 w-3.5" /> {students.length} {students.length === 1 ? "student" : "students"} assigned
              </p>
            </div>
          </div>
        </div>

        <div className="p-[24px]">
          {loading ? (
            <div className="py-[48px] text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-[12px] text-[13px] leading-[18px] text-muted-foreground">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-[48px] text-center">
              <span className="adm-icon mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="mt-[12px] text-[16px] font-bold leading-[22px]">No students yet</h3>
              <p className="mt-[4px] text-[13px] leading-[19px] text-muted-foreground">
                No students are currently assigned to this teacher for this course.
              </p>
            </div>
          ) : (
            <div className="space-y-[8px]">
              {students.map((e, i) => (
                <div
                  key={e.id}
                  className="flex items-center gap-[12px] rounded-xl border-[1px] border-border bg-background p-[16px] transition-all hover:border-primary/40 stagger-item"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Avatar name={e.student.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold leading-[20px]">{e.student.name}</p>
                    <p className="truncate text-[11.5px] leading-[17px] text-muted-foreground">{e.student.email}</p>
                    <div className="mt-[4px] flex flex-wrap items-center gap-[12px] text-[11.5px] leading-[16px] text-muted-foreground">
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
                    <div className="mt-[6px] flex items-center gap-[8px]">
                      <div className="adm-track h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10.5px] font-bold leading-[14px] text-primary">{e.progress}%</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${e.student.email}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    title="Email"
                    aria-label="Email"
                  >
                    <Mail className="h-3.5 w-3.5" />
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
