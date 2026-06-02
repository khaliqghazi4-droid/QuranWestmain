import { DashboardShell } from "@/components/dashboard/shell";
import { TeacherClassReminder } from "@/components/teacher/class-reminder";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="teacher">
      <TeacherClassReminder />
      {children}
    </DashboardShell>
  );
}
