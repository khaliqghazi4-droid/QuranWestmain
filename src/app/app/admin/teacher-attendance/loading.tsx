import { AttendanceHeader, AttendanceShell, PeriodPickerShell } from "./shell";

export default function TeacherAttendanceLoading() {
  return (
    <div className="space-y-6">
      <AttendanceHeader />
      <PeriodPickerShell />
      <AttendanceShell />
    </div>
  );
}
