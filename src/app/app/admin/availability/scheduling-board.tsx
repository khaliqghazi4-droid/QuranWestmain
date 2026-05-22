"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  Loader2,
  Trash2,
  Globe,
  User,
  Sun,
  Moon,
  Filter,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { AvailabilityEditor } from "@/components/availability/availability-editor";
import { DAYS, formatTime12h } from "@/lib/timezones";
import { formatSlotRange } from "@/lib/shifts";

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string };
type Booking = {
  id: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
};
type Enrollment = {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    country: string | null;
    timezone: string;
  };
  course: { id: string; name: string; level: string; classDuration: number };
  teacherName: string | null;
  availability: Slot[];
  bookings: Booking[];
};

export function SchedulingBoard({ enrollments }: { enrollments: Enrollment[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "no-availability" | "not-booked" | "booked">(
    "all"
  );
  const [editing, setEditing] = React.useState<Enrollment | null>(null);
  const [booking, setBooking] = React.useState<Enrollment | null>(null);

  const filtered = enrollments.filter((e) => {
    const q = query.toLowerCase();
    const matchesQuery =
      e.student.name.toLowerCase().includes(q) ||
      e.student.email.toLowerCase().includes(q) ||
      e.course.name.toLowerCase().includes(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "no-availability" && e.availability.length === 0) ||
      (filter === "not-booked" && e.bookings.length === 0) ||
      (filter === "booked" && e.bookings.length > 0);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All enrollments</option>
            <option value="no-availability">Needs student times</option>
            <option value="not-booked">Not booked yet</option>
            <option value="booked">Has bookings</option>
          </select>
        </div>
        <div className="flex-1" />
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student or course..."
            className="w-full sm:w-72 rounded-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">No enrollments match your filter</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((e) => (
            <EnrollmentCard
              key={e.id}
              enrollment={e}
              onEdit={() => setEditing(e)}
              onBook={() => setBooking(e)}
            />
          ))}
        </div>
      )}

      {editing && (
        <AvailabilityModal
          enrollment={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {booking && (
        <BookingModal
          enrollment={booking}
          onClose={() => setBooking(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}

function EnrollmentCard({
  enrollment: e,
  onEdit,
  onBook,
}: {
  enrollment: Enrollment;
  onEdit: () => void;
  onBook: () => void;
}) {
  const hasAvailability = e.availability.length > 0;
  const hasBookings = e.bookings.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar name={e.student.name} size={42} style="micah" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{e.student.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{e.student.email}</p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {e.course.name}
            </span>
            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
              <Globe className="h-2.5 w-2.5" /> {e.student.timezone}
            </span>
            <span className="text-[10px] text-muted-foreground">{e.course.classDuration}m class</span>
          </div>
        </div>
      </div>

      {/* Status row */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div
          className={`rounded-xl border p-2.5 text-[11px] ${
            hasAvailability
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.08)]"
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {hasAvailability ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            ) : (
              <AlertCircle className="h-3 w-3 text-[hsl(var(--gold))]" />
            )}
            Student times
          </div>
          <p className="text-muted-foreground mt-0.5">
            {hasAvailability ? `${e.availability.length} window(s) set` : "Not set yet"}
          </p>
        </div>
        <div
          className={`rounded-xl border p-2.5 text-[11px] ${
            hasBookings ? "border-primary/30 bg-primary/5" : "border-border bg-background"
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <Calendar className="h-3 w-3 text-primary" /> Classes
          </div>
          <p className="text-muted-foreground mt-0.5">
            {hasBookings ? `${e.bookings.length} booked` : "None booked"}
          </p>
        </div>
      </div>

      {/* Booked slots */}
      {hasBookings && (
        <div className="mt-3 space-y-1">
          {e.bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11px]"
            >
              <Clock className="h-3 w-3 text-primary shrink-0" />
              <span className="font-semibold">{DAYS[b.dayOfWeek].short}</span>
              <span>{formatSlotRange(b.startTime)}</span>
              <span className="text-muted-foreground">PKT</span>
              <span className="ml-auto text-muted-foreground truncate">{b.teacherName}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onEdit}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all ${
            hasAvailability
              ? "border border-border bg-card text-foreground hover:bg-muted"
              : "bg-gradient-to-r from-[hsl(var(--gold))] to-amber-500 text-[hsl(220_32%_10%)] shadow-md"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          {hasAvailability ? "Edit Times" : "Set Times"}
        </button>
        <button
          onClick={onBook}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-2 text-xs font-bold text-primary-foreground shadow-md"
        >
          <CalendarPlus className="h-3.5 w-3.5" /> Book Class
        </button>
      </div>
    </div>
  );
}

function AvailabilityModal({
  enrollment,
  onClose,
  onSaved,
}: {
  enrollment: Enrollment;
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
          onClick={(ev) => ev.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl my-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
            <div>
              <h2 className="text-base font-bold">Set Student Available Times</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enrollment.student.name} ·{" "}
                <span className="font-semibold text-foreground">{enrollment.course.name}</span>
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
              initialTimezone={enrollment.student.timezone}
              initialSlots={enrollment.availability.map((a) => ({
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
              }))}
              title={`Available Times for ${enrollment.student.name}`}
              description={`Class is ${enrollment.course.classDuration} min. Set hours the student can attend (their local time)`}
              onSaved={onSaved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Booking Modal (the core feature) ----

type SlotStatus = {
  time: string;
  booked: boolean;
  bookedBy: { student: string; course: string; isThisStudent: boolean } | null;
  matchesStudent: boolean;
};
type TeacherOption = {
  id: string;
  name: string;
  shift: "DAY" | "NIGHT" | null;
  country: string | null;
  days: { day: number; slots: SlotStatus[] }[];
};
type BookingOptions = {
  enrollment: {
    id: string;
    studentName: string;
    studentTimezone: string;
    courseName: string;
    classDuration: number;
    hasAvailability: boolean;
  };
  teachers: TeacherOption[];
  myBookings: { id: string; teacherId: string; dayOfWeek: number; startTime: string }[];
};

function BookingModal({
  enrollment,
  onClose,
  onChanged,
}: {
  enrollment: Enrollment;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = React.useState<BookingOptions | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [activeTeacher, setActiveTeacher] = React.useState<string | null>(null);
  const [onlyMatching, setOnlyMatching] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/enrollments/${enrollment.id}/booking-options`);
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to load booking options");
      return;
    }
    const d: BookingOptions = await res.json();
    setData(d);
    if (!activeTeacher && d.teachers.length > 0) setActiveTeacher(d.teachers[0].id);
  }, [enrollment.id, activeTeacher]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function book(teacherId: string, dayOfWeek: number, startTime: string) {
    setBusy(`${teacherId}-${dayOfWeek}-${startTime}`);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId: enrollment.id, teacherId, dayOfWeek, startTime }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Booking failed");
      return;
    }
    onChanged();
    await load();
  }

  async function unbook(bookingId: string) {
    setBusy(bookingId);
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Remove failed");
      return;
    }
    onChanged();
    await load();
  }

  const teacher = data?.teachers.find((t) => t.id === activeTeacher) ?? null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center p-4">
        <div
          onClick={(ev) => ev.stopPropagation()}
          className="w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl my-4"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-card rounded-t-3xl">
            <div className="min-w-0">
              <h2 className="text-base font-bold inline-flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-primary" /> Book a Class
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {enrollment.student.name} ·{" "}
                <span className="font-semibold text-foreground">{enrollment.course.name}</span> ·{" "}
                {enrollment.course.classDuration} min
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !data ? null : (
              <>
                {/* Availability warning */}
                {!data.enrollment.hasAvailability && (
                  <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.08)] p-3 text-xs">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(var(--gold))]" />
                    <span>
                      No student availability set yet — slots can&apos;t be matched to the
                      student&apos;s free times. You can still book, but set their times first for
                      best results.
                    </span>
                  </div>
                )}

                {/* Existing bookings for this enrollment */}
                {data.myBookings.length > 0 && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold mb-2">Booked classes for this student</p>
                    <div className="space-y-1.5">
                      {data.myBookings.map((b) => {
                        const t = data.teachers.find((tt) => tt.id === b.teacherId);
                        return (
                          <div
                            key={b.id}
                            className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-[11px]"
                          >
                            <Clock className="h-3 w-3 text-primary shrink-0" />
                            <span className="font-semibold">{DAYS[b.dayOfWeek].short}</span>
                            <span>{formatSlotRange(b.startTime)} PKT</span>
                            <span className="text-muted-foreground truncate">
                              with {t?.name ?? "teacher"}
                            </span>
                            <button
                              onClick={() => unbook(b.id)}
                              disabled={busy === b.id}
                              className="ml-auto grid h-6 w-6 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                              title="Remove booking"
                            >
                              {busy === b.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {data.teachers.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    <User className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                    No teachers are assigned to this course. Assign a teacher in the Courses or
                    Teachers tab first.
                  </div>
                ) : (
                  <>
                    {/* Teacher tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {data.teachers.map((t) => {
                        const noShift = !t.shift;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setActiveTeacher(t.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              activeTeacher === t.id
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                                : "border border-border bg-card hover:bg-muted"
                            }`}
                          >
                            {t.shift === "DAY" ? (
                              <Sun className="h-3 w-3" />
                            ) : t.shift === "NIGHT" ? (
                              <Moon className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {t.name}
                            {noShift && (
                              <span className="text-[9px] opacity-70">(no shift)</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend + filter */}
                    <div className="flex items-center justify-between gap-3 flex-wrap text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" /> Matches student
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-card" /> Free
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30" /> Booked
                        </span>
                        <span className="font-semibold text-foreground">All times PKT</span>
                      </div>
                      {data.enrollment.hasAvailability && (
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={onlyMatching}
                            onChange={(e) => setOnlyMatching(e.target.checked)}
                            className="rounded border-border"
                          />
                          Only show matching slots
                        </label>
                      )}
                    </div>

                    {teacher && !teacher.shift ? (
                      <div className="rounded-xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.08)] p-4 text-xs text-center">
                        <AlertCircle className="mx-auto h-6 w-6 text-[hsl(var(--gold))] mb-2" />
                        {teacher.name} has no shift assigned. Set a Day or Night shift in the
                        Teachers tab to see bookable slots.
                      </div>
                    ) : teacher ? (
                      <TeacherSlotGrid
                        teacher={teacher}
                        busy={busy}
                        onlyMatching={onlyMatching}
                        onBook={book}
                      />
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherSlotGrid({
  teacher,
  busy,
  onlyMatching,
  onBook,
}: {
  teacher: TeacherOption;
  busy: string | null;
  onlyMatching: boolean;
  onBook: (teacherId: string, dayOfWeek: number, startTime: string) => void;
}) {
  // All unique slot times across days (shift slots are the same per day)
  const times = teacher.days[0]?.slots.map((s) => s.time) ?? [];

  const visibleTimes = onlyMatching
    ? times.filter((time) =>
        teacher.days.some((d) => {
          const s = d.slots.find((x) => x.time === time);
          return s?.matchesStudent && !s.booked;
        })
      )
    : times;

  if (times.length === 0) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-xs text-muted-foreground">
        No slots available for this shift.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-muted/40">
            <th className="sticky left-0 z-10 bg-muted/40 px-2 py-2 text-left font-semibold text-muted-foreground">
              Time (PKT)
            </th>
            {DAYS.map((d) => (
              <th key={d.id} className="px-1 py-2 text-center font-semibold text-muted-foreground">
                {d.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleTimes.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-2 py-6 text-center text-muted-foreground italic"
              >
                No free slots match the student&apos;s available times.
              </td>
            </tr>
          ) : (
            visibleTimes.map((time) => (
              <tr key={time} className="border-t border-border">
                <td className="sticky left-0 z-10 bg-card px-2 py-1.5 font-medium whitespace-nowrap">
                  {formatTime12h(time)}
                </td>
                {teacher.days.map((d) => {
                  const slot = d.slots.find((s) => s.time === time);
                  if (!slot) return <td key={d.day} className="px-1 py-1" />;
                  const key = `${teacher.id}-${d.day}-${time}`;
                  const isBusy = busy === key;

                  if (slot.booked) {
                    return (
                      <td key={d.day} className="px-1 py-1">
                        <div
                          className={`rounded-md px-1 py-1.5 text-center text-[9px] leading-tight ${
                            slot.bookedBy?.isThisStudent
                              ? "bg-primary/15 text-primary font-semibold"
                              : "bg-muted-foreground/15 text-muted-foreground"
                          }`}
                          title={
                            slot.bookedBy
                              ? `${slot.bookedBy.student} — ${slot.bookedBy.course}`
                              : "Booked"
                          }
                        >
                          {slot.bookedBy?.isThisStudent ? "This student" : "Booked"}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={d.day} className="px-1 py-1">
                      <button
                        onClick={() => onBook(teacher.id, d.day, time)}
                        disabled={isBusy}
                        title={
                          slot.matchesStudent
                            ? "Matches student's available time — click to book"
                            : "Free slot — click to book"
                        }
                        className={`w-full rounded-md px-1 py-1.5 text-center text-[9px] font-semibold transition-all disabled:opacity-50 ${
                          slot.matchesStudent
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40"
                            : "bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                        ) : slot.matchesStudent ? (
                          "Book ✓"
                        ) : (
                          "Book"
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
