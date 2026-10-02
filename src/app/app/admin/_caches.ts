import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STUDENT } from "@/lib/auth";
import { RECORDINGS_TAG } from "@/lib/recordings";
import { getWebsiteEnrollments } from "@/lib/enroll-source";
import { pktDayMidnightUTC } from "@/lib/pkt-day";

const ATTENDANCE_DAYS = 7;

export const getCachedDashboard = unstable_cache(
  async () => {
    const [totalStudents, totalTeachers, totalCourses, totalEnrollments, recentSignups, revenueAgg] =
      await Promise.all([
        prisma.user.count({ where: ACTIVE_STUDENT }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.course.count({ where: { isActive: true } }),
        prisma.enrollment.count(),
        prisma.user.findMany({
          where: { role: { in: ["STUDENT", "TEACHER"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, email: true, role: true, country: true, createdAt: true },
        }),
        prisma.enrollment.findMany({ include: { course: { select: { price: true } } } }),
      ]);
    const monthlyRevenue = revenueAgg.reduce((sum, e) => sum + e.course.price, 0);
    return { totalStudents, totalTeachers, totalCourses, totalEnrollments, recentSignups, monthlyRevenue };
  },
  ["admin-dashboard"],
  { revalidate: 600 }
);

export const getCachedStudentsData = unstable_cache(
  async () => {
    const [students, courseRows] = await Promise.all([
      prisma.user.findMany({
        where: ACTIVE_STUDENT,
        include: {
          studentEnrollments: {
            include: {
              course: { select: { id: true, name: true, duration: true } },
              teacher: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          teacher: { select: { id: true, name: true, gender: true } },
          courseTeachers: { select: { teacher: { select: { id: true, name: true, gender: true } } } },
        },
        orderBy: { name: "asc" },
      }),
    ]);
    return { students, courseRows };
  },
  ["admin-students"],
  { revalidate: 600 }
);

export const getCachedTeachersData = unstable_cache(
  async () => {
    const [teachers, allCourses] = await Promise.all([
      prisma.user.findMany({
        where: { role: "TEACHER" },
        include: {
          teacherCourses: { include: { _count: { select: { enrollments: true } } } },
          courseTeacherships: {
            include: { course: { include: { _count: { select: { enrollments: true } } } } },
          },
          availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
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
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: {
          id: true, name: true, level: true, teacherId: true,
          teacher: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);
    return { teachers, allCourses };
  },
  ["admin-teachers"],
  { revalidate: 600 }
);

export const getCachedEnrollments = unstable_cache(
  () => getWebsiteEnrollments({ inTrials: false }),
  ["admin-enrollments"],
  { revalidate: 600 }
);

export const getCachedTrialsRaw = unstable_cache(
  async () => {
    const [enrollments, courses, allBookings, allAssignments, students, trialUsers] = await Promise.all([
      getWebsiteEnrollments({ inTrials: true }),
      prisma.course.findMany({
        select: {
          id: true, name: true,
          teacher: { select: { id: true, name: true, gender: true, shift: true } },
          courseTeachers: { select: { teacher: { select: { id: true, name: true, gender: true, shift: true } } } },
        },
      }),
      prisma.bookingSlot.findMany({
        select: { teacherId: true, dayOfWeek: true, startTime: true, duration: true },
      }),
      prisma.trialAssignment.findMany({
        select: { mongoEnrollmentId: true, teacherId: true, trialTime: true },
      }),
      prisma.user.findMany({ where: ACTIVE_STUDENT, select: { email: true } }),
      prisma.user.findMany({
        where: { role: "STUDENT", NOT: { accessExpiresAt: null } },
        select: {
          id: true,
          email: true,
          phone: true,
          loginPassword: true,
          accessExpiresAt: true,
          suspendedAt: true,
        },
      }),
    ]);
    return {
      enrollments,
      courses,
      allBookings,
      allAssignments,
      studentEmails: students.map((s) => s.email.toLowerCase()),
      trialAccounts: trialUsers.map((u) => ({
        id: u.id,
        email: u.email.toLowerCase(),
        phone: u.phone,
        loginPassword: u.loginPassword,
        accessExpiresAt: new Date(u.accessExpiresAt as Date).toISOString(),
        suspendedAt: u.suspendedAt ? new Date(u.suspendedAt).toISOString() : null,
      })),
    };
  },
  ["admin-trials"],
  { revalidate: 600 }
);

export const getCachedCoursesData = unstable_cache(
  async () => {
    const [courses, teachers] = await Promise.all([
      prisma.course.findMany({
        include: {
          courseTeachers: { include: { teacher: { select: { id: true, name: true } } } },
          enrollments: { select: { id: true, teacherId: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return { courses, teachers };
  },
  ["admin-courses"],
  { revalidate: 600 }
);

export const getCachedReportsData = unstable_cache(
  async () => {
    const [students, courses, lessonCompletions] = await Promise.all([
      prisma.user.findMany({
        where: { role: "STUDENT" },
        include: {
          studentEnrollments: {
            include: {
              course: { select: { id: true, name: true, duration: true } },
              teacher: { select: { id: true, name: true } },
            },
            orderBy: { startedAt: "desc" },
          },
          attendanceRecords: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.lessonCompletion.groupBy({ by: ["studentId"], _count: { id: true } }),
    ]);
    return { students, courses, lessonCompletions };
  },
  ["admin-reports"],
  { revalidate: 30 }
);

export const getCachedAvailability = unstable_cache(
  () =>
    prisma.enrollment.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, country: true, timezone: true } },
        course: { select: { id: true, name: true, level: true, classDuration: true } },
        teacher: { select: { id: true, name: true } },
        availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        bookings: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          include: { teacher: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ student: { name: "asc" } }, { startedAt: "desc" }],
    }),
  ["admin-availability"],
  { revalidate: 600 }
);

export const getCachedRecordings = unstable_cache(
  () =>
    prisma.classRecording.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { teacher: { select: { id: true, name: true } } },
    }),
  ["admin-recordings"],
  { revalidate: 600, tags: [RECORDINGS_TAG] }
);

export const getCachedAttendance = unstable_cache(
  async () => {
    const today = pktDayMidnightUTC();
    const since = new Date(today.getTime() - (ATTENDANCE_DAYS - 1) * 24 * 60 * 60 * 1000);
    const [teachers, records] = await Promise.all([
      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true, email: true, country: true, shift: true },
        orderBy: { name: "asc" },
      }),
      prisma.teacherAttendance.findMany({ where: { date: { gte: since, lte: today } } }),
    ]);
    return {
      teachers,
      records: records.map((r) => ({
        ...r,
        date: new Date(r.date).toISOString(),
        signInAt: new Date(r.signInAt).toISOString(),
        signOutAt: r.signOutAt ? new Date(r.signOutAt).toISOString() : null,
      })),
      todayISO: today.toISOString(),
    };
  },
  ["admin-teacher-attendance"],
  { revalidate: 600 }
);

export async function warmAllAdminCaches(): Promise<void> {
  await Promise.all([
    getCachedDashboard(),
    getCachedStudentsData(),
    getCachedTeachersData(),
    getCachedEnrollments(),
    getCachedTrialsRaw(),
    getCachedCoursesData(),
    getCachedReportsData(),
    getCachedAvailability(),
    getCachedRecordings(),
    getCachedAttendance(),
  ]);
}
