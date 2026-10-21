import Link from "next/link";
import { ArrowUpRight, CalendarDays, Mail, MapPin, Repeat } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { IconBadge } from "@/components/dashboard/icon-badge";
import { type AdminClass, weeklySlots } from "../class-format";
import { WEEKS_AHEAD } from "../shell";

export type ScheduleStudent = {
  name: string;
  email: string;
  country: string | null;
  image: string | null;
  trial: boolean;
};

// The top of a student's schedule page: photo, name and contact, a link to
// their profile (or Free Trials), and their weekly timetable
export function StudentCard({
  studentKey,
  student,
  classes,
}: {
  studentKey: string;
  student: ScheduleStudent;
  classes: AdminClass[];
}) {
  const slots = weeklySlots(classes);

  // Sizes written out: Bootstrap's .text-sm/.text-xs have no line height
  return (
    <div className="adm-glass rounded-2xl border-[1px] border-border bg-card p-[20px] sm:p-[24px]">
      <div className="flex flex-wrap items-center gap-[16px]">
        <Avatar name={student.name} src={student.image} size={64} />
        {/* min-w: on phones the profile button wraps under the name rather
            than squeezing it into a narrow column */}
        <div className="min-w-[180px] flex-1">
          <h1 className="flex flex-wrap items-center gap-[8px] text-[20px] font-bold leading-[28px]">
            <span className="min-w-0 break-words">{student.name}</span>
            {student.trial && (
              <span className="rounded-full bg-amber-500/15 px-[8px] py-[2px] text-[11px] font-bold leading-[16px] text-amber-700">
                Free trial
              </span>
            )}
          </h1>
          <div className="mt-[6px] flex flex-wrap gap-x-[16px] gap-y-[4px] text-[13px] leading-[19px] text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-[8px]">
              <IconBadge icon={Mail} />
              <span className="truncate">{student.email}</span>
            </span>
            {student.country && (
              <span className="inline-flex items-center gap-[8px]">
                <IconBadge icon={MapPin} /> {student.country}
              </span>
            )}
          </div>
        </div>
        <Link
          href={student.trial ? "/app/admin/trials" : `/app/admin/students/${studentKey}`}
          className="inline-flex shrink-0 items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[14px] py-[8px] text-[13px] font-semibold leading-[18px] transition-colors hover:border-primary/40 hover:text-primary"
        >
          {student.trial ? "Open Free Trials" : "View profile"}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <span className="mt-[20px] block text-[10px] font-bold uppercase leading-[14px] tracking-[0.1em] text-muted-foreground">
        {student.trial ? "Free trial class" : "Weekly timetable · PKT"}
      </span>
      {student.trial || slots.length === 0 ? (
        <p className="mt-[8px] text-[13px] leading-[19px] text-muted-foreground">
          {student.trial ? (
            "One trial class, listed below. Weekly classes start once they are added as a student."
          ) : (
            <>
              No weekly classes booked yet. Book them on the{" "}
              <Link href="/app/admin/availability" className="font-semibold text-primary hover:underline">
                Scheduling
              </Link>{" "}
              page.
            </>
          )}
        </p>
      ) : (
        <div className="mt-[10px] grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <div
              key={`${slot.day} ${slot.time}`}
              className="adm-tile flex items-center gap-[12px] rounded-xl border-[1px] border-border bg-background/60 p-[12px]"
            >
              <div className="adm-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-[13px] font-bold leading-[16px] text-primary">
                {slot.day}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold leading-[20px]">
                  {slot.time} – {slot.endTime}
                </p>
                <p className="truncate text-[12px] leading-[18px] text-muted-foreground">
                  {slot.courseName} · with {slot.teacherName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!student.trial && slots.length > 0 && (
        <p className="mt-[12px] flex flex-wrap items-center gap-x-[16px] gap-y-[6px] text-[12px] leading-[18px] text-muted-foreground">
          <span className="inline-flex items-center gap-[8px]">
            <IconBadge icon={Repeat} />
            {slots.length} {slots.length === 1 ? "class" : "classes"} a week
          </span>
          <span className="inline-flex items-center gap-[8px]">
            <IconBadge icon={CalendarDays} />
            {classes.length} in the next {WEEKS_AHEAD} weeks
          </span>
        </p>
      )}
    </div>
  );
}
