"use client";

import * as React from "react";
import { useTheme } from "next-themes";

// Brand pattern behind the admin dashboard, light mode only (globals.css
// shows the canvas only under html:not(.dark) .admin-brand). It took over
// from StarLattice (star-lattice.tsx), which took over from WaveMesh
// (wave-mesh.tsx); both are kept: swap the import in shell.tsx to bring one
// back.
//
// The full Quran West logo and the Arabic letters sit in a checkerboard: each
// row runs logo, letter, logo, letter… and every other row is shifted half a
// step, so a letter sits above and below every logo. The letters run through
// the alphabet right to left along the rows. The whole pattern drifts slowly
// up and to the left, and every few seconds a soft band of light sweeps
// across it, bringing the logos and letters up as it passes. Behind the
// frosted cards and header it is drawn faint. Sizes are CSS px at a
// 1440px-wide screen, scaled with the width.

// The website's own logo file (the header shows the same one), in its own
// colours. It is 6333px wide, so it is halved step by step once (BASE_W) and
// then drawn at the size shown.
const LOGO_SRC = "/quran-academy-logo.png";
const BASE_W = 800;
const LOGO_W = 150;
const COL = 340; // logo to logo along a row; the letter sits halfway
const ROW = 150; // row to row
const LETTER_SIZE = 30; // each letter's longer side, so ا and ب come out the same size
const LETTERS = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
const GOLD = "#c9a13b"; // the site's --adm-gold-deep
// Strong enough for the logo's navy and gold to read true (fainter, the navy
// turns grey)
const LOGO_ALPHA = 0.7; // at rest
const LETTER_ALPHA = 0.65;
const LIT = 1.4; // what the light band multiplies them by at its centre
// Under the frosted surfaces the pattern is drawn at this fraction, so card
// text stays clear and the logos show in full only in the open
const COVERS = ".adm-glass, .adm-hero, .adm-header, .adm-sidebar-top";
const UNDER = 0.25;
const DRIFT_X = -7; // px per second
const DRIFT_Y = -4;
const SWEEP_EVERY = 9; // seconds from one sweep to the next
const SWEEP_FOR = 4.5; // seconds a sweep takes to cross the screen
const SWEEP_WIDTH = 240; // px, the soft half width of the band
const SWEEP_ANGLE = (-30 * Math.PI) / 180; // the band travels right and a little up
const FRAME_MS = 1000 / 30;

const smooth = (x: number) => x * x * (3 - 2 * x);
const mod = (a: number, n: number) => ((a % n) + n) % n;

// Starts drawing on the canvas; returns the clean-up
function mountPattern(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let s = 1; // size scale for this screen
  let frame = 0;
  let last = 0;
  let alive = true;
  const start = performance.now();

  // The logo: halved down to about BASE_W once (one big shrink would skip
  // pixels and come out grainy), then redrawn per resize at the size shown
  const logo = new Image();
  let base: HTMLCanvasElement | null = null;
  const sized = document.createElement("canvas");

  function makeBase() {
    let src: CanvasImageSource = logo;
    let w = logo.naturalWidth;
    let h = logo.naturalHeight;
    do {
      const half = document.createElement("canvas");
      half.width = Math.max(1, Math.round(w / 2));
      half.height = Math.max(1, Math.round(h / 2));
      half.getContext("2d")?.drawImage(src, 0, 0, half.width, half.height);
      src = half;
      w = half.width;
      h = half.height;
    } while (w / 2 >= BASE_W);
    base = src as HTMLCanvasElement;
  }

  function sizeLogo() {
    const sc = sized.getContext("2d");
    if (!base || !sc) return;
    sized.width = Math.round(LOGO_W * s * dpr);
    sized.height = Math.round((sized.width * base.height) / base.width);
    sc.imageSmoothingQuality = "high";
    sc.drawImage(base, 0, 0, sized.width, sized.height);
  }

  const radii = new WeakMap<HTMLElement, number>(); // corner radius per surface, read once

  // Letters in Amiri (loaded by layout.tsx), each measured at 100px so its ink
  // can be centred and scaled to LETTER_SIZE
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-amiri").trim() || "Amiri";
  const font = `700 100px ${family}, serif`;
  let glyphs: { ch: string; x: number; y: number; k: number }[] = [];

  logo.src = LOGO_SRC;
  logo.decode().then(
    () => {
      if (!alive) return;
      makeBase();
      sizeLogo();
      render(performance.now());
    },
    () => {} // no image: letters only
  );
  document.fonts
    .load(font, LETTERS)
    .catch(() => [])
    .then(() => {
      if (!alive) return;
      ctx.font = font;
      glyphs = Array.from(LETTERS, (ch) => {
        const m = ctx.measureText(ch);
        const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
        return {
          ch,
          x: (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2,
          y: (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
          k: 1 / Math.max(w, h),
        };
      });
      render(performance.now());
    });

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    s = Math.min(1.15, Math.max(0.7, width / 1440));
    sizeLogo();
  }

  function render(now: number) {
    const t = still ? 0 : (now - start) / 1000;
    const col = COL * s;
    const row = ROW * s;
    const ox = DRIFT_X * t;
    const oy = DRIFT_Y * t;
    const logoW = sized.width / dpr;
    const logoH = sized.height / dpr;
    const margin = Math.max(logoW, row);

    // The light band: where its centre is along the travel direction, or none between sweeps
    const ux = Math.cos(SWEEP_ANGLE);
    const uy = Math.sin(SWEEP_ANGLE);
    const ends = [0, width * ux, height * uy, width * ux + height * uy];
    const from = Math.min(...ends) - 2 * SWEEP_WIDTH;
    const to = Math.max(...ends) + 2 * SWEEP_WIDTH;
    const phase = mod(t, SWEEP_EVERY) / SWEEP_FOR;
    const band = still || phase >= 1 ? null : from + (to - from) * smooth(phase);
    const light = (x: number, y: number) => {
      if (band === null) return 1;
      const d = (x * ux + y * uy - band) / SWEEP_WIDTH;
      return 1 + (LIT - 1) * Math.exp(-d * d);
    };

    // The frosted surfaces over the pattern (cards, header), skipping any
    // inside another so the even-odd clip below stays right
    const covers: { x: number; y: number; w: number; h: number; r: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(COVERS)) {
      if (el.parentElement?.closest(COVERS)) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || b.bottom < 0 || b.top > height) continue;
      let r = radii.get(el);
      if (r === undefined) {
        r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
        radii.set(el, r);
      }
      covers.push({ x: b.left, y: b.top, w: b.width, h: b.height, r });
    }
    const outline = (c: (typeof covers)[number]) =>
      ctx.roundRect ? ctx.roundRect(c.x, c.y, c.w, c.h, c.r) : ctx.rect(c.x, c.y, c.w, c.h);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = GOLD;

    // Full strength everywhere but under the surfaces…
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    covers.forEach(outline);
    ctx.clip("evenodd");
    drawAll(1);
    ctx.restore();
    // …and faint under them, so their text stays clear
    if (covers.length) {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      covers.forEach(outline);
      ctx.clip();
      drawAll(UNDER);
      ctx.restore();
    }

    function drawAll(strength: number) {
      const j0 = Math.floor((-margin - oy) / row);
      const j1 = Math.ceil((height + margin - oy) / row);
      for (let j = j0; j <= j1; j++) {
        const y = j * row + oy;
        const shift = mod(j, 2) * (col / 2);
        const i0 = Math.floor((-margin - ox - shift) / col) - 1;
        const i1 = Math.ceil((width + margin - ox - shift) / col);
        for (let i = i0; i <= i1; i++) {
          const x = i * col + shift + ox;
          if (base) {
            ctx.globalAlpha = strength * Math.min(1, LOGO_ALPHA * light(x, y));
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(sized, (x - logoW / 2) * dpr, (y - logoH / 2) * dpr);
          }
          if (glyphs.length) {
            // Right to left along the row, as Arabic reads; each row carries on from the last
            const g = glyphs[mod(4 * j - i, glyphs.length)];
            const lx = x + col / 2;
            const q = dpr * LETTER_SIZE * s * g.k; // device px per font px at 100px
            ctx.globalAlpha = strength * Math.min(1, LETTER_ALPHA * light(lx, y));
            ctx.setTransform(q, 0, 0, q, lx * dpr, y * dpr);
            ctx.fillText(g.ch, g.x, g.y);
          }
        }
      }
      ctx.globalAlpha = 1;
    }
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
    alive = false;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", onResize);
  };
}

export function BrandPattern() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || dark) return;
    return mountPattern(canvas, ctx);
  }, [dark]);

  return <canvas ref={canvasRef} aria-hidden="true" className="adm-wave pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
