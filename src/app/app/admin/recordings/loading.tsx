import { RecordingsHeader, RecordingsShell } from "./shell";

export default function RecordingsLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <RecordingsHeader />
      <RecordingsShell />
    </div>
  );
}
