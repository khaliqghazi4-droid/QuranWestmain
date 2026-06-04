"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  User,
  CheckCircle2,
} from "lucide-react";
import { LessonsList } from "./[id]/lessons-list";

// Each enrollment hands its full lesson list (with the student's per-lesson
// completion flag baked in) so we can render lessons inline inside an
// expandable accordion right on the My Courses page — no extra navigation.
type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  fileUrl: string | null;
  duration: number | null;
  order: number;
  completed: boolean;
};

type Enrollment = {
  id: string;
  progress: number;
  course: {
    id: string;
    name: string;
    image: string | null;
    level: string;
    duration: string | null;
    classDuration: number;
    teacherName: string | null;
    lessons: Lesson[];
  };
};

export function CoursesList({ enrollments }: { enrollments: Enrollment[] }) {
  // Open the most-recently enrolled course by default so the student lands
  // straight on the lessons they're most likely working through.
  const [openId, setOpenId] = React.useState<string | null>(
    enrollments[0]?.id ?? null
  );

  return (
    <div className="space-y-4">
      {enrollments.map((e, i) => {
        const c = e.course;
        const isOpen = openId === e.id;
        const completedCount = c.lessons.filter((l) => l.completed).length;
        const tag =
          e.progress >= 80 ? "Almost Done" : e.progress > 0 ? "In Progress" : "Just Started";
        const tagColor =
          e.progress >= 80
            ? "bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)]"
            : "bg-primary text-primary-foreground";
        return (
          <div
            key={e.id}
            className="overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors stagger-item"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Header — clickable to expand / collapse */}
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : e.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
            >
              {c.image ? (
                <div className="relative h-20 w-28 sm:h-24 sm:w-32 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 640px) 128px, 112px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid h-20 w-28 sm:h-24 sm:w-32 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold tracking-tight truncate">
                    {c.name}
                  </h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tagColor}`}>
                    {tag}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
                    {c.level}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                  {c.teacherName && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" /> {c.teacherName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {c.lessons.length}{" "}
                    {c.lessons.length === 1 ? "lesson" : "lessons"}
                    {completedCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold ml-1">
                        <CheckCircle2 className="h-3 w-3" /> {completedCount} done
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {c.classDuration} min/class
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1 text-[10px]">
                    <span className="text-muted-foreground font-semibold">Progress</span>
                    <span className="font-bold">{e.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                      style={{ width: `${e.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                  <PlayCircle className="h-3.5 w-3.5" />
                  {isOpen ? "Hide Lessons" : "Show Lessons"}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="sm:hidden grid h-9 w-9 place-items-center rounded-full border border-border shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Expanded body — embedded LessonsList. We pre-key on the
                lessons identity so toggling open ↔ closed keeps internal
                lesson UI state (which lesson is open, etc.) sensible. */}
            {isOpen && (
              <div className="border-t border-border p-4 sm:p-6 bg-background/40">
                {c.lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm font-semibold">
                      No lessons published yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                      Your teacher will add lesson material here as the course
                      progresses.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-bold inline-flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" /> Course Lessons
                      </p>
                      <Link
                        href={`/app/student/courses/${c.id}`}
                        className="text-[11px] text-primary font-semibold hover:underline"
                      >
                        Open full course →
                      </Link>
                    </div>
                    <LessonsList lessons={c.lessons} />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
