"use client";

import * as React from "react";
import { useTheme } from "next-themes";

// Islamic star lattice with Arabic letters behind the admin dashboard, light
// mode only (globals.css shows the canvas only under html:not(.dark)
// .admin-brand). Not in use: shell.tsx now draws BrandPattern
// (brand-pattern.tsx). Kept so it can come back by swapping the import there.
//
// The pattern is the classic 8-point star drawn by Hankin's "polygons in
// contact" method on the octagon-and-square tiling: from the middle of every
// edge two lines leave at CONTACT to the edge and run until they meet the
// lines of the next edge. That puts an 8-point star in each octagon and a
// small 4-point star in each square. Every line is drawn as a strap (two
// parallel lines) that goes over and under in turn at the crossings, like
// carved jaali, and the 8-point stars are filled a lighter cream.
//
// The flat pattern lies on a surface lifted by a gentle swell (X across, Z
// away from the camera, Y up) and is seen through a tilted perspective camera,
// so it rolls slowly like silk. The academy's QW mark lies in some of the
// star centres and fades in and out (or Arabic letters, a different one each
// time: see MOTIF).

const VIEW = 1600; // drawing units across the screen's longer side
const CELL = 1.8; // distance between star centres
const CONTACT = (60 * Math.PI) / 180; // 60°: crisp 8-point stars, straps crossing at 60°
const STRAP = 0.05 * CELL; // strap width
const GAP = 0.022 * CELL; // clearance either side of the strap on top at a crossing
const STEP = 0.2; // straight lines are cut this fine so they bend with the swell
const CAM_H = 14;
const PITCH = (62 * Math.PI) / 180; // the camera looks 62° down
const COS_P = Math.cos(PITCH);
const SIN_P = Math.sin(PITCH);
const FOCAL = 2000;
const SPEED = 0.3; // swell phase, radians per second
const SWELL = 0.54; // the highest surface() reaches
const FRAME_MS = 1000 / 30; // 30 fps is plenty for a slow swell
const SHADES = 5; // lines come in this many strengths, strongest on the crests
const LINE = "29, 106, 229";
const LINE_ALPHA = 0.7;
const STAR = "255, 255, 255";
const STAR_ALPHA = 0.6;
const GOLD = "#b8902f";
// What sits in the star centres: the QW mark (logo-mark.png, cut from
// quran-academy-logo.png without the "Quran West" wording), or "letters"
const MOTIF: "logo" | "letters" = "logo";
const LOGO_SRC = "/assets/images/logo-mark.png";
const LOGO_WIDTH = 0.36 * CELL; // the widest that fits inside a star
const LOGO_ALPHA = 0.6;
// The mark in one gold, like a watermark. null keeps its own navy and gold,
// but faded navy turns grey and leaves dark smudges behind the glass cards.
const LOGO_TINT: string | null = GOLD;
const LETTERS = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
const LETTER_BOX = 0.3 * CELL; // a letter's longer side
const LETTER_ALPHA = 0.55;
// The top of the screen fades out so the far rows melt into the cream:
// nothing above FADE_FROM of the height, full strength below FADE_TO
const FADE_FROM = 0.04;
const FADE_TO = 0.45;

// The swell rolls towards the viewer and hardly changes across X, so rows of
// stars stay level instead of tilting, and the slopes stay too gentle to fold
function surface(X: number, Z: number, time: number) {
  return Math.sin(0.5 * Z + 0.02 * X + time) * 0.4 + Math.sin(0.85 * Z - 0.03 * X + 1 + time * 1.25) * 0.14;
}

// Where a surface point lands, in drawing units from the screen centre, into out[k], out[k + 1]
function project(X: number, Y: number, Z: number, out: Float32Array, k: number) {
  const drop = CAM_H - Y;
  const depth = drop * SIN_P + Z * COS_P;
  out[k] = (X / depth) * FOCAL;
  out[k + 1] = -((Z * SIN_P - drop * COS_P) / depth) * FOCAL;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

// How strongly a letter shows over its cycle: fade in, hold, fade out, rest
function envelope(u: number) {
  if (u < 0.15) return smooth(u / 0.15);
  if (u < 0.5) return 1;
  if (u < 0.65) return smooth((0.65 - u) / 0.15);
  return 0;
}

// Small integer hash, so the letters and their timing look random but come
// out the same on every visit
function hash(a: number, b: number) {
  let h = Math.imul(a, 374761393) ^ Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function unit(x: number, z: number): [number, number] {
  const l = Math.hypot(x, z);
  return [x / l, z / l];
}

// The pattern, flat on the surface, for a screen w × h drawing units: every
// strap edge as a polyline of (X, Z) points, the outline of every 8-point
// star's inside, and the star centres that take a motif
function buildLattice(w: number, h: number) {
  const pts: number[] = [];
  const runs: number[] = []; // strap edges: first point and point count of each polyline
  const stars: number[] = []; // the same for the star insides
  const slots: number[] = []; // X, Z and a random seed per motif
  const half = STRAP / 2;
  const clear = half + GAP;
  const at = new Float32Array(2);

  // Would a shape of radius r around (X, Z) show on screen, swell allowed for?
  function onScreen(X: number, Z: number, r: number) {
    const depth = CAM_H * SIN_P + Z * COS_P;
    if (depth < 1) return false;
    project(X, 0, Z, at, 0);
    const pad = ((r + SWELL) / depth) * FOCAL;
    return Math.abs(at[0]) < w / 2 + pad && Math.abs(at[1]) < h / 2 + pad;
  }

  // A polyline through the given corners, cut into STEP-long pieces
  function addLine(list: number[], corners: number[]) {
    const first = pts.length / 2;
    pts.push(corners[0], corners[1]);
    for (let i = 2; i < corners.length; i += 2) {
      const ax = corners[i - 2];
      const az = corners[i - 1];
      const n = Math.max(1, Math.ceil(Math.hypot(corners[i] - ax, corners[i + 1] - az) / STEP));
      for (let s = 1; s <= n; s++) pts.push(ax + ((corners[i] - ax) * s) / n, az + ((corners[i + 1] - az) * s) / n);
    }
    list.push(first, pts.length / 2 - first);
  }

  // The star in a regular n-gon centred on (cx, cz), its first edge facing
  // the angle `turn`. Its outline runs mid 0, notch 0, mid 1, notch 1… where
  // the mids are the edge midpoints (the crossings) and the notches the inner
  // corners. Going round, each strap is on top at the mid it leaves and
  // underneath at the mid it reaches, which makes every line go over and
  // under in turn across the whole pattern.
  function addStar(cx: number, cz: number, n: number, apothem: number, turn: number) {
    const notch = apothem / (Math.cos(Math.PI / n) + Math.sin(Math.PI / n) * Math.tan(CONTACT));
    const mx: number[] = [];
    const mz: number[] = [];
    const nx: number[] = [];
    const nz: number[] = [];
    for (let k = 0; k < n; k++) {
      const a = turn + (2 * Math.PI * k) / n;
      mx.push(cx + apothem * Math.cos(a));
      mz.push(cz + apothem * Math.sin(a));
      nx.push(cx + notch * Math.cos(a + Math.PI / n));
      nz.push(cz + notch * Math.sin(a + Math.PI / n));
    }
    // Unit directions: a runs from mid k to notch k, b from notch k to mid k+1.
    // Their normals are the directions turned 90° left, which going round
    // anticlockwise points into the star.
    const ax: number[] = [];
    const az: number[] = [];
    const bx: number[] = [];
    const bz: number[] = [];
    for (let k = 0; k < n; k++) {
      const k1 = (k + 1) % n;
      const [x1, z1] = unit(nx[k] - mx[k], nz[k] - mz[k]);
      const [x2, z2] = unit(mx[k1] - nx[k], mz[k1] - nz[k]);
      ax.push(x1);
      az.push(z1);
      bx.push(x2);
      bz.push(z2);
    }
    const body: number[] = []; // the inside of the star, along the straps' inner edges
    for (let k = 0; k < n; k++) {
      const k1 = (k + 1) % n;
      const p = (k + n - 1) % n;
      const tip = 1 + bz[p] * az[k] + bx[p] * ax[k];
      const miter = 1 + az[k] * bz[k] + ax[k] * bx[k];
      body.push(
        mx[k] - ((bz[p] + az[k]) * half) / tip,
        mz[k] + ((bx[p] + ax[k]) * half) / tip,
        nx[k] - ((az[k] + bz[k]) * half) / miter,
        nz[k] + ((ax[k] + bx[k]) * half) / miter
      );
      // The strap on top at mid k+1 runs along a[k+1]
      const c1 = bz[k] * az[k1] + bx[k] * ax[k1];
      const c2 = bz[k] * ax[k1] - bx[k] * az[k1];
      for (const side of [half, -half]) {
        // Underneath at mid k+1: stop short of the strap on top, plus GAP
        const s = Math.max((side * c1 - clear) / c2, (side * c1 + clear) / c2);
        addLine(runs, [
          mx[k] - az[k] * side,
          mz[k] + ax[k] * side,
          nx[k] - ((az[k] + bz[k]) * side) / miter,
          nz[k] + ((ax[k] + bx[k]) * side) / miter,
          mx[k1] - bz[k] * side - bx[k] * s,
          mz[k1] + bx[k] * side - bz[k] * s,
        ]);
      }
    }
    if (n === 8) addLine(stars, [...body, body[0], body[1]]);
  }

  const octagon = CELL / 2;
  const square = (CELL * (Math.SQRT2 - 1)) / 2;
  for (let j = -4; j <= 24; j++) {
    for (let i = -20; i <= 20; i++) {
      const X = i * CELL;
      const Z = j * CELL;
      if (onScreen(X, Z, octagon)) {
        addStar(X, Z, 8, octagon, 0);
        if (hash(i, j) % 3 !== 0) slots.push(X, Z, hash(j, i));
      }
      if (onScreen(X + CELL / 2, Z + CELL / 2, square)) addStar(X + CELL / 2, Z + CELL / 2, 4, square, Math.PI / 4);
    }
  }
  return { pts: new Float32Array(pts), runs: new Int32Array(runs), stars: new Int32Array(stars), slots };
}

// Starts drawing on the canvas; returns the clean-up
function mountLattice(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const corner = new Float32Array(6);
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let scale = 1; // CSS px per drawing unit
  let frame = 0;
  let last = 0;
  let alive = true;
  const start = performance.now();

  // Set by resize(): the pattern for this screen and its buffers
  let lattice = buildLattice(0, 0);
  let screen = new Float32Array(0);
  let lift = new Float32Array(0);
  let shade = new Uint8Array(0);
  let stroke: CanvasGradient;
  let fill: CanvasGradient;
  let fadeFrom = 0;
  let fadeSpan = 1;

  const fade = (y: number) => Math.min(1, Math.max(0, (y - fadeFrom) / fadeSpan));
  function faded(rgb: string, alpha: number) {
    const g = ctx.createLinearGradient(0, fadeFrom, 0, fadeFrom + fadeSpan);
    g.addColorStop(0, `rgba(${rgb}, 0)`);
    g.addColorStop(1, `rgba(${rgb}, ${alpha})`);
    return g;
  }

  // The motif is drawn once its image or font is ready
  let ready = false;
  const logo = new Image();
  let mark: HTMLImageElement | HTMLCanvasElement = logo; // the logo, or its gold copy
  let logoHeight = 0;
  // Letters in Amiri (loaded by layout.tsx), each measured so its ink is
  // centred and its longer side is LETTER_BOX
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-amiri").trim() || "Amiri";
  const font = `700 100px ${family}, serif`;
  let glyphs: { ch: string; x: number; y: number; k: number }[] = [];
  if (MOTIF === "logo") {
    logo.src = LOGO_SRC;
    logo.decode().then(
      () => {
        if (!alive) return;
        logoHeight = (LOGO_WIDTH * logo.naturalHeight) / logo.naturalWidth;
        const tint = document.createElement("canvas");
        const tc = tint.getContext("2d");
        if (LOGO_TINT && tc) {
          tint.width = logo.naturalWidth;
          tint.height = logo.naturalHeight;
          tc.drawImage(logo, 0, 0);
          tc.globalCompositeOperation = "source-in"; // keep the shape, swap the colour
          tc.fillStyle = LOGO_TINT;
          tc.fillRect(0, 0, tint.width, tint.height);
          mark = tint;
        }
        ready = true;
        render(performance.now());
      },
      () => {} // no image, no motif
    );
  } else {
    document.fonts
      .load(font, LETTERS)
      .catch(() => [])
      .then(() => {
        if (!alive) return;
        ctx.font = font;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        glyphs = Array.from(LETTERS, (ch) => {
          const m = ctx.measureText(ch);
          const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
          const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
          return {
            ch,
            x: (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2,
            y: (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
            k: LETTER_BOX / Math.max(w, h),
          };
        });
        ready = true;
        render(performance.now());
      });
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // Sized by the longer side, so a phone held upright shows more of the
    // pattern instead of a close-up of two stars
    scale = Math.max(width, height, 1) / VIEW;
    const w = width / scale;
    const h = height / scale;
    lattice = buildLattice(w, h);
    const count = lattice.pts.length / 2;
    screen = new Float32Array(count * 2);
    lift = new Float32Array(count);
    shade = new Uint8Array(lattice.runs.length / 2);
    fadeFrom = -h / 2 + FADE_FROM * h;
    fadeSpan = (FADE_TO - FADE_FROM) * h;
    stroke = faded(LINE, LINE_ALPHA);
    fill = faded(STAR, STAR_ALPHA);
  }

  function render(now: number) {
    const { pts, runs, stars, slots } = lattice;
    const seconds = still ? 0 : (now - start) / 1000;
    const time = seconds * SPEED;
    for (let p = 0; p < lift.length; p++) {
      lift[p] = surface(pts[2 * p], pts[2 * p + 1], time);
      project(pts[2 * p], lift[p], pts[2 * p + 1], screen, 2 * p);
    }

    const view = [dpr * scale, 0, 0, dpr * scale, (dpr * width) / 2, (dpr * height) / 2] as const;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.setTransform(...view);

    // Star insides, a lighter cream so each star stands out as a shape
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (let r = 0; r < stars.length; r += 2) {
      const first = stars[r];
      const end = first + stars[r + 1];
      ctx.moveTo(screen[2 * first], screen[2 * first + 1]);
      for (let p = first + 1; p < end; p++) ctx.lineTo(screen[2 * p], screen[2 * p + 1]);
      ctx.closePath();
    }
    ctx.fill();

    // Straps: stronger on the crests, so the swell reads as light on silk
    for (let r = 0; r < shade.length; r++) {
      const mid = runs[2 * r] + (runs[2 * r + 1] >> 1);
      shade[r] = Math.min(SHADES - 1, Math.floor(((lift[mid] + SWELL) / (2 * SWELL)) * SHADES));
    }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1 / scale; // 1 CSS px whatever the scale
    ctx.lineJoin = "round";
    for (let s = 0; s < SHADES; s++) {
      ctx.globalAlpha = 0.45 + (0.55 * s) / (SHADES - 1);
      ctx.beginPath();
      for (let r = 0; r < shade.length; r++) {
        if (shade[r] !== s) continue;
        const first = runs[2 * r];
        const end = first + runs[2 * r + 1];
        ctx.moveTo(screen[2 * first], screen[2 * first + 1]);
        for (let p = first + 1; p < end; p++) ctx.lineTo(screen[2 * p], screen[2 * p + 1]);
      }
      ctx.stroke();
    }

    // Motifs: each lies flat on the surface at its star centre, mapped
    // through the projection of a small step along X and along Z
    if (ready) {
      ctx.font = font;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = GOLD;
      ctx.imageSmoothingQuality = "high"; // the mark is shrunk a lot; avoid shimmer
      const strength = MOTIF === "logo" ? LOGO_ALPHA : LETTER_ALPHA;
      const d = 0.05;
      for (let i = 0; i < slots.length; i += 3) {
        const X = slots[i];
        const Z = slots[i + 1];
        const seed = slots[i + 2];
        const period = 9 + (seed % 600) / 100;
        const t = seconds + (((seed >>> 12) % 1000) / 1000) * period;
        const cycle = Math.floor(t / period);
        const glow = envelope(t / period - cycle);
        if (glow <= 0) continue;
        const Y = surface(X, Z, time);
        project(X, Y, Z, corner, 0);
        project(X + d, surface(X + d, Z, time), Z, corner, 2);
        project(X, surface(X, Z + d, time), Z + d, corner, 4);
        const alpha = strength * glow * (0.55 + (0.45 * (Y + SWELL)) / (2 * SWELL)) * fade(corner[1]);
        if (alpha < 0.01) continue;
        // The mark is drawn in surface units; a letter in font px, scaled to LETTER_BOX
        const g = MOTIF === "letters" ? glyphs[hash(seed, cycle) % glyphs.length] : null;
        const k = (g ? g.k : 1) / d;
        ctx.globalAlpha = alpha;
        ctx.setTransform(...view);
        // Image/text x runs along +X; y (downwards) runs towards the camera, along -Z
        ctx.transform(
          (corner[2] - corner[0]) * k,
          (corner[3] - corner[1]) * k,
          (corner[0] - corner[4]) * k,
          (corner[1] - corner[5]) * k,
          corner[0],
          corner[1]
        );
        if (g) ctx.fillText(g.ch, g.x, g.y);
        else ctx.drawImage(mark, -LOGO_WIDTH / 2, -logoHeight / 2, LOGO_WIDTH, logoHeight);
      }
    }
    ctx.globalAlpha = 1;
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

  // Rebuild for the new screen; a still canvas just redraws once
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

export function StarLattice() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || dark) return;
    return mountLattice(canvas, ctx);
  }, [dark]);

  return <canvas ref={canvasRef} aria-hidden="true" className="adm-wave pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
