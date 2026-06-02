"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Video,
  Clock,
  User,
  BookOpen,
  X,
} from "lucide-react";

type NextClass = {
  id: string;
  type: "booking" | "trial";
  studentName: string;
  courseName: string;
  startUTC: number;
  durationMin: number;
  minutesUntil: number;
  meetingLink: string;
};

const REMINDER_MINUTES = 15;

export function TeacherClassReminder() {
  const pathname = usePathname();
  const [data, setData] = React.useState<NextClass | null>(null);
  const [dismissedId, setDismissedId] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);
  const [notified, setNotified] = React.useState<Set<string>>(new Set());

  // Re-fetch every 60s; re-render every 15s for the countdown
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/teacher/next-class", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { next: NextClass | null };
        if (!cancelled) setData(json.next);
      } catch {
        /* ignore */
      }
    }
    load();
    const dataT = setInterval(load, 60_000);
    const tickT = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => {
      cancelled = true;
      clearInterval(dataT);
      clearInterval(tickT);
    };
  }, []);

  // Re-load when route changes (so a fresh booking shows up immediately)
  React.useEffect(() => {
    fetch("/api/teacher/next-class", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setData(j.next))
      .catch(() => {});
  }, [pathname]);

  if (!data) return null;

  // Compute minutes-until live (don't trust server value once any time passes)
  const minutesUntil = Math.round((data.startUTC - (Date.now() - tick * 0)) / 60_000);
  const isLive =
    minutesUntil <= 0 && Date.now() <= data.startUTC + data.durationMin * 60_000;
  const isWithinReminder = minutesUntil > 0 && minutesUntil <= REMINDER_MINUTES;

  if (!isLive && !isWithinReminder) return null;
  if (dismissedId === data.id) return null;

  // Fire browser notification once per class when we cross the 15-min threshold
  if (isWithinReminder && typeof window !== "undefined" && !notified.has(data.id)) {
    setNotified((prev) => new Set(prev).add(data.id));
    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(`Class in ${minutesUntil} min`, {
          body: `${data.studentName} — ${data.courseName}`,
        });
      } catch {
        /* ignore */
      }
    }
  }

  const timeLabel = new Date(data.startUTC).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={`-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-6 px-4 sm:px-6 lg:px-8 py-3 border-b ${
        isLive
          ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/15 border-emerald-500/30"
          : "bg-gradient-to-r from-[hsl(var(--gold)/0.18)] via-[hsl(var(--gold)/0.12)] to-[hsl(var(--gold)/0.18)] border-[hsl(var(--gold))]/40"
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl text-white shrink-0 ${
            isLive
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : "bg-gradient-to-br from-[hsl(var(--gold))] to-amber-500"
          }`}
        >
          {isLive ? (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold inline-flex items-center gap-2 flex-wrap">
            {isLive ? (
              <span className="text-emerald-700">LIVE NOW</span>
            ) : (
              <span className="text-[hsl(var(--gold))]">
                Class starts in {minutesUntil} min
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-foreground font-semibold">
              <Clock className="h-3 w-3" /> {timeLabel} PKT
            </span>
          </p>
          <p className="text-xs text-foreground/80 mt-0.5 inline-flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" /> {data.studentName}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {data.courseName}
            </span>
          </p>
        </div>

        <a
          href={data.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all shrink-0 ${
            isLive
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-primary to-accent"
          }`}
        >
          <Video className="h-4 w-4" /> Start Class
        </a>

        <button
          onClick={() => setDismissedId(data.id)}
          title="Dismiss"
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/10 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
