import { SettingsHeader, SettingsShell } from "./shell";

export default function SettingsLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night space-y-[20px]">
      <SettingsHeader />
      <SettingsShell />
    </div>
  );
}
