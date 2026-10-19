"use client";

import * as React from "react";
import { AlertCircle, Loader2, ZoomIn, ZoomOut } from "lucide-react";

// Preview + adjust step before a profile photo is uploaded. The photo fills a
// square window; drag it to move, zoom with the slider, the mouse wheel or a
// two-finger pinch. The circle shows what the round avatars will show. Saving
// cuts the window's square out at 512×512 and hands it back as a File.

const VIEW = 280; // crop window, CSS px
const OUT = 512; // saved photo, px
const MAX_ZOOM = 4;

type Point = { x: number; y: number };

export function PhotoCropper({
  file,
  onCancel,
  onSave,
}: {
  file: File;
  onCancel: () => void;
  onSave: (photo: File) => void;
}) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const windowRef = React.useRef<HTMLDivElement>(null);
  const [natural, setNatural] = React.useState<{ w: number; h: number } | null>(null);
  const [failed, setFailed] = React.useState(false);

  // Local preview URL for the chosen file. Made inside the effect, not in
  // useState: React's Strict Mode (dev) runs effects twice, and a URL made once
  // would be revoked by the first cleanup and leave a broken image.
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  const [saving, setSaving] = React.useState(false);
  // x/y: how far the photo's centre sits from the window's centre, CSS px
  const [view, setView] = React.useState({ zoom: 1, x: 0, y: 0 });

  // At zoom 1 the photo just covers the window ("cover")
  const base = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1;
  const scale = base * view.zoom; // CSS px per photo px
  const shownW = natural ? natural.w * scale : VIEW;
  const shownH = natural ? natural.h * scale : VIEW;

  // Keep the photo covering the whole window: no empty edges
  const clampOffset = React.useCallback(
    (x: number, y: number, zoom: number): Point => {
      if (!natural) return { x: 0, y: 0 };
      const maxX = (natural.w * base * zoom - VIEW) / 2;
      const maxY = (natural.h * base * zoom - VIEW) / 2;
      return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
    },
    [natural, base]
  );

  // Zoom about the window's centre
  const zoomTo = React.useCallback(
    (next: number) =>
      setView((v) => {
        const zoom = Math.min(MAX_ZOOM, Math.max(1, next));
        return { zoom, ...clampOffset((v.x * zoom) / v.zoom, (v.y * zoom) / v.zoom, zoom) };
      }),
    [clampOffset]
  );

  // Drag with one pointer, pinch-zoom with two
  const pointers = React.useRef(new Map<number, Point>());
  const pinch = React.useRef<{ dist: number; zoom: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: view.zoom };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const now = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, now);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      zoomTo((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist);
    } else if (pointers.current.size === 1) {
      const dx = now.x - prev.x;
      const dy = now.y - prev.y;
      setView((v) => ({ ...v, ...clampOffset(v.x + dx, v.y + dy, v.zoom) }));
    }
  }

  function onPointerEnd(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  // Mouse wheel zooms. A native listener, because React's is passive and
  // can't stop the page behind from scrolling.
  React.useEffect(() => {
    const el = windowRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        const zoom = Math.min(MAX_ZOOM, Math.max(1, v.zoom * Math.exp(-e.deltaY * 0.0015)));
        return { zoom, ...clampOffset((v.x * zoom) / v.zoom, (v.y * zoom) / v.zoom, zoom) };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clampOffset]);

  // Esc closes
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  async function save() {
    const img = imgRef.current;
    if (!img || !natural) return;
    setSaving(true);
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setSaving(false);
    // The window's square, in photo pixels
    const left = VIEW / 2 + view.x - shownW / 2;
    const top = VIEW / 2 + view.y - shownH / 2;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -left / scale, -top / scale, VIEW / scale, VIEW / scale, 0, 0, OUT, OUT);
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/webp", 0.9));
    if (!blob) return setSaving(false);
    onSave(new File([blob], `avatar.${blob.type.split("/")[1]}`, { type: blob.type }));
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-[16px] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-cropper-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-[20px] shadow-2xl">
        <h3 id="photo-cropper-title" className="text-base font-bold">
          Adjust your photo
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Drag to move it. Zoom with the slider, the mouse wheel or a pinch.</p>

        <div
          ref={windowRef}
          className="relative mx-auto mt-[16px] cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-muted active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          {failed ? (
            <div className="grid h-full place-items-center p-6 text-center text-xs text-destructive">
              <span className="inline-flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> This image couldn&apos;t be opened. Try a JPG or PNG.
              </span>
            </div>
          ) : (
            url && (
              // eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL)
              <img
                ref={imgRef}
                src={url}
                alt="Preview of your new photo"
                draggable={false}
                onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                onError={() => setFailed(true)}
                className="pointer-events-none absolute max-w-none"
                style={{
                  width: shownW,
                  height: shownH,
                  left: VIEW / 2 + view.x - shownW / 2,
                  top: VIEW / 2 + view.y - shownH / 2,
                  visibility: natural ? "visible" : "hidden",
                }}
              />
            )
          )}
          {/* Dim outside the circle the round avatars show, with a thin ring */}
          {!failed && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(circle at center, transparent 69.5%, rgb(15 23 42 / 0.45) 70.5%)",
              }}
            >
              <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/80" />
            </div>
          )}
          {!natural && !failed && (
            <div className="absolute inset-0 grid place-items-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="mt-[16px] flex items-center gap-[12px]">
          <button
            type="button"
            onClick={() => zoomTo(view.zoom - 0.25)}
            disabled={!natural || view.zoom <= 1}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={view.zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            disabled={!natural}
            aria-label="Zoom"
            className="h-1.5 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
          />
          <button
            type="button"
            onClick={() => zoomTo(view.zoom + 0.25)}
            disabled={!natural || view.zoom >= MAX_ZOOM}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-[20px] grid grid-cols-2 gap-[8px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-[16px] py-[8px] text-sm font-semibold hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!natural || saving}
            className="inline-flex items-center justify-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[8px] text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save photo
          </button>
        </div>
      </div>
    </div>
  );
}
