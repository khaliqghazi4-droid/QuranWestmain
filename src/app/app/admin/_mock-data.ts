// Sample data shown when the database is empty.
// Automatically replaced when real data exists — no manual changes needed.

const T1 = "mock-teacher-1";
const T2 = "mock-teacher-2";
const C1 = "mock-course-1";
const C2 = "mock-course-2";
const C3 = "mock-course-3";
const C4 = "mock-course-4";
const C5 = "mock-course-5";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

// ─── TEACHERS GRID ────────────────────────────────────────────────────────
export const MOCK_TEACHERS_GRID = [
  {
    id: T1, name: "Hafiz Ahmad Khan", email: "hafiz.ahmad@example.com", country: "Pakistan",
    bio: "Certified Quran teacher with 10+ years of experience in Hifz and Tajweed.",
    createdAt: daysAgo(90), timezone: "Asia/Karachi", shift: "DAY" as "DAY" | "NIGHT" | null, gender: "MALE" as "MALE" | "FEMALE" | null,
    courses: [
      { id: C1, name: "Quran Memorization", students: 3 },
      { id: C3, name: "Norani Qaida", students: 2 },
      { id: C5, name: "Quran Recitation", students: 2 },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
    ],
    bookings: [],
  },
  {
    id: T2, name: "Ustazah Khadija Hassan", email: "khadija.h@example.com", country: "Pakistan",
    bio: "Specialist in Tajweed and Islamic Studies with an Ijazah in Quran recitation.",
    createdAt: daysAgo(75), timezone: "Asia/Karachi", shift: "DAY" as "DAY" | "NIGHT" | null, gender: "FEMALE" as "MALE" | "FEMALE" | null,
    courses: [
      { id: C2, name: "Tajweed Course", students: 2 },
      { id: C4, name: "Islamic Studies", students: 2 },
    ],
    availability: [
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
    ],
    bookings: [],
  },
];

export const MOCK_TEACHERS_ALL_COURSES = [
  { id: C1, name: "Quran Memorization", level: "ADVANCED", assignedTeacherId: T1, assignedTeacherName: "Hafiz Ahmad Khan" },
  { id: C2, name: "Tajweed Course", level: "INTERMEDIATE", assignedTeacherId: T2, assignedTeacherName: "Ustazah Khadija Hassan" },
  { id: C3, name: "Norani Qaida", level: "BEGINNER", assignedTeacherId: T1, assignedTeacherName: "Hafiz Ahmad Khan" },
  { id: C4, name: "Islamic Studies", level: "BEGINNER", assignedTeacherId: T2, assignedTeacherName: "Ustazah Khadija Hassan" },
  { id: C5, name: "Quran Recitation", level: "INTERMEDIATE", assignedTeacherId: T1, assignedTeacherName: "Hafiz Ahmad Khan" },
];

// ─── COURSES ──────────────────────────────────────────────────────────────
export const MOCK_COURSES_LIST = [
  { id: C1, name: "Quran Memorization (Hifz)", description: "Complete Quran memorization program under expert Hafiz supervision.", level: "ADVANCED", duration: "12 months", classDuration: 60, price: 60, image: null, isActive: true, teacherId: T1, teachers: [{ id: T1, name: "Hafiz Ahmad Khan", isPrimary: true, studentsCount: 3 }], totalEnrollments: 3 },
  { id: C2, name: "Tajweed Course", description: "Learn the rules of Tajweed for beautiful and correct Quran recitation.", level: "INTERMEDIATE", duration: "6 months", classDuration: 45, price: 40, image: null, isActive: true, teacherId: T2, teachers: [{ id: T2, name: "Ustazah Khadija Hassan", isPrimary: true, studentsCount: 2 }], totalEnrollments: 2 },
  { id: C3, name: "Norani Qaida", description: "Foundation course for beginners learning Arabic script and Quran basics.", level: "BEGINNER", duration: "3 months", classDuration: 30, price: 25, image: null, isActive: true, teacherId: T1, teachers: [{ id: T1, name: "Hafiz Ahmad Khan", isPrimary: true, studentsCount: 2 }], totalEnrollments: 2 },
  { id: C4, name: "Islamic Studies", description: "Comprehensive study of Islamic history, Fiqh, and Seerah.", level: "BEGINNER", duration: "12 months", classDuration: 45, price: 35, image: null, isActive: true, teacherId: T2, teachers: [{ id: T2, name: "Ustazah Khadija Hassan", isPrimary: true, studentsCount: 2 }], totalEnrollments: 2 },
  { id: C5, name: "Quran Recitation", description: "Improve your Quran recitation with proper pronunciation and fluency.", level: "INTERMEDIATE", duration: "6 months", classDuration: 45, price: 35, image: null, isActive: true, teacherId: T1, teachers: [{ id: T1, name: "Hafiz Ahmad Khan", isPrimary: true, studentsCount: 2 }], totalEnrollments: 2 },
];

export const MOCK_COURSES_TEACHERS = [
  { id: T1, name: "Hafiz Ahmad Khan" },
  { id: T2, name: "Ustazah Khadija Hassan" },
];

// ─── REPORTS ──────────────────────────────────────────────────────────────
export const MOCK_REPORTS_STUDENTS = [
  { id: "mock-student-1", name: "Muhammad Ali Hassan", email: "m.ali@example.com", country: "Pakistan", createdAt: daysAgo(7), avgProgress: 45, attendancePct: 88, classesAttended: 16, lessonsCompleted: 12, enrollments: [{ id: "mock-enroll-1", courseId: C1, courseName: "Quran Memorization", duration: "12 months", teacherName: "Hafiz Ahmad Khan", progress: 45, status: "ACTIVE", startedAt: daysAgo(7) }] },
  { id: "mock-student-2", name: "Fatima Zahra Sheikh", email: "fatima.z@example.com", country: "United Kingdom", createdAt: daysAgo(14), avgProgress: 72, attendancePct: 95, classesAttended: 24, lessonsCompleted: 18, enrollments: [{ id: "mock-enroll-2", courseId: C2, courseName: "Tajweed Course", duration: "6 months", teacherName: "Ustazah Khadija Hassan", progress: 72, status: "ACTIVE", startedAt: daysAgo(14) }] },
  { id: "mock-student-3", name: "Omar Abdullah Khan", email: "omar.a@example.com", country: "United States", createdAt: daysAgo(21), avgProgress: 30, attendancePct: 75, classesAttended: 10, lessonsCompleted: 6, enrollments: [{ id: "mock-enroll-3", courseId: C3, courseName: "Norani Qaida", duration: "3 months", teacherName: "Hafiz Ahmad Khan", progress: 30, status: "ACTIVE", startedAt: daysAgo(21) }] },
  { id: "mock-student-4", name: "Aisha Bint Muhammad", email: "aisha.m@example.com", country: "Canada", createdAt: daysAgo(30), avgProgress: 58, attendancePct: 83, classesAttended: 20, lessonsCompleted: 14, enrollments: [{ id: "mock-enroll-4", courseId: C4, courseName: "Islamic Studies", duration: "12 months", teacherName: "Ustazah Khadija Hassan", progress: 58, status: "ACTIVE", startedAt: daysAgo(30) }] },
  { id: "mock-student-5", name: "Yusuf Ibrahim Malik", email: "yusuf.i@example.com", country: "Australia", createdAt: daysAgo(45), avgProgress: 90, attendancePct: 100, classesAttended: 28, lessonsCompleted: 22, enrollments: [{ id: "mock-enroll-5", courseId: C5, courseName: "Quran Recitation", duration: "6 months", teacherName: "Hafiz Ahmad Khan", progress: 90, status: "ACTIVE", startedAt: daysAgo(45) }] },
];

export const MOCK_REPORTS_STATS = {
  totalStudents: 5,
  totalEnrollments: 5,
  avgProgress: 59,
  completedCount: 0,
  avgAttendance: 88,
};

export const MOCK_REPORTS_COURSES = [
  { id: C1, name: "Quran Memorization" },
  { id: C2, name: "Tajweed Course" },
  { id: C3, name: "Norani Qaida" },
  { id: C4, name: "Islamic Studies" },
  { id: C5, name: "Quran Recitation" },
];

// ─── RECENT SIGNUPS (dashboard home) ─────────────────────────────────────
export const MOCK_RECENT_SIGNUPS = [
  { id: "mock-student-1", name: "Muhammad Ali Hassan", email: "m.ali@example.com", role: "STUDENT", country: "Pakistan", createdAt: new Date(Date.now() - 7 * 86_400_000) },
  { id: "mock-student-2", name: "Fatima Zahra Sheikh", email: "fatima.z@example.com", role: "STUDENT", country: "United Kingdom", createdAt: new Date(Date.now() - 14 * 86_400_000) },
  { id: "mock-teacher-1", name: "Hafiz Ahmad Khan", email: "hafiz.ahmad@example.com", role: "TEACHER", country: "Pakistan", createdAt: new Date(Date.now() - 90 * 86_400_000) },
];
