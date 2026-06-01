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
  Award,
  Sun,
  Moon,
  BookOpen,
  Users,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SHIFT_RANGES } from "@/lib/shifts";
import { TeacherProfileEditor } from "./profile-editor";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-6">
      <Link
        href="/app/admin/teachers"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Teachers
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary via-accent to-primary relative">
          <div className="absolute -bottom-12 left-6">
            <Avatar
              name={teacher.name}
              size={96}
              style="micah"
              className="rounded-2xl border-4 border-card shadow-xl"
            />
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold inline-flex items-center gap-2">
                {teacher.name}
                <Award className="h-5 w-5 text-[hsl(var(--gold))]" />
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {shift && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {shift === "DAY" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                    {SHIFT_RANGES[shift].label}
                  </span>
                )}
                {gender && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      gender === "MALE"
                        ? "bg-sky-500/10 text-sky-600"
                        : "bg-pink-500/10 text-pink-600"
                    }`}
                  >
                    {gender === "MALE" ? "♂ Male" : "♀ Female"}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {teacher.email}
                </span>
                {teacher.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {teacher.phone}
                  </span>
                )}
                {teacher.country && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> {teacher.country}
                  </span>
                )}
                {teacher.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {teacher.address}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Joined{" "}
                  {teacher.createdAt.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {teacher.bio && (
                <p className="mt-3 text-sm text-foreground max-w-3xl">{teacher.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={courses.length}
          color="from-primary to-accent"
        />
        <StatCard
          icon={Users}
          label="Students"
          value={totalStudents}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={Calendar}
          label="Classes"
          value={teacher.teacherBookings.length}
          color="from-fuchsia-500 to-purple-500"
        />
        <StatCard
          icon={GraduationCap}
          label="Files"
          value={teacher.files.length}
          color="from-[hsl(var(--gold))] to-amber-500"
        />
      </div>

      {/* Editor (client) — handles profile fields + file uploads */}
      <TeacherProfileEditor
        teacher={{
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          country: teacher.country,
          address: teacher.address,
          bio: teacher.bio,
        }}
        files={{
          resumes: resumes.map(serialize),
          certificates: certs.map(serialize),
          others: others.map(serialize),
        }}
      />

      {/* Courses */}
      <Section title="Courses Teaching" empty="Not assigned to any course yet">
        {courses.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-background p-4 flex items-center gap-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate inline-flex items-center gap-1.5">
                    {c.name}
                    {c.isPrimary && (
                      <span className="rounded-full bg-[hsl(var(--gold)/0.15)] px-1.5 py-0.5 text-[9px] font-bold text-[hsl(var(--gold))]">
                        PRIMARY
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {c.students} students
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Booked classes */}
      <Section title="Scheduled Classes" empty="No classes booked yet (book from the Scheduling tab)">
        {teacher.teacherBookings.length > 0 && (
          <div className="space-y-2">
            {teacher.teacherBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
              >
                <span className="text-sm font-bold text-primary w-12">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][b.dayOfWeek]}
                </span>
                <span className="text-sm font-mono inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {b.startTime} PKT ·{" "}
                  {b.duration}m
                </span>
                <span className="ml-auto text-sm text-muted-foreground truncate">
                  {b.enrollment.student.name} · {b.enrollment.course.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-primary-foreground shadow-md`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children ?? <p className="text-sm text-muted-foreground italic">{empty}</p>}
      {/* If children is empty array / null, fall back to empty */}
    </div>
  );
}
