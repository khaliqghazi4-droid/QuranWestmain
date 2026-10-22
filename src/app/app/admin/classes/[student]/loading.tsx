import { BackToClasses, StudentClassesShell } from "./shell";

// A student's schedule while it loads (without this the Classes cards'
// skeleton would show)
export default function StudentClassesLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <BackToClasses />
      <StudentClassesShell />
    </div>
  );
}
