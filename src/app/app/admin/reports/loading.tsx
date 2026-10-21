import { ReportsHeader, ReportsShell } from "./shell";

export default function ReportsLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <ReportsHeader />
      <ReportsShell />
    </div>
  );
}
