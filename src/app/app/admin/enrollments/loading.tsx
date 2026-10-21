import { EnrollmentsHeader, EnrollmentsShell } from "./shell";

export default function EnrollmentsLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <EnrollmentsHeader />
      <EnrollmentsShell />
    </div>
  );
}
