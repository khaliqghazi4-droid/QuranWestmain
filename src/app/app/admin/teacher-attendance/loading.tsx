import { AttendanceHeader, AttendanceShell, PeriodPickerShell } from "./shell";

export default function TeacherAttendanceLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <AttendanceHeader />
      <PeriodPickerShell />
      <AttendanceShell />
    </div>
  );
}
