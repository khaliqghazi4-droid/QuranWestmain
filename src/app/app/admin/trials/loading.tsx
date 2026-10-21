import { TrialsHeader, TrialsShell } from "./shell";

export default function TrialsLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-6">
      <TrialsHeader />
      <TrialsShell />
    </div>
  );
}
