"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Check, DollarSign, Clock, GraduationCap } from "lucide-react";
import {
  EnrollFormModal,
  type EnrollFormPrefill,
} from "@/components/student/enroll-form-modal";

type Course = {
  id: string;
  name: string;
  description: string | null;
  level: string;
  duration: string | null;
  price: number;
  image: string | null;
  teacher: { id: string; name: string } | null;
  _count: { enrollments: number };
};

export function CatalogClient({
  courses,
  enrolledIds,
  prefill,
}: {
  courses: Course[];
  enrolledIds: string[];
  prefill: EnrollFormPrefill;
}) {
  const router = useRouter();
  const [openFor, setOpenFor] = React.useState<Course | null>(null);

  // Local set of "requested" courses so the button switches to "Request Sent"
  // immediately after submit (admin still has to convert it to a real
  // enrollment, so we don't add the courseId to `enrolledIds`).
  const [requested, setRequested] = React.useState<Set<string>>(new Set());
  const enrolledSet = new Set(enrolledIds);

  const allCoursesForDropdown = courses.map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c, i) => {
          const isEnrolled = enrolledSet.has(c.id);
          const isRequested = requested.has(c.id);
          return (
            <div
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all stagger-item flex flex-col"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {c.image ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-primary/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-primary-foreground">
                    {c.level}
                  </span>
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
                  <BookOpen className="h-12 w-12 text-primary/50" />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {c.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                  {c.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {c.duration}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> {c._count.enrollments} enrolled
                  </span>
                </div>

                {c.teacher && (
                  <p className="mt-2 text-[11px] text-muted-foreground">by {c.teacher.name}</p>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 text-base font-bold text-primary">
                    <DollarSign className="h-4 w-4" />
                    {c.price}
                    <span className="text-[11px] text-muted-foreground font-normal">/mo</span>
                  </div>
                  {isEnrolled ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 px-4 py-2 text-xs font-bold"
                    >
                      <Check className="h-3.5 w-3.5" /> Enrolled
                    </button>
                  ) : isRequested ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] px-4 py-2 text-xs font-bold"
                    >
                      <Check className="h-3.5 w-3.5" /> Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={() => setOpenFor(c)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {openFor && (
        <EnrollFormModal
          course={{ id: openFor.id, name: openFor.name }}
          courses={allCoursesForDropdown}
          prefill={prefill}
          onClose={() => setOpenFor(null)}
          onSubmitted={() => {
            const justEnrolled = openFor.id;
            setRequested((s) => new Set(s).add(justEnrolled));
            setOpenFor(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
