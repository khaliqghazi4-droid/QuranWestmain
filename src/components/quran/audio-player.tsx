"use client";

import * as React from "react";
import { Play, Pause, Loader2, Volume2 } from "lucide-react";

// Small Play/Pause toggle backed by a single hidden <audio>. Stops any other
// AudioPlayer when this one starts so two recitations don't overlap.
const ACTIVE_AUDIO: { current: HTMLAudioElement | null } = { current: null };

export function AudioPlayer({
  src,
  label,
  variant = "primary",
}: {
  src: string;
  label?: string;
  variant?: "primary" | "ghost";
}) {
  const ref = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onPlay = () => {
      if (ACTIVE_AUDIO.current && ACTIVE_AUDIO.current !== a) {
        ACTIVE_AUDIO.current.pause();
      }
      ACTIVE_AUDIO.current = a;
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onWait = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onError = () => {
      setLoading(false);
      setError(true);
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("waiting", onWait);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("waiting", onWait);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("error", onError);
      if (ACTIVE_AUDIO.current === a) {
        a.pause();
        ACTIVE_AUDIO.current = null;
      }
    };
  }, []);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    setError(false);
    if (a.paused) {
      const p = a.play();
      if (p?.catch) {
        p.catch(() => setError(true));
      }
    } else {
      a.pause();
    }
  }

  const baseCls =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-full bg-[hsl(var(--gold))] px-5 py-2 text-sm font-bold text-[hsl(220_32%_10%)] shadow-md hover:shadow-lg transition-all disabled:opacity-60"
      : "grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-muted-foreground";

  return (
    <>
      {/* preload="none" so we don't fetch every audio on page load */}
      <audio ref={ref} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={baseCls}
        title={error ? "Audio failed to load" : playing ? "Pause" : "Play"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Pause className={variant === "primary" ? "h-4 w-4 fill-current" : "h-3.5 w-3.5"} />
        ) : variant === "primary" ? (
          <Play className="h-4 w-4 fill-current" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        {label}
      </button>
    </>
  );
}
