/* The year, as the page counts it: 365 nights, two of them grace. */

export const NIGHTS = 365;
/** The nights that are never "kept" on the drum: the two days of grace. */
export const GRACE_NIGHTS: readonly number[] = [140, 262];
export const KEPT_NIGHTS = NIGHTS - GRACE_NIGHTS.length; // 363

const DAY_MS = 86_400_000;

/** Zero-based index of tonight within the year, DST-safe (calendar days via UTC). */
export function tonightIndex(now: Date = new Date()): number {
  const start = Date.UTC(now.getFullYear(), 0, 0);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfYear = Math.round((today - start) / DAY_MS); // 1..366
  return Math.min(NIGHTS - 1, Math.max(0, dayOfYear - 1));
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Nights in the order they light up: every night except the grace nights, scattered the way a real year fills.
 *  Seeded, so the server, the browser and every visitor see the same year. */
export const KEPT_ORDER: readonly number[] = (() => {
  const order = Array.from({ length: NIGHTS }, (_, i) => i).filter((i) => !GRACE_NIGHTS.includes(i));
  const rand = mulberry32(363);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
})();

/** Events the page and the scene use to talk to each other. */
export const SCENE_EVENTS = {
  keep: "three:keep",
  hover: "three:hover",
} as const;

export interface HoverDetail {
  night: number;
  x: number;
  y: number;
  kept: boolean;
  grace: boolean;
}
