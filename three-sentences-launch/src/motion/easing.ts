import { Easing } from "remotion";

export const ease = {
  /** Overshoot spring — dot entrances, mark assembly. */
  juggle: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Smooth, deliberate — text fades, screen reveals, scale moves. */
  editorial: Easing.bezier(0.16, 1, 0.3, 1),
  /** Sharp, no overshoot — locked states, submit confirmations. */
  discipline: Easing.bezier(0.45, 0, 0.55, 1),
} as const;
