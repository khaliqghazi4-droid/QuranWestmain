"use client";

import * as React from "react";
import { AlertCircle, Loader2, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// The player for class recordings, with its own controls. The class
// recorder's WebM files (MediaRecorder) carry no length, so the browser
// reports Infinity until it has read to the very end: its built-in timeline
// sat at the end and the time read "0:09 / 0:09". This one uses the length
// the recorder saved (durationSec) until the browser knows the real one, and
// seeking works without reading the whole file first.
// Keys, once the player has focus: Space or K play / pause, ← → 5 s back or
// on, M mute, F full screen. Controls fade while playing and the pointer
// rests. Colours: white and gold over a dark fade; in the light admin the
// adm-player-* hooks (globals.css) make the bar white glass with navy.
// Sizes written out: the website's Bootstrap sheet overrides
// .text-sm/.text-xs (and has an !important .opacity-0, hence opacity-[0]).

const SPEEDS = [1, 1.25, 1.5, 2, 0.75];
const HIDE_AFTER_MS = 2500;

export function RecordingVideo({
  src,
  durationSec,
  className,
}: {
  src: string;
  // the length the recorder saved, in seconds
  durationSec?: number | null;
  // for the <video> (e.g. its max height)
  className?: string;
}) {
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const hideTimer = React.useRef<number | undefined>(undefined);

  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [length, setLength] = React.useState(durationSec && durationSec > 0 ? durationSec : 0);
  const [buffered, setBuffered] = React.useState(0);
  const [waiting, setWaiting] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [speed, setSpeed] = React.useState(1);
  const [full, setFull] = React.useState(false);
  const [active, setActive] = React.useState(true);
  // 0–1 along the bar: where it is being dragged, and where the pointer is.
  // The drag also lives in a ref, so a quick press and release (before a
  // re-render) still seeks.
  const [scrub, setScrubState] = React.useState<number | null>(null);
  const scrubRef = React.useRef<number | null>(null);
  const setScrub = (f: number | null) => {
    scrubRef.current = f;
    setScrubState(f);
  };
  const [hover, setHover] = React.useState<number | null>(null);

  // The length counts once the recorder or the browser has given one (with
  // neither, only the time played shows, never "0:02 / 0:02"); a recording
  // that runs past the saved length stretches the bar with it
  const known = length > 0;
  const total = known ? Math.max(length, time) : 0;
  const shown = scrub !== null ? scrub * total : time;
  const showControls = active || !playing || scrub !== null || failed;

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onLength = () => {
      if (Number.isFinite(v.duration) && v.duration > 0) setLength(v.duration);
    };
    const onProgress = () => {
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setWaiting(true);
    const onReady = () => setWaiting(false);
    // at the end the browser knows the true length at last
    const onEnded = () => {
      setPlaying(false);
      setLength(Number.isFinite(v.duration) && v.duration > 0 ? v.duration : v.currentTime);
    };
    const onError = () => {
      setFailed(true);
      setWaiting(false);
    };
    const events: [string, () => void][] = [
      ["timeupdate", onTime],
      ["durationchange", onLength],
      ["loadedmetadata", onLength],
      ["progress", onProgress],
      ["play", onPlay],
      ["pause", onPause],
      ["waiting", onWaiting],
      ["seeking", onWaiting],
      ["canplay", onReady],
      ["playing", onReady],
      ["seeked", onReady],
      ["ended", onEnded],
      ["error", onError],
    ];
    for (const [name, fn] of events) v.addEventListener(name, fn);
    // opened by a click, so it may start with sound
    v.play().catch(() => setPlaying(false));
    boxRef.current?.focus({ preventScroll: true });
    return () => {
      for (const [name, fn] of events) v.removeEventListener(name, fn);
    };
  }, [src]);

  React.useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === boxRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  // Moving the pointer (or a key) brings the controls back for a while
  function wake() {
    setActive(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setActive(false), HIDE_AFTER_MS);
  }

  function toggle() {
    const v = videoRef.current;
    if (!v || failed) return;
    if (v.paused || v.ended) v.play().catch(() => {});
    else v.pause();
  }

  function seek(to: number) {
    const v = videoRef.current;
    if (!v || !known) return;
    v.currentTime = Math.min(Math.max(0, to), total);
    setTime(v.currentTime);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 1;
    setMuted(v.muted);
    setVolume(v.volume);
  }

  function changeVolume(value: number) {
    const v = videoRef.current;
    if (!v) return;
    v.volume = value;
    v.muted = value === 0;
    setVolume(value);
    setMuted(v.muted);
  }

  function nextSpeed() {
    const v = videoRef.current;
    if (!v) return;
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    v.playbackRate = next;
    setSpeed(next);
  }

  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else boxRef.current?.requestFullscreen?.().catch(() => {});
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // the volume slider keeps its own arrow keys
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") toggle();
    else if (k === "arrowleft") seek(time - 5);
    else if (k === "arrowright") seek(time + 5);
    else if (k === "m") toggleMute();
    else if (k === "f") toggleFull();
    else return;
    e.preventDefault();
    wake();
  }

  // 0–1 along the bar for a pointer event
  function fraction(e: React.PointerEvent) {
    const r = barRef.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  }

  const pct = (n: number) => `${known ? Math.min(100, (n / total) * 100) : 0}%`;

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      onPointerLeave={() => playing && setActive(false)}
      aria-label="Class recording player"
      className={cn(
        "group/player relative bg-black outline-none",
        full && "flex h-full items-center",
        !showControls && "cursor-none"
      )}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="auto"
        onClick={toggle}
        onDoubleClick={toggleFull}
        className={cn("block w-full bg-black", full ? "h-full max-h-none object-contain" : className)}
      />

      {waiting && !failed && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 className="h-9 w-9 animate-spin text-white/80" />
        </span>
      )}

      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-[16px] text-center">
          <div>
            <AlertCircle className="mx-auto h-8 w-8 text-white/80" />
            <p className="mt-[10px] text-[14px] font-semibold leading-[20px] text-white">
              This recording couldn&apos;t be played
            </p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="mt-[6px] inline-block text-[12.5px] font-semibold leading-[18px] text-[hsl(var(--gold))] underline"
            >
              Open the file instead
            </a>
          </div>
        </div>
      )}

      {/* Paused: a big play button in the middle */}
      {!playing && !waiting && !failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={time > 0 && time >= total - 0.05 ? "Play again" : "Play"}
          className="adm-player-big absolute left-1/2 top-1/2 grid h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Play className="ml-[3px] h-7 w-7 fill-current" />
        </button>
      )}

      {/* The control bar over the foot of the video */}
      <div
        className={cn(
          "adm-player-bar absolute inset-x-0 bottom-[0px] bg-gradient-to-t from-black/85 via-black/45 to-transparent px-[12px] pb-[8px] pt-[28px] text-white transition-opacity duration-200 sm:px-[16px]",
          showControls ? "opacity-[1]" : "pointer-events-none opacity-[0]"
        )}
      >
        <div
          ref={barRef}
          role="slider"
          tabIndex={-1}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(shown)}
          aria-valuetext={`${clock(shown)} of ${clock(total)}`}
          onPointerDown={(e) => {
            if (!known) return;
            // keeps the drag going outside the bar
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* no live pointer (e.g. a synthetic event): a plain click still seeks */
            }
            setScrub(fraction(e));
          }}
          onPointerMove={(e) => {
            const f = fraction(e);
            setHover(f);
            if (scrubRef.current !== null) setScrub(f);
          }}
          onPointerUp={() => {
            if (scrubRef.current !== null) seek(scrubRef.current * total);
            setScrub(null);
          }}
          onPointerLeave={() => setHover(null)}
          className={cn("group/bar relative h-[18px] touch-none", known ? "cursor-pointer" : "cursor-default")}
        >
          <div className="adm-player-track absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/bar:h-[6px]">
            <div className="adm-player-buffered absolute inset-y-0 left-0 bg-white/35" style={{ width: pct(buffered) }} />
            <div className="adm-player-fill absolute inset-y-0 left-0 bg-[hsl(var(--gold))]" style={{ width: pct(shown) }} />
          </div>
          {known && (
            <span
              className="adm-player-thumb absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_0_3px_rgb(0_0_0/0.25)] transition-transform group-hover/bar:scale-110"
              style={{ left: pct(shown) }}
            />
          )}
          {/* the time under the pointer */}
          {known && hover !== null && (
            <span
              className="adm-player-tip pointer-events-none absolute bottom-[20px] -translate-x-1/2 rounded-md bg-black/80 px-[6px] py-[2px] text-[11px] font-semibold leading-[15px] tabular-nums"
              style={{ left: `${hover * 100}%` }}
            >
              {clock(hover * total)}
            </span>
          )}
        </div>

        <div className="mt-[2px] flex items-center gap-[4px]">
          <ControlButton label={playing ? "Pause (K)" : "Play (K)"} onClick={toggle}>
            {playing ? <Pause className="h-[18px] w-[18px] fill-current" /> : <Play className="h-[18px] w-[18px] fill-current" />}
          </ControlButton>
          <ControlButton label="Back 5 seconds (←)" onClick={() => seek(time - 5)} disabled={!known}>
            <RotateCcw className="h-[17px] w-[17px]" />
          </ControlButton>
          <ControlButton label="On 5 seconds (→)" onClick={() => seek(time + 5)} disabled={!known}>
            <RotateCw className="h-[17px] w-[17px]" />
          </ControlButton>
          <span className="ml-[6px] whitespace-nowrap text-[12.5px] font-semibold leading-[18px] tabular-nums">
            {clock(shown)}
            {known && <span className="adm-player-dim text-white/60"> / {clock(total)}</span>}
          </span>

          <span className="flex-1" />

          <ControlButton label={muted ? "Unmute (M)" : "Mute (M)"} onClick={toggleMute}>
            {muted || volume === 0 ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume2 className="h-[18px] w-[18px]" />}
          </ControlButton>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            className="adm-player-volume mr-[6px] hidden w-[72px] cursor-pointer accent-[hsl(var(--gold))] sm:block"
          />
          <button
            type="button"
            onClick={nextSpeed}
            title="Playback speed"
            aria-label={`Playback speed ${speed}×`}
            className="h-[30px] min-w-[44px] rounded-full px-[8px] text-[12.5px] font-bold leading-[18px] tabular-nums transition-colors hover:bg-white/15"
          >
            {speed}×
          </button>
          <ControlButton label={full ? "Exit full screen (F)" : "Full screen (F)"} onClick={toggleFull}>
            {full ? <Minimize className="h-[17px] w-[17px]" /> : <Maximize className="h-[17px] w-[17px]" />}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

// 75 → "1:15", 3725 → "1:02:05"
function clock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
