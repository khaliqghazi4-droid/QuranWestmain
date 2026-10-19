"use client";

import * as React from "react";
import { useTheme } from "next-themes";

// Animated wireframe "terrain" behind the admin dashboard, light mode only
// (globals.css shows the canvas only under html:not(.dark) .admin-brand).
//
// A grid of points on a 3D surface (X across, Z away from the camera, Y up)
// is lifted by a few sine waves and seen through a perspective camera, then
// joined row by row and column by column. The waves' phase moves with time,
// so they roll slowly towards the viewer. The drawing works in a 1600×900
// space scaled to cover the screen, like an SVG with "slice".

const VIEW_W = 1600;
const VIEW_H = 900;
const ROWS = 40; // lines across, far to near
const COLS = 84; // lines running away from the camera
const Z_NEAR = 6.6;
const Z_FAR = 21;
const X_SPAN = 7.5;
const CAM_Y = 3;
const FOCAL = 2400;
const CY = -110;
const SPEED = 0.35; // wave phase, radians per second
const FRAME_MS = 1000 / 30; // 30 fps is plenty for a slow swell

function surface(X: number, Z: number, time: number) {
  return (
    Math.sin(0.5 * X + 0.32 * Z + time) * 0.62 +
    Math.sin(0.95 * X - 0.7 * Z + 1 + time * 1.3) * 0.22 +
    Math.cos(0.38 * Z - 0.42 * X + 0.3 - time * 0.8) * 0.42
  );
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number, time: number, pts: Float32Array) {
  for (let i = 0; i < ROWS; i++) {
    const Z = Z_FAR + ((Z_NEAR - Z_FAR) * i) / (ROWS - 1);
    for (let j = 0; j < COLS; j++) {
      const X = (j / (COLS - 1) - 0.5) * 2 * X_SPAN;
      const Y = surface(X, Z, time);
      const k = (i * COLS + j) * 2;
      pts[k] = VIEW_W / 2 + (X / Z) * FOCAL;
      pts[k + 1] = CY + ((CAM_Y - Y) / Z) * FOCAL;
    }
  }

  // Cover the screen: scale the 1600×900 drawing up until both sides fill it
  const scale = Math.max(width / VIEW_W, height / VIEW_H);
  const offsetX = (width - VIEW_W * scale) / 2;
  const offsetY = (height - VIEW_H * scale) / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width * dpr, height * dpr);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);

  // Blue lines, fading out towards the top so the far edge melts into the cream
  const fade = ctx.createLinearGradient(0, 40, 0, VIEW_H);
  fade.addColorStop(0, "rgba(59, 130, 246, 0)");
  fade.addColorStop(0.35, "rgba(47, 128, 245, 0.45)");
  fade.addColorStop(1, "rgba(29, 106, 229, 0.75)");
  ctx.strokeStyle = fade;
  ctx.lineWidth = 1 / scale; // 1 CSS px whatever the scale

  ctx.beginPath();
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const k = (i * COLS + j) * 2;
      if (j === 0) ctx.moveTo(pts[k], pts[k + 1]);
      else ctx.lineTo(pts[k], pts[k + 1]);
    }
  }
  for (let j = 0; j < COLS; j++) {
    for (let i = 0; i < ROWS; i++) {
      const k = (i * COLS + j) * 2;
      if (i === 0) ctx.moveTo(pts[k], pts[k + 1]);
      else ctx.lineTo(pts[k], pts[k + 1]);
    }
  }
  ctx.stroke();
}

export function WaveMesh() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || dark) return;

    const pts = new Float32Array(ROWS * COLS * 2);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let last = 0;
    const start = performance.now();

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
    }

    function render(now: number) {
      draw(ctx!, width, height, dpr, still ? 0 : ((now - start) / 1000) * SPEED, pts);
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      render(now);
    }

    resize();
    render(performance.now());
    if (!still) frame = requestAnimationFrame(tick);

    // Keep it sharp after a resize; a still canvas just redraws once
    const onResize = () => {
      resize();
      render(performance.now());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [dark]);

  return <canvas ref={canvasRef} aria-hidden="true" className="adm-wave pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
