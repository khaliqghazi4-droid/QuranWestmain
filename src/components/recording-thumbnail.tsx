"use client";

import * as React from "react";

// A still from the recording itself as its card's preview: frame 100, which is
// 100 / 15 s in because the class recorder captures at 15 fps (shorter
// recordings use their midpoint). The frame is decoded once the card scrolls
// near the viewport, kept as a small JPEG, and the <video> is let go again so
// a long list doesn't hold a decoder per card.
const PREVIEW_FRAME = 100;
const RECORDER_FPS = 15;

// Survives client-side navigation, so coming back to the page doesn't decode again
const previewCache = new Map<string, string>();

export function RecordingThumbnail({
  url,
  durationSec,
}: {
  url: string;
  durationSec: number | null;
}) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [src, setSrc] = React.useState<string | null>(() => previewCache.get(url) ?? null);

  React.useEffect(() => {
    if (src) return;
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false;
    let video: HTMLVideoElement | null = null;

    function release() {
      if (!video) return;
      video.removeAttribute("src");
      video.load();
      video = null;
    }

    function grab() {
      const v = document.createElement("video");
      video = v;
      v.muted = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.crossOrigin = "anonymous"; // the frame is read back from a canvas
      const at =
        durationSec && durationSec > 0
          ? Math.min(PREVIEW_FRAME / RECORDER_FPS, durationSec / 2)
          : PREVIEW_FRAME / RECORDER_FPS;
      v.addEventListener("loadedmetadata", () => (v.currentTime = at), { once: true });
      v.addEventListener(
        "seeked",
        () => {
          if (cancelled) return;
          try {
            const w = 480;
            const h = Math.round((w * v.videoHeight) / v.videoWidth) || 270;
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d")!.drawImage(v, 0, 0, w, h);
            const data = canvas.toDataURL("image/jpeg", 0.75);
            previewCache.set(url, data);
            setSrc(data);
          } catch {
            // Not decodable here: the card keeps its placeholder
          }
          release();
        },
        { once: true }
      );
      v.addEventListener("error", release, { once: true });
      v.src = url;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          grab();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(box);
    return () => {
      cancelled = true;
      io.disconnect();
      release();
    };
  }, [url, durationSec, src]);

  return (
    <div ref={boxRef} className="absolute inset-0" aria-hidden>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover animate-fade-in" />
      )}
    </div>
  );
}
