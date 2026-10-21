import { MessagesShell } from "./shell";

export default function MessagesLoading() {
  return (
    // adm-night: the page's black-and-gold dark mode, also while it loads
    <div className="adm-night h-full min-h-[420px]">
      <MessagesShell />
    </div>
  );
}
