import { BackToClasses, StudentClassesShell } from "./shell";

// A student's schedule while it loads (without this the Classes cards'
// skeleton would show)
export default function StudentClassesLoading() {
  return (
    <div className="space-y-6">
      <BackToClasses />
      <StudentClassesShell />
    </div>
  );
}
