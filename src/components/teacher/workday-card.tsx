"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Clock, Loader2, CheckCircle2 } from "lucide-react";

export type WorkdayState = {
  signedIn: boolean;
  signedOut: boolean;
  signInAt: string | null;
  signOutAt: string | null;
};

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtDuration(ms: number) {
  if (ms < 0) ms = 0;
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function TeacherWorkdayCard({ initial }: { initial: WorkdayState }) {
  const router = useRouter();
  const [state, setState] = React.useState(initial);
  const [busy, setBusy] = React.useState<"in" | "out" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  // Update "duration so far" each minute
  React.useEffect(() => {
    if (state.signedIn && !state.signedOut) {
      const t = setInterval(() => setTick((n) => n + 1), 60_000);
      return () => clearInterval(t);
    }
  }, [state.signedIn, state.signedOut]);

  async function call(path: "sign-in" | "sign-out") {
    setError(null);
    setBusy(path === "sign-in" ? "in" : "out");
    const res = await fetch(`/api/teacher/${path}`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed");
      return;
    }
    const data = await res.json();
    const r = data.attendance;
    setState({
      signedIn: !!r.signInAt,
      signedOut: !!r.signOutAt,
      signInAt: r.signInAt,
      signOutAt: r.signOutAt,
    });
    router.refresh();
  }

  const elapsedMs = state.signInAt
    ? (state.signedOut && state.signOutAt
        ? new Date(state.signOutAt).getTime()
        : Date.now() + tick * 0) - new Date(state.signInAt).getTime()
    : 0;

  // Three visual states: not yet, signed-in (working), signed-out (done)
  if (state.signedOut) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-4 flex-wrap">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Workday complete</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Signed in {fmtTime(state.signInAt)} · Signed out {fmtTime(state.signOutAt)} ·{" "}
            <span className="font-semibold text-foreground">{fmtDuration(elapsedMs)}</span>
          </p>
        </div>
      </div>
    );
  }

  if (state.signedIn) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex items-center gap-4 flex-wrap">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md">
          <Clock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">You&apos;re signed in for the day</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Started at {fmtTime(state.signInAt)} PKT ·{" "}
            <span className="font-semibold text-foreground">{fmtDuration(elapsedMs)} so far</span>
          </p>
          {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
        </div>
        <button
          onClick={() => call("sign-out")}
          disabled={busy === "out"}
          className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 shrink-0"
        >
          {busy === "out" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign out for the day
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold)/0.06)] p-5 flex items-center gap-4 flex-wrap">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold))] to-amber-500 text-white shadow-md">
        <LogIn className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">Not signed in yet today</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sign in to start your workday. Admin will see your daily attendance.
        </p>
        {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
      </div>
      <button
        onClick={() => call("sign-in")}
        disabled={busy === "in"}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg disabled:opacity-60 shrink-0"
      >
        {busy === "in" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Sign in for the day
      </button>
    </div>
  );
}
