"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  PlayCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { AvailabilityEditor } from "@/components/availability/availability-editor";

type AvailabilitySlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  };
  availability: AvailabilitySlot[];
};

export function CoursesList({
  enrollments,
  userTimezone,
}: {
  enrollments: Enrollment[];
  userTimezone: string;
}) {
  const router = useRouter();
  const [editingEnrollment, setEditingEnrollment] = React.useState<Enrollment | null>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrollments.map((e, i) => {
          const c = e.course;
          const hasAvailability = e.availability.length > 0;
          const tag = e.progress >= 80 ? "Almost Done" : e.progress > 0 ? "In Progress" : "Just Started";
          const tagColor = e.progress >= 80 ? "bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)]" : "bg-primary text-primary-foreground";
          return (
            <div
              key={e.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all stagger-item"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {c.image && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
                  <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold ${tagColor}`}>
                    {tag}
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-[hsl(var(--gold))] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(220_32%_10%)]">
                    {c.classDuration}m
                  </span>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                {c.teacherName && (
                  <p className="text-xs text-muted-foreground mt-1">by {c.teacherName}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-muted-foreground">{c.level}</span>
                    <span className="font-bold">{e.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                      style={{ width: `${e.progress}%` }}
                    />
                  </div>
                </div>

                {/* Availability indicator */}
                <div
                  className={`mt-4 rounded-xl border p-3 ${
                    hasAvailability
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.08)]"
                  }`}
                >
                  {hasAvailability ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="flex-1 text-[11px]">
                        <p className="font-semibold text-foreground">
                          Your times set for this course
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {e.availability.length} slot
                          {e.availability.length === 1 ? "" : "s"} configured
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--gold))] mt-0.5 shrink-0" />
                      <div className="flex-1 text-[11px]">
                        <p className="font-semibold text-foreground">
                          Set your available times
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          Admin needs this to book your classes
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditingEnrollment(e)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                      hasAvailability
                        ? "border border-border bg-card text-foreground hover:bg-muted"
                        : "bg-gradient-to-r from-[hsl(var(--gold))] to-amber-500 text-[hsl(220_32%_10%)] shadow-md"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {hasAvailability ? "Edit Times" : "Set My Times"}
                  </button>
                  <Link
                    href={`/app/student/courses/${c.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-2 text-xs font-bold text-primary-foreground shadow-md"
                  >
                    <PlayCircle className="h-3.5 w-3.5" /> Continue
                  </Link>
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> {c.duration ?? "Self-paced"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {editingEnrollment && (
        <AvailabilityModal
          enrollment={editingEnrollment}
          userTimezone={userTimezone}
          onClose={() => setEditingEnrollment(null)}
          onSaved={() => {
            setEditingEnrollment(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function AvailabilityModal({
  enrollment,
  userTimezone,
  onClose,
  onSaved,
}: {
  enrollment: Enrollment;
  userTimezone: string;
  onClose: () => void;
  onSaved: () => void;
}) {
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
              <h2 className="text-base font-bold">Set Your Available Times</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                For course: <span className="font-semibold text-foreground">{enrollment.course.name}</span>
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
              saveUrl={`/api/enrollments/${enrollment.id}/availability`}
              initialTimezone={userTimezone}
              initialSlots={enrollment.availability.map((a) => ({
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
              }))}
              title={`Available Times for ${enrollment.course.name}`}
              description={`Class will be ${enrollment.course.classDuration} min each. Set hours when you can attend`}
              onSaved={onSaved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
