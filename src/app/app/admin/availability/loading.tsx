import { AvailabilityHeader, AvailabilityShell } from "./shell";

export default function AvailabilityLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <AvailabilityHeader />
      <AvailabilityShell />
    </div>
  );
}
