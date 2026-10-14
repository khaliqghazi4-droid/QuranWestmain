"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { withHighlights } from "@/components/with-highlights";

// Who We Teach map: a dotted world map (public/assets/images/world-dots.svg,
// built from Natural Earth land data) with routes drawn from our two teaching
// centres, in Pakistan and the UK, out to each region, and when classes run
// there. Both use the same equirectangular projection: lon -170..170, lat
// -50..75 at 4 units per degree, so a place's real lon/lat puts it in the
// right spot.
const MAP_W = 1360;
const MAP_H = 500;
const mapXY = (lon, lat) => [(lon + 170) * 4, (75 - lat) * 4];
const pct = ([x, y]) => ({ left: `${(x / MAP_W) * 100}%`, top: `${(y / MAP_H) * 100}%` });

// `box`: where the info box sits beside the point (lg+), `dy` (and for
// "below", `dx`) nudge it in px; `label`: where the name sits on smaller
// screens, which show the info in a list under the map instead.
const PK_HUB = {
  name: "Quran West, Pakistan",
  short: "Pakistan", // the ring and the list below mark it as a centre
  info: "**Faisalabad**. Lessons taught live from our own centre.",
  at: mapXY(73.1, 31.4),
  box: "right",
  dy: 18,
  label: "right", // the routes leave it to the left and below
};
const UK_HUB = {
  name: "Quran West, UK",
  short: "UK",
  hub: true,
  info: "**Watford**. After school, evenings and weekend mornings, on **GMT/BST**.",
  at: mapXY(-1.5, 52.5),
  box: "below", // left of the point is where the Atlantic routes go
  dx: -110,
  dy: 0,
  label: "below",
};
const EUROPE = {
  name: "Europe",
  info: "After school, evenings and weekend mornings, on **CET**.",
  at: mapXY(15, 50),
  box: "right",
  dy: -16,
  label: "right",
};
const CANADA = {
  name: "Canada",
  info: "After school and evenings, **Eastern** to **Pacific** time.",
  at: mapXY(-95, 56),
  box: "left",
  dy: -20,
  label: "above",
};
const USA = {
  name: "USA",
  info: "After school and evenings, on **ET**, **CT** and **PT**.",
  at: mapXY(-98, 38),
  box: "left",
  dy: 40,
  label: "below",
};
const AUSTRALIA = {
  name: "Australia",
  info: "After-school and weekend classes on **AEST**.",
  at: mapXY(134, -25),
  box: "below",
  dy: 0,
  label: "below",
};
// Every place but Pakistan
const TEACH_STOPS = [UK_HUB, EUROPE, CANADA, USA, AUSTRALIA];

// Routes from the two centres, all drawn at once. `via` is the curve's
// control point; they bend away from the info boxes so none crosses one
// (the UK ones arch up over the Atlantic and down through the Indian Ocean).
const TEACH_ROUTES = [
  { from: PK_HUB, to: UK_HUB, via: [830, 230] },
  { from: PK_HUB, to: EUROPE, via: [760, 260] },
  { from: UK_HUB, to: EUROPE, via: [707, 55] },
  { from: UK_HUB, to: CANADA, via: [490, 10] },
  { from: UK_HUB, to: USA, via: [470, 20] },
  { from: PK_HUB, to: AUSTRALIA, via: [1000, 380] },
  { from: UK_HUB, to: AUSTRALIA, via: [900, 380] },
];
const routePath = ({ from, to, via }) =>
  `M${from.at[0]} ${from.at[1]} Q${via[0]} ${via[1]} ${to.at[0]} ${to.at[1]}`;
// Seconds for a light to travel a route, so they all move at the same speed
const travelTime = ({ from, to, via }) =>
  Math.max(1.6, (Math.hypot(via[0] - from.at[0], via[1] - from.at[1]) + Math.hypot(to.at[0] - via[0], to.at[1] - via[1])) / 130);

// Timeline (s): the map fades in with every point and info box, then all the
// routes draw out together and a light starts travelling each one.
const PLACES_AT = 0.2;
const ROUTES_AT = 0.5;
const ROUTE_DRAW = 0.9;
const TRAVELLERS_AT = ROUTES_AT + ROUTE_DRAW;

const appear = (delay) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, delay } },
});
const pop = (delay) => ({
  hidden: { opacity: 0, scale: 0.4 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 18, delay } },
});
const rise = (delay) => ({
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", delay } },
});

const TEACH_MAP_CSS = `
  @keyframes tm-ping { from { transform: scale(1); opacity: .7; } to { transform: scale(3.2); opacity: 0; } }
  .tm-ping { animation: tm-ping 2.4s ease-out infinite; }
  @media (prefers-reduced-motion: reduce) { .tm-ping { animation: none; opacity: 0; } }
`;

// Translates placing an info box beside its point
const BOX_PLACE = {
  left: (dy) => `translate(calc(-100% - 18px), calc(-50% + ${dy}px))`,
  right: (dy) => `translate(18px, calc(-50% + ${dy}px))`,
  below: (dy, dx = 0) => `translate(calc(-50% + ${dx}px), ${22 + dy}px)`,
};
// ...and a name label on smaller screens
const LABEL_PLACE = {
  left: "translate(calc(-100% - 8px), -50%)",
  right: "translate(8px, -50%)",
  above: "translate(-50%, calc(-100% - 8px))",
  below: "translate(-50%, 8px)",
};

function MapPoint({ at, delay, hub = false }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(at)}>
      <motion.span className="relative block" variants={pop(delay)}>
        <span
          aria-hidden="true"
          className="tm-ping absolute inset-0 rounded-full border-[1.5px] border-solid border-[#EECC65]"
        />
        <span
          className={`relative block rounded-full bg-[#EECC65] shadow-[0_0_12px_2px_rgba(238,204,101,0.55)] ${
            hub
              ? "h-[12px] w-[12px] lg:h-[16px] lg:w-[16px] ring-[3px] ring-[#0B1A37] ring-inset"
              : "h-[8px] w-[8px] lg:h-[10px] lg:w-[10px]"
          }`}
        />
      </motion.span>
    </div>
  );
}

function MapInfo({ place, delay }) {
  return (
    <div
      className="absolute z-10 hidden w-[176px] lg:block xl:w-[206px]"
      style={{ ...pct(place.at), transform: BOX_PLACE[place.box](place.dy, place.dx) }}
    >
      <motion.div
        variants={rise(delay)}
        className="rounded-[12px] border-[1px] border-solid border-[#EECC65]/30 bg-[#0B1A37]/85 px-[12px] py-[10px] shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-[2px]"
      >
        <p className="!m-0 !text-[14px] !font-bold !leading-tight !text-white">{place.name}</p>
        <p className="!mt-[4px] !mb-0 !text-[12.5px] !leading-snug !text-white/70">
          {withHighlights(place.info, "text-[#EECC65]")}
        </p>
      </motion.div>
    </div>
  );
}

export default function TeachMap() {
  // Without motion: everything shown at once, no moving lights
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showTravellers = mounted && !reduceMotion;

  return (
    <motion.div
      initial={reduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: false, amount: 0.3 }}
    >
      <style>{TEACH_MAP_CSS}</style>
      <div className="relative mx-auto w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
        <motion.img
          src="/assets/images/world-dots.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          variants={appear(0)}
        />

        <svg
          aria-hidden="true"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          {TEACH_ROUTES.map((route, i) => {
            const d = routePath(route);
            return (
              <g key={`${route.from.name}-${route.to.name}`}>
                {/* Gold route drawing itself out from its centre */}
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#EECC65"
                  strokeOpacity="0.6"
                  strokeLinecap="round"
                  className="[stroke-width:5] lg:[stroke-width:2.6]"
                  variants={{
                    hidden: { pathLength: 0 },
                    show: {
                      pathLength: 1,
                      transition: {
                        duration: ROUTE_DRAW,
                        ease: "easeInOut",
                        delay: ROUTES_AT,
                      },
                    },
                  }}
                />
                {/* A glowing light that keeps travelling the route once it's
                    drawn; bigger below lg, where the map is scaled down */}
                {showTravellers && (
                  <motion.g variants={appear(TRAVELLERS_AT)}>
                    <g>
                      <g className="lg:hidden">
                        <circle r="15" fill="#EECC65" fillOpacity="0.3" />
                        <circle r="7.5" fill="#FFF3C4" />
                      </g>
                      <g className="hidden lg:inline">
                        <circle r="8.5" fill="#EECC65" fillOpacity="0.3" />
                        <circle r="4.5" fill="#FFF3C4" />
                      </g>
                      <animateMotion
                        dur={`${travelTime(route)}s`}
                        begin={`${-i * 0.7}s`}
                        repeatCount="indefinite"
                        path={d}
                      />
                    </g>
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>

        <MapPoint at={PK_HUB.at} delay={PLACES_AT} hub />
        {TEACH_STOPS.map((stop) => (
          <MapPoint key={stop.name} at={stop.at} delay={PLACES_AT} hub={stop.hub} />
        ))}

        {/* Info boxes (lg+) */}
        {[PK_HUB, ...TEACH_STOPS].map((place) => (
          <MapInfo key={place.name} place={place} delay={PLACES_AT + 0.1} />
        ))}

        {/* Names only, below lg */}
        {[PK_HUB, ...TEACH_STOPS].map((place) => (
          <div
            key={place.name}
            className="absolute whitespace-nowrap lg:hidden"
            style={{ ...pct(place.at), transform: LABEL_PLACE[place.label] }}
          >
            <motion.span
              variants={appear(PLACES_AT + 0.1)}
              className="block text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-[#EECC65] sm:text-[11px]"
            >
              {place.short ?? place.name}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Below lg the info sits in a list under the map, centres first */}
      <ul className="!mx-auto !mt-[28px] !mb-0 grid max-w-[640px] list-none gap-x-[28px] gap-y-[16px] !p-0 sm:grid-cols-2 lg:hidden">
        {[PK_HUB, ...TEACH_STOPS].map((place, k) => (
          <motion.li
            key={place.name}
            className="flex gap-[12px]"
            variants={rise(PLACES_AT + 0.1)}
          >
            <span
              className={`mt-[7px] h-[8px] w-[8px] shrink-0 rounded-full bg-[#EECC65] shadow-[0_0_8px_2px_rgba(238,204,101,0.5)] ${
                k === 0 || place.hub
                  ? "ring-[2px] ring-[#EECC65]/40 ring-offset-[2px] ring-offset-[#0B1A37]"
                  : ""
              }`}
            />
            <span>
              <span className="block text-[15px] font-bold text-white">{place.name}</span>
              <span className="mt-[2px] block text-[14px] leading-snug text-white/70">
                {withHighlights(place.info, "text-[#EECC65]")}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
