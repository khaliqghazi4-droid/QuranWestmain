import { ClassesHeader, ClassesShell } from "./shell";

export default function ClassesLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <ClassesHeader />
      <ClassesShell />
    </div>
  );
}
