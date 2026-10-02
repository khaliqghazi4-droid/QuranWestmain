"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// One click shows a class recording to that class's student; clicking again
// hides it. Flips right away and rolls back if the request fails.
export function ShareRecordingButton({
  recordingId,
  shared: initialShared,
  onChange,
}: {
  recordingId: string;
  shared: boolean;
  onChange?: (shared: boolean) => void;
}) {
  const router = useRouter();
  const [shared, setShared] = React.useState(initialShared);
  const [busy, setBusy] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  React.useEffect(() => setShared(initialShared), [initialShared]);

  async function toggle() {
    const next = !shared;
    setShared(next);
    onChange?.(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/recordings/${recordingId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share: next }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Couldn't update the recording");
      }
      router.refresh();
    } catch (e) {
      setShared(!next);
      onChange?.(!next);
      window.alert(e instanceof Error ? e.message : "Couldn't update the recording");
    } finally {
      setBusy(false);
    }
  }

  const label = shared ? (hover ? "Hide from student" : "Visible to student") : "Show to student";
  const Icon = busy ? Loader2 : shared && !hover ? Eye : shared ? EyeOff : Eye;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={shared ? "The student can watch this on their Schedule page. Click to hide it." : "Let the student watch this on their Schedule page"}
      className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
        shared
          ? hover
            ? "border border-destructive/40 bg-destructive/10 text-destructive"
            : "border border-emerald-500/40 bg-emerald-500/15 text-emerald-700"
          : "border border-border bg-card hover:bg-muted"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}
