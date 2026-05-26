// All values are absolute composition frames at 30fps.
// Total: 1650 frames = 55 seconds.
export const SCENE_STARTS = {
  s1: 0,     // Opening       0–180   (6s)
  s2: 180,   // Antagonist  180–420   (8s)
  s3: 420,   // Rule        420–660   (8s)
  s4: 660,   // Typing      660–960  (10s)
  s5: 960,   // App tour    960–1320 (12s)
  s6: 1320,  // 363        1320–1500  (6s)
  s7: 1500,  // Close      1500–1650  (5s)
} as const;

export const SCENE_DURATIONS = {
  s1: 180,
  s2: 240,
  s3: 240,
  s4: 300,
  s5: 360,
  s6: 180,
  s7: 150,
} as const;

export const TOTAL_FRAMES = 1650;
export const FPS = 30;
