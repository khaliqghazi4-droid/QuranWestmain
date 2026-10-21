"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
  Video,
  Check,
  BookOpen,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { FilterSelect } from "@/components/admin/filter-select";
import { AvailabilityDialog } from "@/components/availability/availability-editor";
import { DAYS, formatTime12h } from "@/lib/timezones";
import { formatSlotRange, SHIFT_RANGES } from "@/lib/shifts";

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
    // their own uploaded photo, if any
    image: string | null;
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
      {/* Toolbar, as on Enrollments: the navy filter with its own chevron, then search.
          Sizes and gaps are written out ([13px], [12px]…) in this file: the
          website's Bootstrap sheet overrides .p-5, .mt-4, .text-sm, .text-xs…
          relative z-[5]: the filter's menu opens over the cards below */}
      <div className="adm-glass relative z-[5] flex flex-wrap items-center gap-[12px] rounded-2xl border-[1px] border-border bg-card p-[16px]">
        <div className="flex shrink-0 items-center gap-[8px]">
          <div className="adm-icon adm-chip grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <FilterSelect
            label="Show"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All enrollments", count: enrollments.length },
              { value: "no-availability", label: "Needs student times", count: enrollments.filter((e) => e.availability.length === 0).length },
              { value: "not-booked", label: "Not booked yet", count: enrollments.filter((e) => e.bookings.length === 0).length },
              { value: "booked", label: "Has bookings", count: enrollments.filter((e) => e.bookings.length > 0).length },
            ]}
          />
        </div>
        <div className="flex-1" />
        <div className="relative w-full max-w-sm sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student or course..."
            className="w-full rounded-full border-[1px] border-border bg-background py-[8px] pl-[40px] pr-[16px] text-[13.5px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="adm-glass rounded-2xl border-[1px] border-dashed border-border bg-card/50 p-[48px] text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-[16px] text-[14px] text-muted-foreground">No enrollments match your filter</p>
        </div>
      ) : (
        <div className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
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

  // One tag for where this enrollment stands, top right
  const status = hasBookings
    ? { label: "Scheduled", cls: "bg-emerald-500/10 text-emerald-700" }
    : hasAvailability
      ? { label: "Not booked", cls: "bg-primary/10 text-primary" }
      : { label: "Needs times", cls: "bg-amber-500/15 text-amber-700" };

  return (
    // flex-col + mt-auto on the buttons: they line up along the bottom of a row
    <div className="adm-glass flex min-w-0 flex-col rounded-2xl border-[1px] border-border bg-card p-[16px]">
      <div className="flex items-start gap-[10px]">
        <Avatar name={e.student.name} src={e.student.image} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-[20px]">{e.student.name}</p>
          <p className="truncate text-[12px] leading-[17px] text-muted-foreground">{e.student.email}</p>
        </div>
        <span className={`shrink-0 rounded-full px-[8px] py-[2px] text-[11px] font-semibold leading-[16px] ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-[10px] flex flex-wrap items-center gap-x-[10px] gap-y-[6px] text-[11.5px] leading-[16px] text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-[5px] rounded-full bg-primary/10 px-[8px] py-[2px] font-semibold text-primary">
          <BookOpen className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{e.course.name}</span>
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <Globe className="h-3.5 w-3.5" /> {e.student.timezone}
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <Clock className="h-3.5 w-3.5" /> {e.course.classDuration} min class
        </span>
      </div>

      {/* Where it stands: the student's free times, and the booked classes */}
      <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
        <StatusTile
          icon={hasAvailability ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          tone={hasAvailability ? "ok" : "warn"}
          label="Student times"
          value={hasAvailability ? `${e.availability.length} ${e.availability.length === 1 ? "window" : "windows"} set` : "Not set yet"}
        />
        <StatusTile
          icon={<Calendar className="h-3.5 w-3.5" />}
          tone={hasBookings ? "ok" : "none"}
          label="Classes"
          value={hasBookings ? `${e.bookings.length} booked` : "None booked"}
        />
      </div>

      {hasBookings && (
        <ul className="adm-rows mt-[10px] divide-y divide-border overflow-hidden rounded-xl border-[1px] border-border">
          {e.bookings.map((b) => (
            <li
              key={b.id}
              title={`${DAYS[b.dayOfWeek].short} ${formatSlotRange(b.startTime)} PKT · ${b.teacherName}`}
              className="flex items-center gap-[8px] px-[10px] py-[7px] text-[12px] leading-[17px]"
            >
              <span className="adm-badge grid h-6 w-9 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-primary-foreground">
                {DAYS[b.dayOfWeek].short}
              </span>
              <span className="whitespace-nowrap font-semibold">{formatSlotRange(b.startTime)}</span>
              {/* only where the card is wide enough beside the time and teacher (the row's tooltip always has it) */}
              <span className="hidden text-muted-foreground sm:inline lg:hidden 2xl:inline">PKT</span>
              <span className="ml-auto inline-flex min-w-0 items-center gap-[5px] text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{b.teacherName}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto grid grid-cols-2 gap-[8px] pt-[14px]">
        <button
          onClick={onEdit}
          className={`inline-flex items-center justify-center gap-[6px] rounded-full px-[10px] py-[8px] text-[12.5px] font-semibold leading-[17px] transition-all ${
            hasAvailability
              ? "border-[1px] border-border bg-background/70 text-foreground hover:bg-muted"
              : "bg-gradient-to-r from-[hsl(var(--gold))] to-amber-500 text-[hsl(220_32%_10%)] shadow-md"
          }`}
        >
          <Calendar className="h-4 w-4" />
          {hasAvailability ? "Edit Times" : "Set Times"}
        </button>
        <button
          onClick={onBook}
          className="inline-flex items-center justify-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[12px] py-[9px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md"
        >
          <CalendarPlus className="h-4 w-4" /> Book Class
        </button>
      </div>
    </div>
  );
}

// A small status box: icon in a tinted circle, label, then the value
function StatusTile({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: "ok" | "warn" | "none";
  label: string;
  value: string;
}) {
  const iconCls =
    tone === "ok"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-600"
        : "bg-muted text-muted-foreground";
  return (
    <div className="adm-tile flex min-w-0 items-center gap-[8px] rounded-xl border-[1px] border-border bg-background/60 p-[8px]">
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${iconCls}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold leading-[16px]">{label}</p>
        <p className="truncate text-[11.5px] leading-[15px] text-muted-foreground">{value}</p>
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
    <AvailabilityDialog
      title="Student's available times"
      subtitle={`${enrollment.student.name} · ${enrollment.course.name} · ${enrollment.course.classDuration} min class`}
      onClose={onClose}
      saveUrl={`/api/enrollments/${enrollment.id}/availability`}
      initialTimezone={enrollment.student.timezone}
      initialSlots={enrollment.availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      }))}
      description="The hours this student can attend each week, in their own time zone."
      onSaved={onSaved}
    />
  );
}

// ---- Booking Modal (the core feature) ----

type SlotStatus = {
  time: string;
  available: boolean;
  booked: boolean;
  bookedBy: { student: string; course: string; isThisStudent: boolean } | null;
  matchesStudent: boolean;
};
type TeacherOption = {
  id: string;
  name: string;
  shift: "DAY" | "NIGHT" | null;
  country: string | null;
  timezone: string;
  // Where the slots come from: the teacher's own available hours, else their shift
  source: "availability" | "shift" | "none";
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

// The slot the admin clicked, waiting for Done in the confirm box
type PendingBooking = {
  teacherId: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
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

  const [data, setData] = React.useState<BookingOptions | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [activeTeacher, setActiveTeacher] = React.useState<string | null>(null);
  const [showAllTeacherSlots, setShowAllTeacherSlots] = React.useState(false);
  const [pending, setPending] = React.useState<PendingBooking | null>(null);

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

  // Done in the confirm box. Returns an error message to show in the box, or
  // null on success.
  async function confirmBooking(): Promise<string | null> {
    if (!pending) return null;
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollmentId: enrollment.id,
        teacherId: pending.teacherId,
        dayOfWeek: pending.dayOfWeek,
        startTime: pending.startTime,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return d.error ?? "Booking failed";
    }
    setPending(null);
    onChanged();
    await load();
    return null;
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
  // Default to times that suit both the student and the teacher; without student
  // availability there's nothing to match against, so show all teacher slots
  const matchingOnly = !!data?.enrollment.hasAvailability && !showAllTeacherSlots;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center p-4">
        <div
          onClick={(ev) => ev.stopPropagation()}
          className="adm-modal w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl my-4"
        >
          {/* Header */}
          {/* Same header as the Student's available times pop-up: navy icon
              square, title, then student · course · length */}
          <div className="sticky top-0 z-20 flex items-center gap-[12px] rounded-t-3xl border-b border-border bg-card px-[20px] py-[16px] sm:px-[24px]">
            <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
              <CalendarPlus className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold leading-[24px]">Book a class</h2>
              <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">
                {enrollment.student.name} · {enrollment.course.name} · {enrollment.course.classDuration} min class
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

            {loading && !data ? (
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
                    {/* Teacher list */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Choose a teacher</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {data.teachers.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setActiveTeacher(t.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              activeTeacher === t.id
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                                : "border border-border bg-card hover:bg-muted"
                            }`}
                          >
                            <TeacherSourceIcon teacher={t} className="h-3 w-3" />
                            {t.name}
                            {t.source === "none" && (
                              <span className="text-[9px] opacity-70">(no hours)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Who the class is being booked with, and which times are shown */}
                    {teacher && teacher.source !== "none" && (
                      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
                          <TeacherSourceIcon teacher={teacher} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold">Booking with {teacher.name}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {matchingOnly
                              ? `Showing times when ${enrollment.student.name} and ${teacher.name} are both free (PKT).`
                              : `Showing all of ${teacher.name}'s available hours (PKT).`}
                            {teacher.source === "shift" && teacher.shift && (
                              <>
                                {" "}
                                {teacher.name} hasn&apos;t set available hours, so their{" "}
                                {SHIFT_RANGES[teacher.shift].label} shift is used.
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Legend + filter */}
                    <div className="flex items-center justify-between gap-3 flex-wrap text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
                          {matchingOnly ? "Both free — click to book" : "Matches student"}
                        </span>
                        {!matchingOnly && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-sm border border-border bg-card" /> Teacher free only
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30" /> Booked
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold text-muted-foreground/50">–</span> Not available
                        </span>
                        <span className="font-semibold text-foreground">All times PKT</span>
                      </div>
                      {data.enrollment.hasAvailability && teacher && teacher.source !== "none" && (
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showAllTeacherSlots}
                            onChange={(e) => setShowAllTeacherSlots(e.target.checked)}
                            className="rounded border-border"
                          />
                          Show all of {teacher.name}&apos;s slots
                        </label>
                      )}
                    </div>

                    {teacher && teacher.source === "none" ? (
                      <div className="rounded-xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.08)] p-4 text-xs text-center">
                        <AlertCircle className="mx-auto h-6 w-6 text-[hsl(var(--gold))] mb-2" />
                        {teacher.name} has no available hours or shift set. Set them in the
                        Teachers tab to see bookable slots.
                      </div>
                    ) : teacher ? (
                      <TeacherSlotGrid
                        teacher={teacher}
                        studentName={enrollment.student.name}
                        matchingOnly={matchingOnly}
                        onShowAll={() => setShowAllTeacherSlots(true)}
                        onPick={(dayOfWeek, startTime) =>
                          setPending({
                            teacherId: teacher.id,
                            teacherName: teacher.name,
                            dayOfWeek,
                            startTime,
                          })
                        }
                      />
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>

          {pending && (
            <ConfirmBookingDialog
              booking={pending}
              studentName={enrollment.student.name}
              courseName={enrollment.course.name}
              onClose={() => setPending(null)}
              onConfirm={confirmBooking}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Clock = own available hours, sun/moon = shift fallback, alert = nothing set
function TeacherSourceIcon({ teacher, className }: { teacher: TeacherOption; className: string }) {
  if (teacher.source === "availability") return <Clock className={className} />;
  if (teacher.shift === "DAY") return <Sun className={className} />;
  if (teacher.shift === "NIGHT") return <Moon className={className} />;
  return <AlertCircle className={className} />;
}

function TeacherSlotGrid({
  teacher,
  studentName,
  matchingOnly,
  onPick,
  onShowAll,
}: {
  teacher: TeacherOption;
  studentName: string;
  // Only times that suit both the student and the teacher are bookable
  matchingOnly: boolean;
  onPick: (dayOfWeek: number, startTime: string) => void;
  // Turns off matchingOnly, from the note under the grid
  onShowAll: () => void;
}) {
  // Every day carries the same row times
  const times = teacher.days[0]?.slots.map((s) => s.time) ?? [];

  // In matching mode keep rows with a bookable cell, or one of this student's
  // existing classes so those stay visible
  const visibleTimes = matchingOnly
    ? times.filter((time) =>
        teacher.days.some((d) => {
          const s = d.slots.find((x) => x.time === time);
          if (!s) return false;
          if (s.booked) return !!s.bookedBy?.isThisStudent;
          return s.available && s.matchesStudent;
        })
      )
    : times;

  if (times.length === 0) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-xs text-muted-foreground">
        No available slots for this teacher.
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
                No times when {studentName} and {teacher.name} are both free. Tick
                &quot;Show all of {teacher.name}&apos;s slots&quot;, or add more availability.
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

                  if (!slot.available || (matchingOnly && !slot.matchesStudent)) {
                    return (
                      <td key={d.day} className="px-1 py-1">
                        <div
                          className="py-1.5 text-center text-[9px] text-muted-foreground/40"
                          title={slot.available ? "Student not available" : "Teacher not available"}
                        >
                          –
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={d.day} className="px-1 py-1">
                      <button
                        onClick={() => onPick(d.day, time)}
                        title={
                          slot.matchesStudent
                            ? "Matches student's available time — click to book"
                            : "Free slot — click to book"
                        }
                        className={`w-full rounded-md px-1 py-1.5 text-center text-[9px] font-semibold transition-all ${
                          slot.matchesStudent
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40"
                            : "bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {slot.matchesStudent ? "Book ✓" : "Book"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Says what the filter hides: without it the short grid looked cut off */}
      {matchingOnly && visibleTimes.length > 0 && visibleTimes.length < times.length && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <span>
            Only the times {studentName} and {teacher.name} are both free.{" "}
            {times.length - visibleTimes.length} more of {teacher.name}&apos;s times are hidden.
          </span>
          <button type="button" onClick={onShowAll} className="font-semibold text-primary hover:underline">
            Show all {times.length} times
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmBookingDialog({
  booking,
  studentName,
  courseName,
  onClose,
  onConfirm,
}: {
  booking: PendingBooking;
  studentName: string;
  courseName: string;
  onClose: () => void;
  onConfirm: () => Promise<string | null>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    // On success the parent closes (unmounts) this dialog
    const err = await onConfirm();
    if (err) {
      setError(err);
      setSaving(false);
    }
  }

  const details = [
    { label: "Teacher", value: booking.teacherName },
    { label: "Student", value: studentName },
    { label: "Course", value: courseName },
    {
      label: "When",
      value: `Every ${DAYS[booking.dayOfWeek].long}, ${formatSlotRange(booking.startTime)} PKT`,
    },
  ];

  // Portal out of the booking modal: its backdrop-blur would otherwise become the
  // containing block for this fixed overlay and scroll it out of view. Into the
  // dashboard shell, not <body>, so the admin colours (.admin-brand) still apply.
  // React events still bubble to the booking modal card, which stops them there.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="adm-modal w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-bold inline-flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-primary" /> Confirm Class
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <dl className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 text-xs">
            {details.map((d) => (
              <div key={d.label} className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted-foreground">{d.label}</dt>
                <dd className="font-semibold min-w-0 break-words">{d.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
            <Video className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <span>
              This class runs in the academy&apos;s in-app Jitsi room. The teacher and student
              join from their Classes / Schedule page.
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Done
          </button>
        </div>
      </div>
    </div>,
    document.querySelector(".admin-dashboard") ?? document.body
  );
}
