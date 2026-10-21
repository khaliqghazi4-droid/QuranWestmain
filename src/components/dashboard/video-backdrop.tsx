"use client";

import * as React from "react";

// Background video behind the admin dashboard, in both themes (in light mode
// it took over from BrandPattern, kept in brand-pattern.tsx).
// public/videos/dashboard-bg.* is the user's 69MB "Video Project.mp4" (not
// kept in the repo) cut to a 22.5s
// loop whose last 1.5s fade into its start, so it repeats without a jump;
// 960×540 and no sound: WebM (VP9, 1.2MB), MP4 (H.264, 1.4MB) for Safari,
// and a JPG poster shown until it plays and instead of it when the system
// asks for reduced motion. It plays slowed down; how faint it is and what
// shows behind it differ per theme (.adm-video in globals.css).

const SPEED = 0.5; // tried 0.6 (fast), 0.4 and 0.3 (too slow)

export function VideoBackdrop() {
  const [mounted, setMounted] = React.useState(false);
  const [still, setStill] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    setMounted(true);
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultPlaybackRate = SPEED; // kept when the source loads
    video.playbackRate = SPEED;
    // React sets `muted` as a property only, which some browsers don't count
    // for autoplay; set it and start playback by hand
    video.muted = true;
    if (!still) video.play().catch(() => {});
  }, [mounted, still]);

  // Client only: whether to play depends on the reduced-motion setting
  if (!mounted) return null;
  return (
    <div aria-hidden="true" className="adm-video pointer-events-none fixed inset-0 -z-10">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster="/videos/dashboard-bg.jpg"
        autoPlay={!still}
        muted
        loop
        playsInline
        preload={still ? "none" : "auto"}
        disablePictureInPicture
        disableRemotePlayback
      >
        <source src="/videos/dashboard-bg.webm" type="video/webm" />
        <source src="/videos/dashboard-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
