import { interpolate } from "remotion";

// ─── FADE HELPERS ────────────────────────────────────────────────

/** Fade in: 0→1 over `dur` frames starting at `from` */
export const fi = (frame: number, from: number, dur = 20) =>
  interpolate(frame, [from, from + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Fade out: 1→0 over `dur` frames starting at `from` */
export const fo = (frame: number, from: number, dur = 20) =>
  interpolate(frame, [from, from + dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ─── BLUR TRANSITION ────────────────────────────────────────────

/** Returns a blur CSS filter value transitioning from `maxBlur` to 0 (focus pull) */
export const blurIn = (frame: number, from: number, dur = 15, maxBlur = 10) => {
  const progress = interpolate(frame, [from, from + dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return `blur(${progress * maxBlur}px)`;
};

/** Returns a blur CSS filter value transitioning from 0 to `maxBlur` (defocus) */
export const blurOut = (frame: number, from: number, dur = 15, maxBlur = 12) => {
  const progress = interpolate(frame, [from, from + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return `blur(${progress * maxBlur}px)`;
};

// ─── TYPEWRITER ──────────────────────────────────────────────────

/** Returns a substring of `text` typed out character by character */
export const getTyped = (
  frame: number,
  text: string,
  startFrame: number,
  charsPerFrame = 0.4,
) => {
  if (frame < startFrame) return "";
  const elapsed = frame - startFrame;
  const chars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  return text.slice(0, chars);
};

// ─── SEEDED RANDOM ───────────────────────────────────────────────
// Deterministic pseudo-random for Remotion (same frame = same output)

export const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Returns a random character from the set, deterministic based on seed */
export const randomChar = (seed: number, charset: string) => {
  const idx = Math.floor(seededRandom(seed) * charset.length);
  return charset[idx];
};
