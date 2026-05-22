import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardCheck,
  LineChart,
  User,
  Users,
  GraduationCap,
  Award,
  Settings,
  MessageSquare,
  FileText,
  DollarSign,
  BookMarked,
  Inbox,
  type LucideIcon,
} from "lucide-react";

export type Role = "student" | "teacher" | "admin";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navConfig: Record<Role, NavItem[]> = {
  student: [
    { href: "/app/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/student/courses", label: "My Courses", icon: BookOpen },
    { href: "/app/student/catalog", label: "Browse Catalog", icon: BookMarked },
    { href: "/app/student/schedule", label: "Schedule", icon: Calendar },
    { href: "/app/student/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/app/student/progress", label: "Progress", icon: LineChart },
    { href: "/app/student/quran", label: "Quran Reader", icon: BookMarked },
    { href: "/app/student/messages", label: "Messages", icon: MessageSquare },
    { href: "/app/student/profile", label: "Profile", icon: User },
  ],
  teacher: [
    { href: "/app/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/teacher/students", label: "My Students", icon: Users },
    { href: "/app/teacher/classes", label: "Classes", icon: Calendar },
    { href: "/app/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/app/teacher/lessons", label: "Lessons", icon: FileText },
    { href: "/app/teacher/quran", label: "Quran Reader", icon: BookMarked },
    { href: "/app/teacher/messages", label: "Messages", icon: MessageSquare },
    { href: "/app/teacher/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/app/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/admin/enrollments", label: "Enroll Requests", icon: Inbox },
    { href: "/app/admin/students", label: "Students", icon: GraduationCap },
    { href: "/app/admin/teachers", label: "Teachers", icon: Users },
    { href: "/app/admin/availability", label: "Scheduling", icon: Calendar },
    { href: "/app/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/app/admin/payments", label: "Payments", icon: DollarSign },
    { href: "/app/admin/reports", label: "Reports", icon: LineChart },
    { href: "/app/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/app/admin/settings", label: "Settings", icon: Settings },
  ],
};

export const roleMeta: Record<Role, { label: string; icon: LucideIcon }> = {
  student: { label: "Student", icon: GraduationCap },
  teacher: { label: "Teacher", icon: Users },
  admin: { label: "Admin", icon: Award },
};
