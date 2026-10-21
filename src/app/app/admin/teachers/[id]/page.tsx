import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  CalendarDays,
  Sun,
  Moon,
  BookOpen,
  Users,
  Clock,
  FileText,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SHIFT_RANGES } from "@/lib/shifts";
import { formatTime12h } from "@/lib/timezones";
import { EditProfileButton, TeacherDocuments } from "./profile-editor";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Sizes and gaps are written out ([13px], [16px]…) throughout: the website's
// Bootstrap sheet overrides .text-sm, .text-xs, .gap-3, .border and friends.
export default async function AdminTeacherDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const teacher = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      teacherCourses: {
        include: { _count: { select: { enrollments: true } } },
      },
      courseTeacherships: {
        include: {
          course: { include: { _count: { select: { enrollments: true } } } },
        },
      },
      teacherBookings: {
        include: {
          enrollment: {
            include: {
              student: { select: { name: true } },
              course: { select: { name: true } },
            },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      files: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!teacher || teacher.role !== "TEACHER") notFound();

  // Merge primary + co-taught courses
  const courseMap = new Map<
    string,
    { id: string; name: string; students: number; isPrimary: boolean }
  >();
  for (const c of teacher.teacherCourses) {
    courseMap.set(c.id, {
      id: c.id,
      name: c.name,
      students: c._count.enrollments,
      isPrimary: true,
    });
  }
  for (const ct of teacher.courseTeacherships) {
    if (!courseMap.has(ct.course.id)) {
      courseMap.set(ct.course.id, {
        id: ct.course.id,
        name: ct.course.name,
        students: ct.course._count.enrollments,
        isPrimary: false,
      });
    }
  }
  const courses = Array.from(courseMap.values());
  const totalStudents = courses.reduce((s, c) => s + c.students, 0);

  const shift = teacher.shift;
  const gender = teacher.gender as "MALE" | "FEMALE" | null;

  const resumes = teacher.files.filter((f) => f.kind === "resume");
  const certs = teacher.files.filter((f) => f.kind === "certificate");
  const others = teacher.files.filter((f) => f.kind === "other");

  // The week from Monday, each day with its classes in time order
  const week = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => ({ day: d, classes: teacher.teacherBookings.filter((b) => b.dayOfWeek === d) }))
    .filter((d) => d.classes.length > 0);

  const joined = teacher.createdAt.toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const stats = [
    { icon: BookOpen, label: "Courses", value: courses.length },
    { icon: Users, label: "Students", value: totalStudents },
    { icon: Calendar, label: "Classes / week", value: teacher.teacherBookings.length },
    { icon: FileText, label: "Documents", value: teacher.files.length },
  ];

  const contact = [
    { icon: Mail, label: "Email", value: teacher.email },
    { icon: Phone, label: "Phone", value: teacher.phone },
    { icon: Globe, label: "Country", value: teacher.country },
    { icon: MapPin, label: "Address", value: teacher.address },
  ];

  const editable = {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    country: teacher.country,
    address: teacher.address,
    bio: teacher.bio,
  };

  return (
    <div className="space-y-[20px]">
      <Link
        href="/app/admin/teachers"
        // a glass pill: it sits straight on the background video
        className="adm-glass inline-flex items-center gap-[8px] rounded-full border-[1px] border-border bg-card px-[14px] py-[7px] text-[13px] font-semibold leading-[18px] transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Teachers
      </Link>

      {/* Top row: the header card with About beside it (same height), so the
          three cards below can line up across the page */}
      <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Header: banner, photo across its edge, name, tags and buttons, then
            the four counts as one strip along the bottom (mt-auto: it stays at
            the bottom when About beside it is the taller card) */}
        <div className="adm-glass flex flex-col overflow-hidden rounded-2xl border-[1px] border-border bg-card">
          <div className="adm-cover relative h-[112px] overflow-hidden bg-gradient-to-br from-primary via-accent to-primary">
            <span className="absolute right-[16px] top-[16px] z-[1] inline-flex items-center gap-[6px] rounded-full bg-white/15 px-[12px] py-[5px] text-[12px] font-semibold leading-[16px] text-white ring-1 ring-white/25 backdrop-blur-sm">
              <CalendarDays className="h-3.5 w-3.5" /> Joined {joined}
            </span>
          </div>
  
          <div className="px-[20px] pb-[20px] sm:px-[28px]">
            {/* items-start: the photo rises 56px into the banner while the name
                keeps clear of it */}
            <div className="flex flex-wrap items-start justify-between gap-[16px]">
              <div className="flex min-w-0 flex-wrap items-start gap-x-[20px] gap-y-[8px]">
                <div className="relative z-[1] -mt-[56px] shrink-0">
                  <Avatar
                    name={teacher.name}
                    src={teacher.image}
                    size={112}
                    className="border-4 border-card shadow-[0_14px_30px_-12px_rgb(0_0_0/0.45)]"
                  />
                </div>
                <div className="min-w-0 pt-[16px]">
                  <h1 className="break-words text-[26px] font-bold leading-[32px]">{teacher.name}</h1>
                  <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
                    <Tag icon={<UserRound className="h-3.5 w-3.5" />}>Teacher</Tag>
                    {shift ? (
                      <Tag icon={shift === "DAY" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}>
                        {SHIFT_RANGES[shift].label}
                      </Tag>
                    ) : (
                      <Tag muted>No shift set</Tag>
                    )}
                    {gender && (
                      <Tag icon={<span aria-hidden="true">{gender === "MALE" ? "♂" : "♀"}</span>}>
                        {gender === "MALE" ? "Male" : "Female"}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[8px] sm:pt-[24px]">
                <a
                  href={`mailto:${teacher.email}`}
                  className="inline-flex items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[16px] py-[9px] text-[13px] font-semibold leading-[18px] transition-colors hover:border-primary/40"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
                <EditProfileButton teacher={editable} />
              </div>
            </div>
          </div>
  
          <div className="adm-rows mt-auto grid grid-cols-2 border-t border-border sm:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center gap-[12px] px-[20px] py-[16px] sm:px-[28px] ${
                  i % 2 === 1 ? "border-l border-border" : ""
                } ${i >= 2 ? "border-t border-border sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}
              >
                <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                  <s.icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[20px] font-bold leading-[24px]">{s.value}</p>
                  <p className="text-[12px] leading-[16px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card title="About">
          <div className="px-[20px] pb-[20px]">
            <p className="whitespace-pre-line text-[13.5px] leading-[22px]">
              {teacher.bio?.trim() || <span className="italic text-muted-foreground">No bio added yet.</span>}
            </p>
            {/* One line per detail (label left, value right), so About stays
                about as tall as the header card beside it */}
            <dl className="mt-[14px] divide-y divide-border border-t border-border">
              {contact.map((c) => (
                <div key={c.label} className="flex items-center gap-[10px] py-[10px]">
                  <span className="adm-icon grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <c.icon className="h-3.5 w-3.5" />
                  </span>
                  {/* font-normal / mb-[0px]: Bootstrap makes dt bold and gives dd a bottom margin */}
                  <dt className="shrink-0 text-[12.5px] font-normal leading-[18px] text-muted-foreground">{c.label}</dt>
                  <dd
                    // pr: room for the italic "Not set", whose t leans past the clip edge
                    className="mb-[0px] min-w-0 flex-1 truncate pr-[2px] text-right text-[13px] font-medium leading-[18px]"
                    title={c.value?.trim() || undefined}
                  >
                    {c.value?.trim() || <span className="font-normal italic text-muted-foreground">Not set</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </div>

      {/* Courses, weekly classes and documents side by side, equal height */}
      <div className="grid gap-[20px] md:grid-cols-2 lg:grid-cols-3">
        <Card title="Courses teaching" count={courses.length}>
          {courses.length === 0 ? (
            <Empty icon={<BookOpen className="h-5 w-5" />}>Not assigned to any course yet.</Empty>
          ) : (
            <ul className="adm-rows divide-y divide-border">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center gap-[12px] px-[20px] py-[14px]">
                  <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <BookOpen className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold leading-[20px]">{c.name}</p>
                    <p className="text-[12px] leading-[16px] text-muted-foreground">
                      {c.isPrimary ? "Main teacher" : "Co-teacher"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-[6px] rounded-full bg-primary/10 px-[10px] py-[3px] text-[12px] font-semibold leading-[18px] text-primary">
                    <Users className="h-3.5 w-3.5" /> {c.students} {c.students === 1 ? "student" : "students"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Weekly classes"
          count={teacher.teacherBookings.length}
          action={
            <Link
              href="/app/admin/availability"
              className="text-[13px] font-semibold leading-[18px] text-primary hover:underline"
            >
              Open scheduling
            </Link>
          }
        >
          {week.length === 0 ? (
            <Empty icon={<Calendar className="h-5 w-5" />}>No classes booked yet.</Empty>
          ) : (
            <ul className="adm-rows divide-y divide-border">
              {week.map((d) => (
                <li key={d.day} className="flex gap-[16px] px-[20px] py-[14px]">
                  <span className="adm-badge grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-[13px] font-bold leading-[18px] text-primary-foreground">
                    {DAYS[d.day]}
                  </span>
                  <div className="min-w-0 flex-1 space-y-[8px]">
                    {d.classes.map((b) => (
                      <div key={b.id} className="flex flex-wrap items-center gap-x-[12px] gap-y-[2px]">
                        <span className="inline-flex items-center gap-[6px] text-[13.5px] font-semibold leading-[20px]">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatTime12h(b.startTime)} PKT
                          <span className="font-normal text-muted-foreground">· {b.duration} min</span>
                        </span>
                        <span className="min-w-0 truncate text-[13px] leading-[20px] text-muted-foreground">
                          {b.enrollment.student.name} · {b.enrollment.course.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <TeacherDocuments
          teacherId={teacher.id}
          files={{
            resumes: resumes.map(serialize),
            certificates: certs.map(serialize),
            others: others.map(serialize),
          }}
        />
      </div>
    </div>
  );
}

function serialize(f: {
  id: string;
  kind: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  uploadedAt: Date;
}) {
  return {
    id: f.id,
    kind: f.kind,
    name: f.name,
    url: f.url,
    mimeType: f.mimeType,
    size: f.size,
    uploadedAt: f.uploadedAt.toISOString(),
  };
}

// A small rounded tag under the name (navy tint in the light admin)
function Tag({
  icon,
  muted = false,
  children,
}: {
  icon?: React.ReactNode;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[12px] font-semibold leading-[18px] ${
        muted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
      }`}
    >
      {icon}
      {children}
    </span>
  );
}

// A glass card with a title row (title, optional count, optional link on the right)
function Card({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="adm-glass overflow-hidden rounded-2xl border-[1px] border-border bg-card">
      <div className="flex items-center justify-between gap-[12px] px-[20px] py-[16px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="text-[16px] font-bold leading-[22px]">{title}</h2>
          {count !== undefined && (
            <span className="rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-bold leading-[16px] text-primary">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-[20px] mb-[20px] flex items-center gap-[12px] rounded-xl border-[1px] border-dashed border-border px-[16px] py-[14px] text-[13px] leading-[18px] text-muted-foreground">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">{icon}</span>
      {children}
    </div>
  );
}
