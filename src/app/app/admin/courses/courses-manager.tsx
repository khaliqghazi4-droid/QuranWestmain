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
} from "lucide-react";

type Course = {
  id: string;
  name: string;
  description: string | null;
  level: string;
  duration: string | null;
  price: number;
  image: string | null;
  isActive: boolean;
  teacherId: string | null;
  teacher: { id: string; name: string } | null;
  _count: { enrollments: number };
};

type Teacher = { id: string; name: string };

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

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

  function handleSaved(course: Course) {
    if (editing) {
      setCourses(courses.map((c) => (c.id === course.id ? course : c)));
    } else {
      setCourses([course, ...courses]);
    }
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
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"
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
                {c.duration && (
                  <span className="text-[11px] text-muted-foreground">{c.duration}</span>
                )}
              </div>
              {c.teacher && (
                <p className="text-[11px] text-muted-foreground mt-2">by {c.teacher.name}</p>
              )}

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> Students
                  </p>
                  <p className="text-base font-bold mt-0.5">{c._count.enrollments}</p>
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
  onSaved: (c: Course) => void;
}) {
  const [name, setName] = React.useState(course?.name ?? "");
  const [description, setDescription] = React.useState(course?.description ?? "");
  const [level, setLevel] = React.useState(course?.level ?? "Beginner");
  const [duration, setDuration] = React.useState(course?.duration ?? "");
  const [price, setPrice] = React.useState(course?.price ?? 30);
  const [image, setImage] = React.useState(course?.image ?? "");
  const [teacherId, setTeacherId] = React.useState(course?.teacherId ?? "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = course ? `/api/courses/${course.id}` : "/api/courses";
    const method = course ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        level,
        duration: duration || null,
        price: Number(price),
        image: image || null,
        teacherId: teacherId || null,
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    const teacher = teachers.find((t) => t.id === teacherId) ?? null;
    onSaved({
      ...data.course,
      teacher,
      _count: course?._count ?? { enrollments: 0 },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold">
            {course ? "Edit Course" : "Create New Course"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
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
              Course Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tajweed Mastery"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Description
            </label>
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Level *
              </label>
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Duration
              </label>
              <input
                value={duration ?? ""}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 months"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Price (USD/month)
              </label>
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Assign Teacher
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">— No teacher —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Image URL
            </label>
            <input
              value={image ?? ""}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              {course ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
