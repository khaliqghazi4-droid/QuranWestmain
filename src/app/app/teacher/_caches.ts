import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import { buildWeekDays, weekTotalMs } from "@/lib/attendance-week";

// Per-teacher data caches. Teacher pages read the session (cookies), so they
// render dynamically on every request — these keep the DB work cached instead.
// Each cache is keyed by its arguments (teacherId, …) and is cleared by
// revalidatePath("/app/teacher", "layout") in the API routes that change it.
// unstable_cache stores JSON, so every function returns plain data (no Dates).

const TTL = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

// Trial sessions stay listed for 12h after their start time
export const TRIAL_GRACE_MS = 12 * 60 * 60 * 1000;

export type TrialItem = {
  id: string;
  student: string;
  courseName: string;
  trialTime: string;
  classHref: string;
};

export const getTeacherDashboardData = unstable_cache(
  async (teacherId: string, todayISO: string) => {
    const today = new Date(todayISO);
    const sevenDaysAgo = new Date(today.getTime() - 6 * DAY_MS);
    const [me, courses, enrollments, bookings, weekRecords] = await Promise.all([
      prisma.user.findUnique({ where: { id: teacherId }, select: { shift: true } }),
      prisma.course.findMany({
        where: { teacherId },
        select: {
          id: true,
          name: true,
          level: true,
          price: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.enrollment.findMany({
        where: { course: { teacherId } },
        select: {
          id: true,
          progress: true,
          student: { select: { id: true, name: true } },
          course: { select: { name: true } },
        },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
      prisma.bookingSlot.findMany({
        where: { teacherId },
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          enrollment: {
            select: {
              student: { select: { name: true } },
              course: { select: { name: true } },
            },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
      prisma.teacherAttendance.findMany({
        where: { teacherId, date: { gte: sevenDaysAgo, lte: today } },
      }),
    ]);

    const todayRecord = weekRecords.find((r) => r.date.getTime() === today.getTime()) ?? null;
    return {
      shift: me?.shift ?? null,
      courses,
      enrollments,
      bookings,
      workdayInitial: {
        signedIn: !!todayRecord,
        signedOut: !!todayRecord?.signOutAt,
        signInAt: todayRecord?.signInAt.toISOString() ?? null,
        signOutAt: todayRecord?.signOutAt?.toISOString() ?? null,
      },
      weekDays: buildWeekDays(weekRecords),
      weekHours: weekTotalMs(weekRecords),
    };
  },
  ["teacher-dashboard"],
  { revalidate: TTL }
);

export const getTeacherClassesData = unstable_cache(
  async (teacherId: string) => {
    const [bookings, assignments] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: { teacherId },
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          duration: true,
          enrollment: {
            select: {
              student: { select: { name: true, country: true } },
              course: { select: { name: true, level: true } },
            },
          },
        },
      }),
      prisma.trialAssignment.findMany({
        where: {
          teacherId,
          trialTime: { gte: new Date(Date.now() - TRIAL_GRACE_MS) },
        },
        orderBy: { trialTime: "asc" },
      }),
    ]);

    // Resolve trial sessions the admin has explicitly assigned to this teacher.
    // Only requests still in Free Trials count — once converted to a student or
    // taken out of trials, the assignment no longer shows.
    let trials: TrialItem[] = [];
    if (assignments.length > 0) {
      try {
        const enrollments = await getWebsiteEnrollments({ inTrials: true });
        const enrollById = new Map(enrollments.map((e) => [e.id, e]));
        trials = assignments
          .map((a) => {
            const e = enrollById.get(a.mongoEnrollmentId);
            if (!e) return null;
            return {
              id: a.id,
              student: e.fullName,
              courseName: e.course,
              trialTime: a.trialTime.toISOString(),
              classHref: `/app/teacher/class/trial-${a.id}`,
            };
          })
          .filter((x): x is TrialItem => x !== null);
      } catch {
        trials = [];
      }
    }

    return { bookings, trials };
  },
  ["teacher-classes"],
  { revalidate: TTL }
);

export const getTeacherStudents = unstable_cache(
  async (teacherId: string) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { course: { teacherId } },
      include: {
        student: {
          select: { id: true, name: true, email: true, country: true, createdAt: true },
        },
        course: { select: { id: true, name: true, level: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    // Deduplicate students (one student may be in multiple of teacher's courses)
    const studentMap = new Map<string, {
      student: typeof enrollments[number]["student"];
      enrollments: { id: string; courseName: string; level: string; progress: number }[];
    }>();

    for (const e of enrollments) {
      const sid = e.student.id;
      const existing = studentMap.get(sid);
      const enrollEntry = {
        id: e.id,
        courseName: e.course.name,
        level: e.course.level,
        progress: e.progress,
      };
      if (existing) {
        existing.enrollments.push(enrollEntry);
      } else {
        studentMap.set(sid, { student: e.student, enrollments: [enrollEntry] });
      }
    }

    return Array.from(studentMap.values()).map((v) => ({
      id: v.student.id,
      name: v.student.name,
      email: v.student.email,
      country: v.student.country,
      createdAt: v.student.createdAt.toISOString(),
      enrollments: v.enrollments,
    }));
  },
  ["teacher-students"],
  { revalidate: TTL }
);

export const getTeacherLessonCourses = unstable_cache(
  async (teacherId: string) => {
    const courses = await prisma.course.findMany({
      where: { teacherId },
      select: { id: true, name: true, level: true, _count: { select: { lessons: true } } },
      orderBy: { name: "asc" },
    });
    return courses.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      lessonCount: c._count.lessons,
    }));
  },
  ["teacher-lesson-courses"],
  { revalidate: TTL }
);

export const getCourseLessonsData = unstable_cache(
  async (courseId: string) => {
    const [lessons, enrolled] = await Promise.all([
      prisma.lesson.findMany({
        where: { courseId },
        orderBy: { order: "asc" },
        include: {
          _count: { select: { completions: true } },
          assignments: {
            include: { student: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.enrollment.findMany({
        where: { courseId },
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { startedAt: "asc" },
      }),
    ]);

    return {
      enrolledStudents: enrolled.map((e) => ({
        id: e.student.id,
        name: e.student.name,
        email: e.student.email,
      })),
      lessons: lessons.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        content: l.content,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        fileUrl: l.fileUrl,
        duration: l.duration,
        order: l.order,
        isPublished: l.isPublished,
        completionsCount: l._count.completions,
        assignedTo: l.assignments.map((a) => ({
          id: a.student.id,
          name: a.student.name,
        })),
      })),
    };
  },
  ["teacher-course-lessons"],
  { revalidate: TTL }
);

export const getTeacherProfile = unstable_cache(
  async (teacherId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        timezone: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });
    return user ? { ...user, createdAt: user.createdAt.toISOString() } : null;
  },
  ["teacher-profile"],
  { revalidate: TTL }
);
