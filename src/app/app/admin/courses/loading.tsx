import { CoursesShell } from "./shell";

export default function CoursesLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night">
      <CoursesShell />
    </div>
  );
}
