# LaunchFilm — 55-Second Editorial Product Film

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 55-second (1650-frame, 30fps) editorial launch film `LaunchFilm` for Three Sentences, living inside `three-sentences-launch/` as a new Remotion composition alongside the existing 10-second teaser.

**Architecture:** Seven scene components (`Scene01`–`Scene07`) orchestrated in `LaunchFilm.tsx` via `<Sequence>`. All animation is frame-driven via `useCurrentFrame()` — zero `setTimeout`/`useEffect`/state. Shared primitives (`JugglingDots`, `PhoneFrame`, four screen components) live in `src/components/`. Motion math (easing curves, scene timing constants) lives in `src/motion/`. New scenes go in `src/scenes/launch/` to avoid colliding with the existing 10-second teaser scenes in `src/scenes/`.

**Tech Stack:** Remotion 4.0.466, @remotion/google-fonts (already installed), @remotion/noise (add), React 19, TypeScript 5.9. All work is inside `three-sentences-launch/`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Modify** | `package.json` | add @remotion/noise, add render scripts |
| **Create** | `src/motion/easing.ts` | three named easing curves |
| **Create** | `src/motion/timing.ts` | SCENE_STARTS, SCENE_DURATIONS constants |
| **Create** | `src/components/Dot.tsx` | single ivory dot primitive |
| **Create** | `src/components/JugglingDots.tsx` | the brand motif — all modes |
| **Create** | `src/components/type-components.tsx` | Eyebrow, Display, Lead, Mono styled wrappers |
| **Create** | `src/components/Grain.tsx` | film grain post-effect overlay |
| **Create** | `src/components/Vignette.tsx` | corner vignette overlay |
| **Modify** | `src/components/DotGrid.tsx` | add `opacity` and `cell` props |
| **Create** | `src/components/PhoneFrame.tsx` | device shell (extends MiniPhone) |
| **Create** | `src/components/ScreenToday.tsx` | Today screen static render |
| **Create** | `src/components/ScreenHistory.tsx` | History calendar screen |
| **Create** | `src/components/ScreenInsights.tsx` | Insights / streak screen |
| **Create** | `src/components/ScreenCircle.tsx` | Circle friends screen |
| **Create** | `src/LaunchFilm.tsx` | master composition + Sequence orchestration |
| **Modify** | `src/Root.tsx` | register LaunchFilm, LaunchFilm-9x16, LaunchFilm-1x1 |
| **Create** | `src/scenes/launch/Scene01_Opening.tsx` | 0–6s juggle + wordmark + tagline |
| **Create** | `src/scenes/launch/Scene02_Antagonist.tsx` | 6–14s antagonist text |
| **Create** | `src/scenes/launch/Scene03_TheRule.tsx` | 14–22s three dots as period |
| **Create** | `src/scenes/launch/Scene04_TypingDemo.tsx` | 22–32s live typing + submit |
| **Create** | `src/scenes/launch/Scene05_AppTour.tsx` | 32–44s four-screen tour |
| **Create** | `src/scenes/launch/Scene06_363.tsx` | 44–50s counting numeral + philosophy |
| **Create** | `src/scenes/launch/Scene07_Close.tsx` | 50–55s mark morph + CTA |

---

## Task 1: Packages + Motion Foundation

**Files:**
- Modify: `three-sentences-launch/package.json`
- Create: `three-sentences-launch/src/motion/easing.ts`
- Create: `three-sentences-launch/src/motion/timing.ts`

- [ ] **Install @remotion/noise**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/three-sentences-launch
npm install @remotion/noise@4.0.466
```

Expected: `@remotion/noise` appears in `package.json` dependencies.

- [ ] **Create `src/motion/easing.ts`**

```ts
// src/motion/easing.ts
import { Easing } from "remotion";

export const ease = {
  /** Overshoot spring — dot entrances, mark assembly. */
  juggle: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Smooth, deliberate — text fades, screen reveals, scale moves. */
  editorial: Easing.bezier(0.16, 1, 0.3, 1),
  /** Sharp, no overshoot — locked states, submit confirmations. */
  discipline: Easing.bezier(0.45, 0, 0.55, 1),
} as const;
```

- [ ] **Create `src/motion/timing.ts`**

```ts
// src/motion/timing.ts
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
```

- [ ] **Verify TypeScript**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/three-sentences-launch
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Commit**

```bash
git add src/motion/ package.json package-lock.json
git commit -m "feat(launch-film): motion easing + timing foundation"
```

---

## Task 2: Dot.tsx + JugglingDots.tsx

The most critical primitive. `Dot` is simple; `JugglingDots` orchestrates all dot behaviour throughout the film.

**Files:**
- Create: `src/components/Dot.tsx`
- Create: `src/components/JugglingDots.tsx`

- [ ] **Create `src/components/Dot.tsx`**

```tsx
// src/components/Dot.tsx
import React from "react";
import { T } from "../tokens";

export interface DotProps {
  size?: number;          // diameter in px, default 22
  color?: string;         // default T.ink (ivory)
  filled?: boolean;       // solid bg vs transparent, default true
  opacity?: number;
  style?: React.CSSProperties;
}

export const Dot: React.FC<DotProps> = ({
  size = 22,
  color = T.ink,
  filled = true,
  opacity = 1,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: filled ? color : "transparent",
      border: `${Math.max(1, Math.round(size / 14))}px solid ${color}`,
      opacity,
      flexShrink: 0,
      ...style,
    }}
  />
);
```

- [ ] **Create `src/components/JugglingDots.tsx`**

Key rules from the brief:
- Gap between dots = `size × 1.2`
- Canonical entrance: stagger 4 frames per dot (LEFT first, CENTER, RIGHT)
- Entrance spring: `{ damping: 8, stiffness: 120, mass: 1 }` → gives overshoot
- Idle breath: 2px sine at period 60 frames
- `filled` (0–3 float): dots 0..filled-1 are solid, rest are outlined
- `mode: 'morph-to-mark'`: dots fly in from left/right/bottom, white tile scales up

```tsx
// src/components/JugglingDots.tsx
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { ease } from "../motion/easing";

export type JugglingMode =
  | "enter"
  | "exit"
  | "idle"
  | "fill"
  | "morph-to-mark"
  | "morph-to-check";

export interface JugglingDotsProps {
  /** Absolute composition frame when this animation begins. */
  start: number;
  mode: JugglingMode;
  /** Dots filled (solid). Float ok: 0→1 fills dot 0, 1→2 fills dot 1, etc. */
  filled?: number;
  color?: string;         // default T.ink
  size?: number;          // dot diameter px, default 22
  /** For morph-to-mark: final BrandMark tile size (controls dot positions inside tile). */
  markSize?: number;
  style?: React.CSSProperties;
}

export const JugglingDots: React.FC<JugglingDotsProps> = ({
  start,
  mode,
  filled = 0,
  color = T.ink,
  size = 22,
  markSize = 120,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - start; // local frame relative to start

  const gap = size * 1.2;   // brief: gap = diameter × 1.2
  const step = size + gap;  // center-to-center distance

  // ── Spring for dot entrance ──────────────────────────────────────
  const dotSpring = (dotIndex: number) =>
    spring({
      frame: Math.max(0, lf - dotIndex * 4),
      fps,
      config: { damping: 8, stiffness: 120, mass: 1 },
    });

  // ── Idle breath: 2px sine, period 60 frames ──────────────────────
  const breathY = Math.sin((frame / 60) * Math.PI * 2) * 2;

  // ── Per-mode y/scale/opacity for each dot ────────────────────────
  const getDotState = (i: number) => {
    let x = 0, y = 0, opacity = 1, scale = 1;
    let dotFilled = filled > i;     // whether this dot is solid
    let dotColor = color;

    switch (mode) {
      case "enter": {
        const spr = dotSpring(i);
        y = (1 - spr) * -160;      // -160→0 with overshoot past 0
        scale = 0.6 + spr * 0.4;
        opacity = Math.min(1, spr * 8);
        dotFilled = true;
        break;
      }
      case "exit": {
        const spr = dotSpring(i);
        y = spr * 200;
        opacity = Math.max(0, 1 - spr * 1.5);
        break;
      }
      case "idle": {
        y = breathY;
        break;
      }
      case "fill": {
        // dotFilled determined above by `filled > i`
        // for partial fill (0 < filled-i < 1): use fractional opacity on bg
        break;
      }
      default:
        break;
    }
    return { x, y, opacity, scale, dotFilled, dotColor };
  };

  // ── morph-to-mark renders differently — returns early ────────────
  if (mode === "morph-to-mark") {
    // Tile uses BrandMark proportions
    const dotDiam = (markSize / 9) * 2;  // match Mark.tsx formula
    const dotGap = markSize / 8;         // match Mark.tsx
    const tileRadius = markSize * 0.22;

    // Tile scales up over first 12 local frames
    const tileScale = interpolate(lf, [0, 12], [0, 1], {
      easing: ease.discipline,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Each dot travels from off-screen to its final position inside the tile.
    // Origins (relative to tile center): left, center (from below), right
    const origins = [
      { x: -600, y: 0 },   // dot 0: from left
      { x: 0, y: 450 },    // dot 1: from below
      { x: 600, y: 0 },    // dot 2: from right
    ];

    return (
      <div
        style={{
          position: "relative",
          width: markSize,
          height: markSize,
          flexShrink: 0,
          ...style,
        }}
      >
        {/* White tile */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            borderRadius: tileRadius,
            transform: `scale(${tileScale})`,
            transformOrigin: "center center",
          }}
        />
        {/* Three dots inside tile */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: dotGap,
          }}
        >
          {[0, 1, 2].map((i) => {
            const progress = interpolate(
              lf,
              [i * 4, i * 4 + 25],
              [0, 1],
              { easing: ease.editorial, extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const ox = origins[i].x * (1 - progress);
            const oy = origins[i].y * (1 - progress);
            // Dot color transitions ink→paper as tile appears
            const dotOpacity = Math.min(1, progress * 4);
            return (
              <div
                key={i}
                style={{
                  width: dotDiam,
                  height: dotDiam,
                  borderRadius: "50%",
                  background: "#0a0a0a",
                  flexShrink: 0,
                  transform: `translate(${ox}px, ${oy}px)`,
                  opacity: dotOpacity,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Default: horizontal flex row ─────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      {[0, 1, 2].map((i) => {
        const { y, opacity, scale, dotFilled, dotColor } = getDotState(i);
        // For fill mode: smooth fill via fractional `filled` prop
        const fillFrac = Math.max(0, Math.min(1, filled - i));
        const bg = mode === "fill"
          ? (dotFilled ? dotColor : "transparent")
          : dotColor;
        const borderColor = dotColor;

        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: bg,
              border: `${Math.max(1, Math.round(size / 14))}px solid ${borderColor}`,
              transform: `translateY(${y}px) scale(${scale})`,
              opacity,
              flexShrink: 0,
              transition: "none",
            }}
          />
        );
      })}
    </div>
  );
};
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Commit**

```bash
git add src/components/Dot.tsx src/components/JugglingDots.tsx
git commit -m "feat(launch-film): Dot + JugglingDots primitives"
```

---

## Task 3: Typography Helpers + Post-Effects + DotGrid Update

**Files:**
- Create: `src/components/type-components.tsx`
- Create: `src/components/Grain.tsx`
- Create: `src/components/Vignette.tsx`
- Modify: `src/components/DotGrid.tsx`

- [ ] **Create `src/components/type-components.tsx`**

```tsx
// src/components/type-components.tsx
// Styled text primitives matching the brand type system.
// All components accept children + optional style override.
import React from "react";
import { T, F } from "../tokens";

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: "4.8px",
      textTransform: "uppercase" as const,
      color: T.inkDim,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Display: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.serif,
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: 180,
      letterSpacing: "-6px",
      lineHeight: 1,
      color: T.ink,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Lead: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.serif,
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: 56,
      letterSpacing: "-1.4px",
      lineHeight: 1.05,
      color: T.ink,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: "3px",
      textTransform: "uppercase" as const,
      color: T.inkDim,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);
```

- [ ] **Create `src/components/Grain.tsx`**

Uses SVG `feTurbulence` with a frame-seeded random seed for per-frame grain variation at 0.015 opacity.

```tsx
// src/components/Grain.tsx
import React from "react";
import { useCurrentFrame } from "remotion";

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.015 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 50; // cycle through 50 seeds → grain varies each frame

  return (
    <>
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              seed={seed}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "url(#grain-filter)",
          opacity,
          mixBlendMode: "overlay",
          background: "#888888",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </>
  );
};
```

- [ ] **Create `src/components/Vignette.tsx`**

```tsx
// src/components/Vignette.tsx
import React from "react";

export const Vignette: React.FC<{ strength?: number }> = ({
  strength = 0.08,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
      zIndex: 9998,
    }}
  />
);
```

- [ ] **Modify `src/components/DotGrid.tsx`** — add `opacity` and `cell` props

Replace the entire file content:

```tsx
// src/components/DotGrid.tsx
import React from "react";

interface DotGridProps {
  opacity?: number;  // default 0.025
  cell?: number;     // grid cell size in px, default 28
}

/** Subtle radial dot-grid backdrop — always absolute-fills the parent. */
export const DotGrid: React.FC<DotGridProps> = ({
  opacity = 0.025,
  cell = 28,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(rgba(235,231,220,${opacity}) 1px, transparent 1px)`,
      backgroundSize: `${cell}px ${cell}px`,
      pointerEvents: "none",
    }}
  />
);
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero errors. (Existing uses of `<DotGrid />` without props still work because all props have defaults.)

- [ ] **Commit**

```bash
git add src/components/type-components.tsx src/components/Grain.tsx \
        src/components/Vignette.tsx src/components/DotGrid.tsx
git commit -m "feat(launch-film): type helpers, Grain, Vignette, DotGrid props"
```

---

## Task 4: PhoneFrame.tsx

A clean, unstyled frame shell. The scene components (`Scene04`, `Scene05`) slot screen content inside it.

**Files:**
- Create: `src/components/PhoneFrame.tsx`

- [ ] **Create `src/components/PhoneFrame.tsx`**

Dimensions: inner content area inherits from children. The shell adds the device chrome. The existing `MiniPhone` bakes in all the content — `PhoneFrame` is a dumb wrapper.

```tsx
// src/components/PhoneFrame.tsx
import React from "react";
import { T } from "../tokens";

interface PhoneFrameProps {
  children?: React.ReactNode;
  /** Logical device width before any parent scaling. Default 380. */
  width?: number;
  /** Logical device height before any parent scaling. Default 780. */
  height?: number;
  style?: React.CSSProperties;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = 380,
  height = 780,
  style,
}) => {
  const radius = width * 0.12;  // 12% → ~46px at 380

  return (
    <div
      style={{
        width,
        height,
        background: T.paper2,
        borderRadius: radius,
        border: `1.5px solid ${T.frame}`,
        boxShadow: [
          "0 80px 160px -40px rgba(0,0,0,0.9)",
          "0 30px 60px -30px rgba(0,0,0,0.5)",
        ].join(", "),
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.018),
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.round(width * 0.22),
          height: Math.round(width * 0.055),
          background: "#000",
          borderRadius: 999,
          zIndex: 10,
        }}
      />
      {/* Content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: Math.round(height * 0.068),
          paddingBottom: Math.round(height * 0.04),
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(height * 0.018),
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.round(width * 0.3),
          height: 3,
          background: T.ink,
          opacity: 0.4,
          borderRadius: 999,
        }}
      />
    </div>
  );
};
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Commit**

```bash
git add src/components/PhoneFrame.tsx
git commit -m "feat(launch-film): PhoneFrame shell component"
```

---

## Task 5: ScreenToday.tsx

The Today screen used in Scene 4 (typing demo). Ported from `design_handoff_three_sentences/ui_kits/mobile/proto-today.jsx`. All state driven by props, no React state.

**Files:**
- Create: `src/components/ScreenToday.tsx`

- [ ] **Create `src/components/ScreenToday.tsx`**

```tsx
// src/components/ScreenToday.tsx
// Static render of the Today screen. Props drive all state.
import React from "react";
import { T, F } from "../tokens";

interface ScreenTodayProps {
  /** 0–3: how many sentences are done (controls dot fills + counter label) */
  sentencesDone?: number;
  /** The typed text to show in the textarea area */
  typedText?: string;
  /** 0–1: submit button fill progress */
  submitFill?: number;
  /** Whether to show the "Done." locked state (post-submit) */
  locked?: boolean;
  /** Locked entry text (shown when locked=true) */
  lockedText?: string;
  /** Streak count to display */
  streak?: number;
}

const CountDot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: filled ? T.inkBright : "transparent",
      border: `1.5px solid ${filled ? T.inkBright : T.inkFade}`,
      flexShrink: 0,
    }}
  />
);

export const ScreenToday: React.FC<ScreenTodayProps> = ({
  sentencesDone = 0,
  typedText = "",
  submitFill = 0,
  locked = false,
  lockedText = "",
  streak = 12,
}) => {
  const submitActive = sentencesDone >= 3;
  const submitBg = submitFill > 0
    ? `rgba(235,231,220,${submitFill})`
    : "transparent";
  const submitTextColor = submitFill > 0.5 ? T.paper : T.inkDim;
  const submitBorderColor = submitActive ? T.ink : T.inkFade;

  const counterLabel = locked
    ? "✓ LOCKED"
    : sentencesDone === 3
    ? "3 / 3 · READY"
    : `${sentencesDone} / 3 · ${3 - sentencesDone} MORE`;

  const headerText = locked ? "Done." : "Today.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 24px 18px",
        gap: 0,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 9,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: T.inkDim,
              marginBottom: 2,
            }}
          >
            TUE · JUN 18
          </div>
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 28,
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {headerText}
          </div>
        </div>
        {/* Streak pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            border: `1.5px solid ${locked ? T.inkBright : T.frame}`,
            borderRadius: 999,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 11,
            color: T.ink,
            letterSpacing: "1px",
          }}
        >
          🔥 {streak}
        </div>
      </div>

      {/* Prompt strip */}
      <div
        style={{
          borderLeft: `2px solid ${T.inkFade}`,
          paddingLeft: 12,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 12,
          color: T.inkDim,
          lineHeight: 1.4,
          marginBottom: 12,
        }}
      >
        What is one thing you would do again?
      </div>

      {/* Writing surface / locked card */}
      <div style={{ flex: 1, minHeight: 0, marginBottom: 12 }}>
        {locked ? (
          /* Locked card */
          <div
            style={{
              padding: "14px 16px",
              background: T.surface,
              borderLeft: `2px solid ${T.inkBright}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: F.serif,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 15,
                lineHeight: 1.6,
                color: T.ink,
                marginBottom: 8,
              }}
            >
              {lockedText}
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 9,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: T.inkDim,
              }}
            >
              ✓ SUBMITTED 9:14 PM · LOCKED
            </div>
          </div>
        ) : (
          /* Active textarea content */
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 15,
              lineHeight: 1.6,
              color: typedText ? T.ink : T.inkFade,
              whiteSpace: "pre-wrap",
            }}
          >
            {typedText || "Three sentences. What happened?"}
          </div>
        )}
      </div>

      {/* Counter strip */}
      {!locked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {[0, 1, 2].map((i) => (
            <CountDot key={i} filled={sentencesDone > i} />
          ))}
          <span
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 9,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: T.inkDim,
              marginLeft: 6,
            }}
          >
            {counterLabel}
          </span>
        </div>
      )}

      {/* Submit pill */}
      {!locked && (
        <div
          style={{
            height: 48,
            borderRadius: 999,
            border: `1.5px solid ${submitBorderColor}`,
            background: submitBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.5px",
            color: submitTextColor,
            pointerEvents: "none",
          }}
        >
          {submitFill > 0.85 ? "✓ Locked" : submitFill > 0.3 ? "Locking…" : "Submit"}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add src/components/ScreenToday.tsx
git commit -m "feat(launch-film): ScreenToday component"
```

---

## Task 6: ScreenHistory.tsx

The History calendar screen. The calendar cell stagger animation is driven by a `reveal` prop (0→1 float).

**Files:**
- Create: `src/components/ScreenHistory.tsx`

- [ ] **Create `src/components/ScreenHistory.tsx`**

```tsx
// src/components/ScreenHistory.tsx
import React from "react";
import { interpolate } from "remotion";
import { T, F } from "../tokens";

interface ScreenHistoryProps {
  /** 0–1: cells animate in as reveal goes 0→1. Pass 1 for all shown. */
  reveal?: number;
}

// June 2026 calendar data (hard-coded for the film)
const DAYS_IN_JUNE = 30;
const JUNE_START_DOW = 1; // Monday (0=Sun)
// Written entries: most days written, a few gaps
const WRITTEN = new Set([1,2,3,4,5,7,8,9,10,11,12,14,15,16,17,18,20,21,22,23,24,25,27,28,29,30]);
const TODAY_DATE = 18;

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const ScreenHistory: React.FC<ScreenHistoryProps> = ({
  reveal = 1,
}) => {
  const totalCells = JUNE_START_DOW + DAYS_IN_JUNE;
  const rows = Math.ceil(totalCells / 7);
  const cells: Array<{ day: number | null; idx: number }> = [];
  for (let i = 0; i < rows * 7; i++) {
    const day = i < JUNE_START_DOW ? null : i - JUNE_START_DOW + 1;
    if (day !== null && day > DAYS_IN_JUNE) break;
    cells.push({ day: day && day <= DAYS_IN_JUNE ? day : null, idx: i });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 18px 14px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 26,
            color: T.ink,
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          History
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: T.inkDim,
          }}
        >
          184 ENTRIES
        </div>
      </div>

      {/* Month nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: T.ink,
        }}
      >
        <span style={{ color: T.inkFade }}>‹</span>
        <span>June 2026</span>
        <span style={{ color: T.inkFade }}>›</span>
      </div>

      {/* Weekday header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 8,
              letterSpacing: "1px",
              color: T.inkFade,
              textTransform: "uppercase",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 3,
          flex: 1,
        }}
      >
        {cells.map(({ day, idx }) => {
          if (day === null) return <div key={idx} />;

          // Stagger: cell reveals based on position and `reveal` prop
          const cellReveal = interpolate(
            reveal,
            [idx / (rows * 7), (idx + 1) / (rows * 7)],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const isWritten = WRITTEN.has(day);
          const isToday = day === TODAY_DATE;

          return (
            <div
              key={idx}
              style={{
                aspectRatio: "1",
                borderRadius: 4,
                background: isWritten ? T.ink : "transparent",
                border: isToday
                  ? `1.5px solid ${T.inkBright}`
                  : isWritten
                  ? "none"
                  : `1px solid ${T.frame}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 8,
                color: isWritten ? T.paper : T.inkFade,
                opacity: cellReveal,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Stats strip */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid ${T.frame}`,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 8,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: T.inkDim,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span>17 / 30 This Month</span>
        <span style={{ color: T.inkFade }}>·</span>
        <span>184 Total</span>
        <span style={{ color: T.inkFade }}>·</span>
        <span>57%</span>
      </div>
    </div>
  );
};
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add src/components/ScreenHistory.tsx
git commit -m "feat(launch-film): ScreenHistory with animated calendar grid"
```

---

## Task 7: ScreenInsights.tsx + ScreenCircle.tsx

**Files:**
- Create: `src/components/ScreenInsights.tsx`
- Create: `src/components/ScreenCircle.tsx`

- [ ] **Create `src/components/ScreenInsights.tsx`**

```tsx
// src/components/ScreenInsights.tsx
import React from "react";
import { T, F } from "../tokens";

interface ScreenInsightsProps {
  /** 0–12: streak count (can be animated as float) */
  streak?: number;
  /** 0–1: stat tiles cascade opacity */
  tilesReveal?: number;
}

const StatTile: React.FC<{
  label: string;
  value: string;
  opacity?: number;
}> = ({ label, value, opacity = 1 }) => (
  <div
    style={{
      flex: 1,
      padding: "10px 12px",
      background: T.surface,
      borderRadius: 8,
      border: `1px solid ${T.frame}`,
      opacity,
    }}
  >
    <div
      style={{
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: 8,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: T.inkDim,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: F.serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 22,
        color: T.inkBright,
        lineHeight: 1,
      }}
    >
      {value}
    </div>
  </div>
);

export const ScreenInsights: React.FC<ScreenInsightsProps> = ({
  streak = 12,
  tilesReveal = 1,
}) => {
  const streakDisplay = Math.floor(streak).toString();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 18px 14px",
        gap: 12,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 26,
            color: T.ink,
          }}
        >
          Insights
        </div>
      </div>

      {/* Streak hero card */}
      <div
        style={{
          padding: "18px 20px",
          background: T.surface,
          borderRadius: 12,
          border: `1px solid ${T.frame}`,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 8,
            letterSpacing: "2.4px",
            textTransform: "uppercase",
            color: T.inkDim,
          }}
        >
          Current Streak
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 64,
            color: T.inkBright,
            lineHeight: 1,
          }}
        >
          {streakDisplay}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: T.inkDim,
          }}
        >
          Days in a row
        </div>
      </div>

      {/* Stat tiles row */}
      <div style={{ display: "flex", gap: 8 }}>
        <StatTile label="Longest" value="23" opacity={Math.min(1, tilesReveal * 3)} />
        <StatTile label="Entries" value="184" opacity={Math.min(1, Math.max(0, tilesReveal * 3 - 1))} />
        <StatTile label="Goal" value="363" opacity={Math.min(1, Math.max(0, tilesReveal * 3 - 2))} />
      </div>

      {/* Daily prompt card */}
      <div
        style={{
          padding: "10px 14px",
          borderLeft: `2px solid ${T.inkBright}`,
          background: T.surface,
          borderRadius: "0 8px 8px 0",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 8,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: T.inkDim,
            marginBottom: 4,
          }}
        >
          Today's Prompt
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 13,
            color: T.ink,
            lineHeight: 1.4,
          }}
        >
          What is one thing you would do again?
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Create `src/components/ScreenCircle.tsx`**

```tsx
// src/components/ScreenCircle.tsx
import React from "react";
import { T, F } from "../tokens";

interface FriendRowProps {
  initials: string;
  name: string;
  handle: string;
  streak: number;
  preview: string;
  unread?: boolean;
  opacity?: number;
}

const FriendRow: React.FC<FriendRowProps> = ({
  initials,
  name,
  handle,
  streak,
  preview,
  unread = false,
  opacity = 1,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: `1px solid ${T.frame}`,
      opacity,
    }}
  >
    {/* Avatar */}
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.surface} 0%, ${T.frame} 100%)`,
        border: `1px solid ${T.frame}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 14,
        color: T.inkDim,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <span
          style={{
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: 13,
            color: T.ink,
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 8,
            letterSpacing: "1px",
            color: T.inkDim,
          }}
        >
          {handle} · 🔥{streak}
        </span>
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 400,
          fontSize: 11,
          color: T.inkFade,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {preview}
      </div>
    </div>
    {unread && (
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: T.inkBright,
          flexShrink: 0,
        }}
      />
    )}
  </div>
);

export const ScreenCircle: React.FC<{ friendsReveal?: number }> = ({
  friendsReveal = 1,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "0 18px 14px",
    }}
  >
    {/* Header */}
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 26,
          color: T.ink,
        }}
      >
        The Circle
      </div>
    </div>

    {/* Search */}
    <div
      style={{
        height: 32,
        borderRadius: 999,
        border: `1px solid ${T.frame}`,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        marginBottom: 12,
        fontFamily: F.sans,
        fontWeight: 400,
        fontSize: 11,
        color: T.inkFade,
      }}
    >
      Search…
    </div>

    {/* Friend rows */}
    <FriendRow
      initials="MK"
      name="Maya K"
      handle="@mayak"
      streak={21}
      preview="Three sentences. No more."
      unread
      opacity={Math.min(1, friendsReveal * 2)}
    />
    <FriendRow
      initials="JO"
      name="James O"
      handle="@jamesO"
      streak={8}
      preview="The light was different today."
      opacity={Math.min(1, Math.max(0, friendsReveal * 2 - 1))}
    />
  </div>
);
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add src/components/ScreenInsights.tsx src/components/ScreenCircle.tsx
git commit -m "feat(launch-film): ScreenInsights + ScreenCircle"
```

---

## Task 8: LaunchFilm.tsx Scaffold + Root.tsx Update

Scaffold all seven scene placeholders, wire into `LaunchFilm.tsx`, register three compositions in `Root.tsx`.

**Files:**
- Create: `src/LaunchFilm.tsx`
- Create: `src/scenes/launch/` directory with all 7 scene stubs
- Modify: `src/Root.tsx`

- [ ] **Create the scene stubs** — all seven files return a visually identifiable placeholder

Create `src/scenes/launch/Scene01_Opening.tsx`:
```tsx
// src/scenes/launch/Scene01_Opening.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { T, F } from "../../tokens";

export const Scene01_Opening: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.mono, color: T.inkDim, fontSize: 24, letterSpacing: 4 }}>
      SCENE 01 · OPENING
    </div>
  </AbsoluteFill>
);
```

Repeat this pattern for `Scene02_Antagonist.tsx` through `Scene07_Close.tsx`, updating the label in each. (All 7 files must exist — LaunchFilm.tsx imports all of them.)

- [ ] **Create `src/LaunchFilm.tsx`**

```tsx
// src/LaunchFilm.tsx
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "./tokens";
import { DotGrid } from "./components/DotGrid";
import { Grain } from "./components/Grain";
import { Vignette } from "./components/Vignette";
import { SCENE_STARTS, SCENE_DURATIONS } from "./motion/timing";
import { Scene01_Opening } from "./scenes/launch/Scene01_Opening";
import { Scene02_Antagonist } from "./scenes/launch/Scene02_Antagonist";
import { Scene03_TheRule } from "./scenes/launch/Scene03_TheRule";
import { Scene04_TypingDemo } from "./scenes/launch/Scene04_TypingDemo";
import { Scene05_AppTour } from "./scenes/launch/Scene05_AppTour";
import { Scene06_363 } from "./scenes/launch/Scene06_363";
import { Scene07_Close } from "./scenes/launch/Scene07_Close";

const SCENES = [
  { Component: Scene01_Opening,   start: SCENE_STARTS.s1, duration: SCENE_DURATIONS.s1 },
  { Component: Scene02_Antagonist,start: SCENE_STARTS.s2, duration: SCENE_DURATIONS.s2 },
  { Component: Scene03_TheRule,   start: SCENE_STARTS.s3, duration: SCENE_DURATIONS.s3 },
  { Component: Scene04_TypingDemo,start: SCENE_STARTS.s4, duration: SCENE_DURATIONS.s4 },
  { Component: Scene05_AppTour,   start: SCENE_STARTS.s5, duration: SCENE_DURATIONS.s5 },
  { Component: Scene06_363,       start: SCENE_STARTS.s6, duration: SCENE_DURATIONS.s6 },
  { Component: Scene07_Close,     start: SCENE_STARTS.s7, duration: SCENE_DURATIONS.s7 },
] as const;

export const LaunchFilm: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper }}>
    <DotGrid opacity={0.012} cell={28} />
    {SCENES.map(({ Component, start, duration }, i) => (
      <Sequence key={i} from={start} durationInFrames={duration}>
        <Component />
      </Sequence>
    ))}
    <Grain opacity={0.015} />
    <Vignette strength={0.08} />
  </AbsoluteFill>
);
```

- [ ] **Modify `src/Root.tsx`** — add three LaunchFilm compositions

Add after the existing `ThreeSentencesLaunch` composition:

```tsx
import { LaunchFilm } from "./LaunchFilm";

// Inside RemotionRoot, after the existing composition:
<Composition
  id="LaunchFilm"
  component={LaunchFilm}
  durationInFrames={1650}
  fps={30}
  width={1920}
  height={1080}
/>
<Composition
  id="LaunchFilm-9x16"
  component={LaunchFilm}
  durationInFrames={1650}
  fps={30}
  width={1080}
  height={1920}
/>
<Composition
  id="LaunchFilm-1x1"
  component={LaunchFilm}
  durationInFrames={1650}
  fps={30}
  width={1080}
  height={1080}
/>
```

- [ ] **Verify: open Remotion Studio and confirm LaunchFilm composition appears**

```bash
npm run studio
```

Navigate to `LaunchFilm` — should show 7 placeholder text labels cycling through the 1650 frames. Each placeholder should be visible at its correct frame range.

- [ ] **Commit**

```bash
git add src/LaunchFilm.tsx src/scenes/launch/ src/Root.tsx
git commit -m "feat(launch-film): scaffold all 7 scenes, LaunchFilm composition"
```

---

## Task 9: Scene01_Opening.tsx

Scene 1: 0–180 frames (0:00–0:06). Juggle → wordmark → tagline.

**Files:**
- Modify: `src/scenes/launch/Scene01_Opening.tsx`

- [ ] **Implement Scene01_Opening.tsx**

Frame map (all local — Scene01 receives local frame 0–180 from its Sequence):
- f0–f12: pure paper, radial glow breathes in
- f12–f30: JugglingDots enters with canonical juggle (stagger: LEFT=f12, CENTER=f16, RIGHT=f20)
- f30–f60: dots hold + breathe idle
- f60–f96: dots drift down+right; wordmark "Three / Sentences" fades in above
- f96–f120: hairline divider draws left→right
- f120–f150: tagline "BE BETTER.  DO BETTER." fades up
- f150–f180: full hold

```tsx
// src/scenes/launch/Scene01_Opening.tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

export const Scene01_Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Radial glow (breathes in f0→f30, then brightens f30→f60)
  const glowOpacity = interpolate(frame, [0, 30, 60], [0.03, 0.05, 0.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dots Y drift (f60→f96): from optical center to 80px below + 60px right
  // The dots container starts at center (via flexbox) then moves
  const dotsDriftProgress = interpolate(frame, [60, 96], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotsTranslateY = dotsDriftProgress * 80;
  const dotsTranslateX = dotsDriftProgress * 60;

  // Wordmark fade (f60→f84)
  const wordmarkOpacity = interpolate(frame, [60, 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordmarkY = interpolate(frame, [60, 84], [8, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hairline scaleX (f96→f110)
  const hairlineScale = interpolate(frame, [96, 110], [0, 1], {
    easing: ease.discipline,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade (f120→f138)
  const taglineOpacity = interpolate(frame, [120, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [120, 138], [8, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: T.paper }}>
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(255,255,255,${glowOpacity}) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Center stage — wordmark + dots + tagline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Wordmark (fades in as dots drift) */}
        <div
          style={{
            opacity: wordmarkOpacity,
            transform: `translateY(${wordmarkY}px)`,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 180,
            letterSpacing: "-6px",
            lineHeight: 1,
            color: T.ink,
            textAlign: "center",
            marginBottom: 16,
            pointerEvents: "none",
          }}
        >
          Three
          <br />
          Sentences
        </div>

        {/* Hairline */}
        <div
          style={{
            width: 120,
            height: 1,
            background: T.inkFade,
            transform: `scaleX(${hairlineScale})`,
            transformOrigin: "center",
            marginBottom: 16,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "4.8px",
            textTransform: "uppercase",
            color: T.ink,
            pointerEvents: "none",
            marginBottom: 48,
          }}
        >
          BE BETTER.{"  "}DO BETTER.
        </div>

        {/* Juggling dots — anchored beneath wordmark after drift */}
        <div
          style={{
            transform: `translate(${dotsTranslateX}px, ${dotsTranslateY}px)`,
          }}
        >
          <JugglingDots
            start={12}
            mode={frame < 30 ? "enter" : "idle"}
            size={22}
            color={T.ink}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Verify in Remotion Studio**: scrub f0–f180. Confirm:
  - Dots juggle in with overshoot at f12/f16/f20
  - Wordmark fades up as dots drift
  - Hairline draws left→right
  - Tagline fades up
  - Scene holds cleanly at f150

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene01_Opening.tsx
git commit -m "feat(launch-film): Scene01 Opening — juggle, wordmark, tagline"
```

---

## Task 10: Scene07_Close.tsx

Scene 7: frames 0–150 local (comp 1500–1650). Mark morph + wordmark + CTA.

**Files:**
- Modify: `src/scenes/launch/Scene07_Close.tsx`

- [ ] **Implement Scene07_Close.tsx**

```tsx
// src/scenes/launch/Scene07_Close.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { DotGrid } from "../../components/DotGrid";
import { ease } from "../../motion/easing";

export const Scene07_Close: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–150

  // Radial glow returns (f0→f20)
  const glowOpacity = interpolate(frame, [0, 20], [0, 0.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dots morph to mark (f0–f45): starts converging from f0
  // JugglingDots with mode='morph-to-mark' handles the animation

  // Wordmark beneath mark (f45→f65)
  const wordmarkOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline (f65→f83)
  const taglineOpacity = interpolate(frame, [65, 83], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hairline (f83→f97)
  const hairlineScale = interpolate(frame, [83, 97], [0, 1], {
    easing: ease.discipline,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA (f97→f113)
  const ctaOpacity = interpolate(frame, [97, 113], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Meta line (f110→f125)
  const metaOpacity = interpolate(frame, [110, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: T.paper }}>
      <DotGrid opacity={0.025} cell={28} />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(255,255,255,${glowOpacity}) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Center column */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Mark morph — JugglingDots in morph-to-mark mode */}
        <JugglingDots
          start={0}
          mode="morph-to-mark"
          markSize={120}
          style={{ marginBottom: 32 }}
        />

        {/* Wordmark */}
        <div
          style={{
            opacity: wordmarkOpacity,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 96,
            letterSpacing: "-3px",
            lineHeight: 1,
            color: T.ink,
            textAlign: "center",
            marginBottom: 24,
            pointerEvents: "none",
          }}
        >
          Three
          <br />
          Sentences
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "4.8px",
            textTransform: "uppercase",
            color: T.ink,
            marginBottom: 24,
            pointerEvents: "none",
          }}
        >
          BE BETTER.{"  "}DO BETTER.
        </div>

        {/* Hairline */}
        <div
          style={{
            width: 200,
            height: 1,
            background: T.inkFade,
            transform: `scaleX(${hairlineScale})`,
            transformOrigin: "center",
            marginBottom: 20,
          }}
        />

        {/* CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: 18,
            color: T.ink,
            letterSpacing: "0.5px",
            marginBottom: 12,
            pointerEvents: "none",
          }}
        >
          REQUEST ACCESS — three63.com
        </div>

        {/* Meta */}
        <div
          style={{
            opacity: metaOpacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: "2.4px",
            textTransform: "uppercase",
            color: T.inkDim,
            pointerEvents: "none",
          }}
        >
          INVITE ONLY · iOS · Q4 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Verify in Studio**: scrub Scene07 (comp frames 1500–1650, local 0–150). Confirm:
  - Dots converge and white tile assembles around them at f0–f45
  - Wordmark fades in cleanly
  - CTA and meta appear in sequence
  - Film holds on static frame at f150 (no fade out)

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene07_Close.tsx
git commit -m "feat(launch-film): Scene07 Close — mark morph, wordmark, CTA"
```

---

## Task 11: Scene04_TypingDemo.tsx

The most technically demanding scene. Local frames 0–300 (comp 660–960).

Frame map:
- f0–f40: phone slides up from bottom; dots fly to phone counter position
- f40–f80: Today screen populates (status bar, header, prompt, empty textarea)
- f80–f240: typing pass (3 sentences, variable cadence, sentence dots fill 1→2→3)
- f240–f280: submit moment (pill fills, luminance flash at f260, locked card appears)
- f280–f300: hold on "Done." state

**Files:**
- Modify: `src/scenes/launch/Scene04_TypingDemo.tsx`

- [ ] **Implement `src/scenes/launch/Scene04_TypingDemo.tsx`**

The typing pass uses a deterministic variable-delay approach:

```tsx
// src/scenes/launch/Scene04_TypingDemo.tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T, F } from "../../tokens";
import { PhoneFrame } from "../../components/PhoneFrame";
import { ScreenToday } from "../../components/ScreenToday";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

// ── Typing engine: deterministic variable-delay per character ──────────────
const SENTENCES = [
  "The rain stopped just after lunch.",
  "I walked the long way to the post office.",
  "A small kindness from a stranger.",
];
const FULL_TEXT = SENTENCES.join("\n");

// Seeded LCG — deterministic between renders
function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// Precompute cumulative frame for each character (0-indexed)
// Returns: array of length FULL_TEXT.length where charFrames[i] = frame when char i appears
function buildCharFrames(startFrame: number): number[] {
  const rng = makePrng(42);
  const frames: number[] = [];
  let f = startFrame;
  for (const char of FULL_TEXT) {
    // Period and comma: +4 frame pause after character appears
    const isPause = char === "." || char === ",";
    const baseDelay = Math.round(1 + rng() * 1.4); // 1–2 frames
    f += baseDelay;
    frames.push(f);
    if (isPause) f += 4; // hold after sentence-ending punctuation
  }
  return frames;
}

const TYPING_START = 80;
const CHAR_FRAMES = buildCharFrames(TYPING_START);
const TOTAL_CHARS = FULL_TEXT.length;

// Frame when each sentence completes (at its terminal period)
const sentence1End = CHAR_FRAMES[SENTENCES[0].length - 1];
const sentence2End = CHAR_FRAMES[SENTENCES[0].length + SENTENCES[1].length - 1];
const sentence3End = CHAR_FRAMES[TOTAL_CHARS - 1];

// Submit sequence starts 10 frames after last sentence
const SUBMIT_START = sentence3End + 10;
const LOCK_FLASH = SUBMIT_START + 20; // 1-frame luminance flash
const LOCKED_AT = SUBMIT_START + 30;

// ── Component ──────────────────────────────────────────────────────────────
export const Scene04_TypingDemo: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–300
  const { fps } = useVideoConfig();

  // Phone slide up from bottom (f0→f40)
  const phoneSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100, mass: 1 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [600, 0]);
  const phoneOpacity = Math.min(1, phoneSpring * 2);

  // How many characters are visible at current frame
  const charsTyped = CHAR_FRAMES.filter((cf) => cf <= frame).length;
  const typedText = FULL_TEXT.slice(0, charsTyped);

  // How many sentences are done
  const sentencesDone =
    frame >= sentence3End ? 3 :
    frame >= sentence2End ? 2 :
    frame >= sentence1End ? 1 : 0;

  // Submit pill fill progress (f_SUBMIT_START → f_SUBMIT_START+30)
  const submitFill = interpolate(
    frame,
    [SUBMIT_START, SUBMIT_START + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Luminance flash (1-frame at LOCK_FLASH)
  const flashOpacity = frame === LOCK_FLASH ? 0.08 : 0;

  const locked = frame >= LOCKED_AT;

  return (
    <AbsoluteFill
      style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}
    >
      {/* Phone frame */}
      <div
        style={{
          transform: `translateY(${phoneY}px)`,
          opacity: phoneOpacity,
        }}
      >
        <PhoneFrame width={380} height={780}>
          <ScreenToday
            sentencesDone={sentencesDone}
            typedText={typedText}
            submitFill={submitFill}
            locked={locked}
            lockedText={FULL_TEXT}
            streak={12}
          />
        </PhoneFrame>
      </div>

      {/* Single-frame luminance flash on lock */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#ffffff",
            opacity: flashOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
```

- [ ] **Verify in Studio**: scrub f80–f260 (local). Confirm:
  - Characters appear with variable cadence (not uniform)
  - Pauses after periods/commas are visible
  - Counter dots fill 0→1→2→3 at sentence boundaries
  - Submit pill animates "Submit → Locking… → ✓ Locked"
  - Single-frame flash fires at LOCK_FLASH
  - "Done." header appears on locked state

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene04_TypingDemo.tsx
git commit -m "feat(launch-film): Scene04 typing demo with variable cadence + lock moment"
```

---

## Task 12: Scene03_TheRule.tsx

Scene 3: local frames 0–240 (comp 420–660). Three dots as the period after *Three.*

Critical: the three dots sit at the baseline of the italic "e" in *Three*. Achieved via inline flex layout where the dots are rendered as an inline element at the end of the word, then positioned absolutely to align baselines.

**Files:**
- Modify: `src/scenes/launch/Scene03_TheRule.tsx`

- [ ] **Implement Scene03_TheRule.tsx**

```tsx
// src/scenes/launch/Scene03_TheRule.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

// Character-by-character type-in for display text
// Returns visible substring at current frame given startFrame and delay
function typeIn(text: string, startFrame: number, delayPerChar: number, frame: number) {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / delayPerChar);
  return text.slice(0, chars);
}

const DOT_SIZE = 18; // slightly smaller than default 22 to fit the period slot

export const Scene03_TheRule: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–240

  // Dots enter: dot 0 at f20, dot 1 at f30, dot 2 at f40 (slower, more deliberate)
  const dotsEnterMode = frame >= 40 ? "idle" : "enter";

  // Line 1: "Three" + dots-as-period fades (f60→f78)
  // Line 2: "No more," types (f83→f108, 2f/char)
  // Line 3: "no less." types (f113→f138, 2f/char)
  const line2Text = typeIn("No more,", 83, 2, frame);
  const line3Text = typeIn("no less.", 113, 2, frame);

  // "Three" wordmark opacity/translateY
  const threeOpacity = interpolate(frame, [60, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const threeY = interpolate(frame, [60, 78], [8, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2/3 opacity
  const line2Opacity = interpolate(frame, [83, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line3Opacity = interpolate(frame, [113, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Eyebrow "THE ONLY RULE." (f173→f191)
  const eyebrowOpacity = interpolate(frame, [173, 191], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const DISPLAY_SIZE = 132;

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      {/* Dots enter at top (then serve as period) */}
      {/* Dots are positioned relative to the "Three" word */}
      {/* Line 1: "Three" + dots as period */}
      <div
        style={{
          opacity: threeOpacity,
          transform: `translateY(${threeY}px)`,
          display: "flex",
          alignItems: "flex-end",  // align to bottom of text (baseline approx)
          gap: 4,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: DISPLAY_SIZE,
            letterSpacing: "-4px",
            lineHeight: 1,
            color: T.ink,
            pointerEvents: "none",
          }}
        >
          Three
        </div>
        {/* Dots sit here as the "period" — alignItems: flex-end puts them at text baseline */}
        <div style={{ paddingBottom: Math.round(DISPLAY_SIZE * 0.08), marginLeft: 6 }}>
          <JugglingDots
            start={20}
            mode={dotsEnterMode}
            size={DOT_SIZE}
            color={T.ink}
          />
        </div>
      </div>

      {/* Line 2: No more, (INK_DIM) */}
      <div
        style={{
          opacity: line2Opacity,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: DISPLAY_SIZE,
          letterSpacing: "-4px",
          lineHeight: 1,
          color: T.inkDim,
          marginBottom: 8,
          pointerEvents: "none",
        }}
      >
        {line2Text}
        {line2Text.length < 8 && frame >= 83 && (
          <span style={{ opacity: 0.7 }}>|</span>
        )}
      </div>

      {/* Line 3: no less. (INK_DIM) */}
      <div
        style={{
          opacity: line3Opacity,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: DISPLAY_SIZE,
          letterSpacing: "-4px",
          lineHeight: 1,
          color: T.inkDim,
          marginBottom: 40,
          pointerEvents: "none",
        }}
      >
        {line3Text}
        {line3Text.length < 8 && frame >= 113 && (
          <span style={{ opacity: 0.7 }}>|</span>
        )}
      </div>

      {/* Eyebrow: THE ONLY RULE. */}
      <div
        style={{
          opacity: eyebrowOpacity,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: T.inkDim,
          pointerEvents: "none",
        }}
      >
        THE ONLY RULE.
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Verify in Studio**: scrub Scene03 (comp 420–660, local 0–240). Confirm:
  - Dots land one by one at f20/f30/f40 with overshoot
  - "Three" fades in and the dots sit at its visual baseline like a period
  - "No more," and "no less." type in character by character
  - Eyebrow appears at f173

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene03_TheRule.tsx
git commit -m "feat(launch-film): Scene03 The Rule — dots as period baseline"
```

---

## Task 13: Scene05_AppTour.tsx

Four sub-scenes of 90 frames each. Each transition uses juggling dots as the edit cut.

**Files:**
- Modify: `src/scenes/launch/Scene05_AppTour.tsx`

- [ ] **Implement Scene05_AppTour.tsx**

```tsx
// src/scenes/launch/Scene05_AppTour.tsx
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { T, F } from "../../tokens";
import { PhoneFrame } from "../../components/PhoneFrame";
import { ScreenToday } from "../../components/ScreenToday";
import { ScreenHistory } from "../../components/ScreenHistory";
import { ScreenInsights } from "../../components/ScreenInsights";
import { ScreenCircle } from "../../components/ScreenCircle";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

// Sub-scene windows (local frames within Scene05's 360-frame budget)
const S1_START = 0;    // Today (already from Scene04 locked state)
const S2_START = 90;   // History
const S3_START = 180;  // Insights
const S4_START = 270;  // The Circle
// Cluster (2x2 grid) at f300–f360
const CLUSTER_START = 300;

// Caption for each screen, shown to the right of the phone
interface Caption { eyebrow: string; body: string }
const CAPTIONS: Caption[] = [
  { eyebrow: "THE PRACTICE.", body: "A locked entry, every day. No edits, ever." },
  { eyebrow: "THE RECORD.", body: "A quiet calendar. Forgiveness built in." },
  { eyebrow: "THE PATTERN.", body: "Patterns surface when you stop performing." },
  { eyebrow: "THE PEOPLE.", body: "A small, private circle. End-to-end encrypted." },
];

// Which sub-scene index is active
const getActiveScene = (f: number) =>
  f >= CLUSTER_START ? -1 :
  f >= S4_START ? 3 :
  f >= S3_START ? 2 :
  f >= S2_START ? 1 : 0;

// Clip-path wipe: 0=left edge shows, 1=fully revealed
const ClipReveal: React.FC<{ progress: number; children: React.ReactNode }> = ({
  progress,
  children,
}) => (
  <div
    style={{
      clipPath: `inset(0 ${Math.round((1 - progress) * 100)}% 0 0)`,
      width: "100%",
      height: "100%",
      position: "absolute",
      inset: 0,
    }}
  >
    {children}
  </div>
);

export const Scene05_AppTour: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–360
  const { fps } = useVideoConfig();
  const active = getActiveScene(frame);

  // Phone scale-down for cluster view (f300→f330)
  const clusterProgress = interpolate(frame, [CLUSTER_START, CLUSTER_START + 30], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // During cluster: 4 phones in 2×2 grid, each 0.45× scale of viewport
  if (frame >= CLUSTER_START) {
    const screens = [ScreenToday, ScreenHistory, ScreenInsights, ScreenCircle];
    const labels = ["01 TODAY", "02 HISTORY", "03 INSIGHTS", "04 THE CIRCLE"];
    return (
      <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            opacity: clusterProgress,
          }}
        >
          {screens.map((Screen, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: 9,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: T.inkDim,
                }}
              >
                {labels[i]}
              </div>
              <PhoneFrame width={200} height={410}>
                <Screen reveal={1} tilesReveal={1} friendsReveal={1} sentencesDone={3} streak={12} locked submitFill={1} lockedText="The rain stopped just after lunch.&#10;I walked the long way to the post office.&#10;A small kindness from a stranger." />
              </PhoneFrame>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // Per-screen transition: dots juggle at frame X, then screen wipes in
  const subStart = [S1_START, S2_START, S3_START, S4_START][active] ?? 0;
  const localSub = frame - subStart;

  // Dots transition: frames 0–20 of each sub-scene
  const showDots = localSub < 25;
  const dotsOpacity = showDots
    ? interpolate(localSub, [0, 8, 20, 25], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  // Screen reveal: starts at f15 of each sub-scene
  const screenReveal = interpolate(localSub, [15, 45], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption opacity
  const captionOpacity = interpolate(localSub, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const caption = active >= 0 ? CAPTIONS[active] : CAPTIONS[0];

  // Which screen to render
  const calendarReveal = active === 1 ? screenReveal : 1;
  const insightsReveal = active === 2 ? interpolate(localSub, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const circleReveal = active === 3 ? interpolate(localSub, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
      }}
    >
      {/* Phone */}
      <div style={{ position: "relative" }}>
        <PhoneFrame width={320} height={660}>
          {active === 0 && (
            <ScreenToday
              sentencesDone={3}
              typedText={"The rain stopped just after lunch.\nI walked the long way to the post office.\nA small kindness from a stranger."}
              locked
              lockedText={"The rain stopped just after lunch.\nI walked the long way to the post office.\nA small kindness from a stranger."}
              streak={12}
              submitFill={1}
            />
          )}
          {active === 1 && <ScreenHistory reveal={calendarReveal} />}
          {active === 2 && <ScreenInsights streak={12} tilesReveal={insightsReveal} />}
          {active === 3 && <ScreenCircle friendsReveal={circleReveal} />}
        </PhoneFrame>
      </div>

      {/* Caption to the right */}
      <div
        style={{
          opacity: captionOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 260,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: T.inkBright,
          }}
        >
          {caption.eyebrow}
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 400,
            fontSize: 16,
            color: T.inkDim,
            lineHeight: 1.5,
          }}
        >
          {caption.body}
        </div>
      </div>

      {/* Transition dots */}
      {dotsOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: dotsOpacity,
          }}
        >
          <JugglingDots start={subStart + frame - frame} mode="idle" size={22} />
        </div>
      )}
    </AbsoluteFill>
  );
};
```

- [ ] **Verify in Studio**: scrub Scene05 (comp 960–1320). Confirm:
  - Today screen visible at start (locked state)
  - History calendar animates in at f90 with cell stagger
  - Insights streak card at f180
  - Circle friends at f270
  - 2×2 cluster grid at f300

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene05_AppTour.tsx
git commit -m "feat(launch-film): Scene05 app tour — four screens + cluster"
```

---

## Task 14: Scene02_Antagonist.tsx

Scene 2: local frames 0–240 (comp 180–420). Two lines of text, word-swap on "a lot" → "nothing".

**Files:**
- Modify: `src/scenes/launch/Scene02_Antagonist.tsx`

- [ ] **Implement Scene02_Antagonist.tsx**

```tsx
// src/scenes/launch/Scene02_Antagonist.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

function typeIn(text: string, startF: number, delayPerChar: number, frame: number): string {
  return text.slice(0, Math.max(0, Math.floor((frame - startF) / delayPerChar)));
}

const LINE1 = "Most journaling apps ask you to write a lot.";
const LINE2 = "So most days, you write nothing.";

export const Scene02_Antagonist: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–240

  // Dots migrate to top-left (f0→f20)
  const dotsMigrateX = interpolate(frame, [0, 20], [-580, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotsMigrateY = interpolate(frame, [0, 20], [-260, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 1 types (f40→f110, ~1.5f/char)
  const line1Text = typeIn(LINE1, 40, 1.5, frame);
  const line1Opacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 1 dims (f130→f145)
  const line1Color = frame >= 130
    ? interpolate(frame, [130, 145], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }) > 0.5 ? T.ink : T.inkDim
    : T.ink;

  // Line 2 types (f130→f195, ~1.8f/char)
  const line2Text = typeIn(LINE2, 130, 1.8, frame);
  const line2Opacity = interpolate(frame, [130, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Two dots drop (f200→f224): dots 1 and 2 fall
  const dotsDrop = interpolate(frame, [200, 224], [0, 1], {
    easing: ease.discipline,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dot1DropY = dotsDrop * 260;
  const dot1DropOpacity = 1 - dotsDrop * 1.2;
  const dot2DropY = dotsDrop * 260;
  const dot2DropOpacity = 1 - dotsDrop * 1.2;

  // Remaining dot dims (f220→f240)
  const remainingDotOpacity = interpolate(frame, [220, 240], [1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const DISPLAY_SIZE = 72;

  return (
    <AbsoluteFill style={{ background: T.paper }}>
      {/* Header dots — top left */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 200,
        }}
      >
        {/* Dot 0: stays */}
        <div style={{ position: "absolute", opacity: remainingDotOpacity }}>
          <JugglingDots start={0} mode="idle" size={18} color={T.inkFade} />
        </div>
        {/* We render 3 dots initially, then manually animate dots 1+2 dropping */}
        {/* For simplicity, render separate divs for dots after f200 */}
      </div>

      {/* Full dots block (before drop) */}
      {frame < 200 && (
        <div style={{ position: "absolute", top: 180, left: 200 }}>
          <JugglingDots start={0} mode="idle" size={18} color={T.ink} />
        </div>
      )}

      {/* Post-drop: one dim dot remains */}
      {frame >= 200 && (
        <div style={{ position: "absolute", top: 180, left: 200 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: T.inkFade,
              opacity: remainingDotOpacity,
            }}
          />
        </div>
      )}

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 200,
          right: 200,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            opacity: line1Opacity,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: DISPLAY_SIZE,
            letterSpacing: "-2px",
            lineHeight: 1.1,
            color: line1Color,
            pointerEvents: "none",
          }}
        >
          {line1Text}
          {line1Text.length < LINE1.length && frame >= 40 && (
            <span style={{ opacity: 0.7 }}>|</span>
          )}
        </div>

        {/* Line 2 */}
        {frame >= 130 && (
          <div
            style={{
              opacity: line2Opacity,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: DISPLAY_SIZE,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: T.inkDim,
              pointerEvents: "none",
            }}
          >
            {/* "nothing" in INK_BRIGHT */}
            {line2Text.includes("nothing") ? (
              <>
                {line2Text.slice(0, line2Text.indexOf("nothing"))}
                <span style={{ color: T.inkBright }}>
                  {line2Text.slice(line2Text.indexOf("nothing"))}
                </span>
              </>
            ) : (
              line2Text
            )}
            {line2Text.length < LINE2.length && (
              <span style={{ opacity: 0.7 }}>|</span>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Verify in Studio**: scrub Scene02 (comp 180–420). Confirm:
  - Line 1 types in character by character
  - Line 1 dims to INK_DIM as line 2 starts
  - "nothing" renders in INK_BRIGHT
  - Two dots drop/fade at f200

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene02_Antagonist.tsx
git commit -m "feat(launch-film): Scene02 Antagonist — dual line, dot drop"
```

---

## Task 15: Scene06_363.tsx

Scene 6: local frames 0–180 (comp 1320–1500). Counting numeral + philosophy.

**Files:**
- Modify: `src/scenes/launch/Scene06_363.tsx`

- [ ] **Implement Scene06_363.tsx**

```tsx
// src/scenes/launch/Scene06_363.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { ease } from "../../motion/easing";

// Phone grid fades to ghost in background
// 363 counts up from 0 to 363 over 60 frames
// "NOT 365." types in
// Philosophy line fades up

export const Scene06_363: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–180

  // Ghost phone grid in bg (opacity 0→0.06)
  const bgOpacity = interpolate(frame, [0, 20], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 363 count-up (f20→f80, easeOutQuart)
  const countProgress = interpolate(frame, [20, 80], [0, 363], {
    easing: Easing.out(Easing.exp),  // easeOutQuart approximation
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayNumber = String(Math.round(countProgress)).padStart(3, "0");

  // "NOT 365." types (f80→f110)
  const notText = "NOT 365.".slice(
    0,
    Math.max(0, Math.floor((frame - 80) / 1.5))
  );

  // Line 1: "You cannot be perfect," (f120→f144, fade in)
  const line1Opacity = interpolate(frame, [120, 144], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "but you can be relentless." (f132→f155, fade in)
  const line2Opacity = interpolate(frame, [132, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
      {/* Background ghost phones — placeholder rectangle */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Four ghost phone outlines */}
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 160,
            height: 328,
            borderRadius: 20,
            border: `1px solid ${T.frame}`,
          }} />
        ))}
      </div>

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
        }}
      >
        {/* 363 numeral */}
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 480,
            letterSpacing: "-12px",
            lineHeight: 0.95,
            color: T.ink,
            pointerEvents: "none",
          }}
        >
          {displayNumber}
        </div>

        {/* NOT 365. eyebrow */}
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: T.inkDim,
            pointerEvents: "none",
          }}
        >
          {notText}
        </div>

        {/* Philosophy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            marginTop: 8,
          }}
        >
          <div
            style={{
              opacity: line1Opacity,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 56,
              letterSpacing: "-1.4px",
              lineHeight: 1.05,
              color: T.inkDim,
              pointerEvents: "none",
            }}
          >
            You cannot be perfect,
          </div>
          <div
            style={{
              opacity: line2Opacity,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 56,
              letterSpacing: "-1.4px",
              lineHeight: 1.05,
              color: T.inkBright,
              pointerEvents: "none",
            }}
          >
            but you can be relentless.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

**Note:** The `Easing` import for `Easing.out(Easing.exp)` needs to be imported from `remotion`:
```tsx
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
```

- [ ] **Verify TypeScript + Studio**: scrub Scene06 (comp 1320–1500). Confirm:
  - 363 counts up from 000 to 363 cleanly
  - "NOT 365." types in after count completes
  - Philosophy lines fade in

- [ ] **Commit**

```bash
git add src/scenes/launch/Scene06_363.tsx
git commit -m "feat(launch-film): Scene06 363 — counting numeral, philosophy"
```

---

## Task 16: Render Scripts + Final Verification

Add render scripts, run a full TypeScript check, verify the film in Studio end-to-end.

**Files:**
- Modify: `package.json`

- [ ] **Add render scripts to `package.json`**

```json
{
  "scripts": {
    "studio": "remotion studio src/index.ts",
    "render": "remotion render src/index.ts ThreeSentencesLaunch out/three-sentences-launch.mp4",
    "render:launch": "remotion render src/index.ts LaunchFilm out/launch-film-16x9.mp4 --codec h264 --jpeg-quality 85",
    "render:launch-9x16": "remotion render src/index.ts LaunchFilm-9x16 out/launch-film-9x16.mp4 --codec h264",
    "render:launch-1x1": "remotion render src/index.ts LaunchFilm-1x1 out/launch-film-1x1.mp4 --codec h264",
    "still:launch": "remotion still src/index.ts LaunchFilm --frame=165 out/launch-still-165.png"
  }
}
```

- [ ] **Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Open Studio and scrub end-to-end**

```bash
npm run studio
```

Navigate to `LaunchFilm`. Scrub through the full 1650 frames. Verify the scene sequence:
- f0: pure paper
- f12–f30: dots juggle in with overshoot (Scene01)
- f60–f96: wordmark fades in (Scene01)
- f180: Antagonist text begins typing
- f420: "Three." with dots-as-period (Scene03)
- f660: phone slides up (Scene04)
- f740–f900: character-by-character typing (Scene04)
- f960: Today → History transition (Scene05)
- f1320: 363 starts counting up (Scene06)
- f1500: dots converge into brand mark tile (Scene07)
- f1650: film holds on static frame (does not fade)

- [ ] **Render a still at the closing frame to verify brand mark**

```bash
npm run still:launch
```

Open `out/launch-still-165.png` — should show the three dots in their idle position with wordmark and tagline.

- [ ] **Final commit**

```bash
git add package.json
git commit -m "feat(launch-film): render scripts + final integration

Adds 16:9, 9:16, and 1:1 render commands for LaunchFilm.
Full 55-second editorial product film for Three Sentences.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Acceptance Criteria Checklist

Before calling this done, verify every item from the brief:

- [ ] 1. Three dots juggle on entrance with overshoot (not just fade-in)
- [ ] 2. Three dots appear in every scene (opening, antagonist dot-drop, rule period, typing counter, tour transitions, 363, close morph)
- [ ] 3. Dots sit at the baseline of *Three* in Scene03 (visual period)
- [ ] 4. Dots morph into the brand mark tile in Scene07 (not a crossfade)
- [ ] 5. Scene04 typing is character-by-character with varied delays and blinking cursor
- [ ] 6. Scene04 submit includes the 1-frame luminance flash and Today→Done. swap
- [ ] 7. Scene06 363 counter actually counts up from 000
- [ ] 8. Fonts are Newsreader (italic only), Schibsted Grotesk, IBM Plex Mono — no fallbacks visible
- [ ] 9. No color outside the token palette in any frame
- [ ] 10. Grain and vignette applied globally
- [ ] 11. Film ends on a held still frame (not a fade to black)
- [ ] 12. LaunchFilm-9x16 composition renders without text clipping

---

## Self-Review Fixes (applied after spec review)

Issues found and corrected:

### Fix A: Scene01 dot positioning (layout bug)

The plan's flex-column approach for Scene01 puts dots in a fixed position relative to the wordmark column. The brief requires dots to **start at optical center (Y=48%)**, then drift down+right while the wordmark appears above them. Replace the center-column div in Scene01 with absolute positioning:

```tsx
// In Scene01_Opening.tsx — replace the center AbsoluteFill children:
// Dots are absolutely positioned, drifting from optical center to final spot
const DOTS_ORIGIN_Y = 0.48 * 1080;           // 518px
const DOTS_FINAL_Y = DOTS_ORIGIN_Y + 80;     // 598px
const DOTS_FINAL_X = 960 + 60;              // 1020px

const dotsY = DOTS_ORIGIN_Y + dotsDriftProgress * 80;
const dotsX = 960 + dotsDriftProgress * 60;

// Wordmark: fades in above the dots (centered above dotsX at dotsY)
// Since wordmark is 180px tall, its center sits ~90px above dotsY
```

Position the wordmark div with `position: absolute; left: 50%; top: 50%; transform: translateX(-50%)` and use `translateY` relative to dot position. The key invariant: wordmark bottom + 24px gap = dots top. Use `bottom` anchoring off the dots position.

### Fix B: Scene06 — add dots as the period of "363."

Per §4.2: in Scene06, the dots should appear "as the punctuation of '363.'" Add `JugglingDots` to Scene06, rendering them as a period after the numeral:

```tsx
// Inside Scene06_363.tsx, after the 363 numeral div:
// Dots appear at f80 (when the number finishes counting)
const dotsOpacity = interpolate(frame, [80, 95], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// Render inline with the numeral, or beneath it as punctuation
<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
  <div style={{ /* 363 numeral */ }}>{displayNumber}</div>
  <div style={{ opacity: dotsOpacity, paddingBottom: 32 }}>
    <JugglingDots start={80} mode={frame >= 80 ? "idle" : "enter"} size={28} color={T.ink} />
  </div>
</div>
```

### Fix C: Scene04 — add blinking cursor to ScreenToday

The `ScreenToday` component renders static text with no cursor. Add a `showCursor` prop:

```tsx
// ScreenToday interface: add
showCursor?: boolean;  // default false

// In the writing surface div, after typedText:
{showCursor && !locked && (
  <CursorBlink />  // or inline blink logic
)}
```

Add `CursorBlink` inline in `ScreenToday.tsx`:
```tsx
const BLINK_PERIOD = 16; // frames — but ScreenToday has no frame access...
```

Problem: `ScreenToday` is a static component with no `useCurrentFrame()`. **Fix**: add `frame` as an optional prop, or pull it in via `useCurrentFrame()` inside ScreenToday. Choose: accept `frame` prop (keeps it testable):

```tsx
// ScreenToday: add
frame?: number;   // pass from parent for cursor blink

// Cursor blink (only in Scene04):
const blinkOn = frame !== undefined && Math.floor(frame / 8) % 2 === 0;
// Render after typedText:
{showCursor && blinkOn && (
  <span style={{ width: 1, height: "1.1em", background: T.inkBright, display: "inline-block", marginLeft: 1, verticalAlign: "text-bottom" }} />
)}
```

In Scene04, pass `frame={frame}` and `showCursor={!locked}` to `ScreenToday`.

### Fix D: Scene05 cluster — ScreenToday prop mismatch

In the cluster grid, `ScreenToday` is called with `locked` and `submitFill` but those props need the prop interface to include them. They are included in the interface as defined in Task 5. ✅ No change needed.

### Fix E: Easing import in Scene06

Add `Easing` to the Remotion import line in `Scene06_363.tsx`:

```tsx
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
```

This is already noted in the task but calling it out explicitly.

### Type Name Consistency

All components use:
- `JugglingDotsProps.start` → consistent ✅
- `JugglingDotsProps.mode` → consistent across all scene usages ✅
- `ScreenToday.sentencesDone` → consistent ✅
- `ScreenHistory.reveal` → consistent ✅
- `ScreenInsights.tilesReveal` → consistent ✅
- `ScreenCircle.friendsReveal` → consistent ✅
- `PhoneFrame.width / height` → consistent ✅
- `ease.juggle / ease.editorial / ease.discipline` → consistent ✅
- `SCENE_STARTS.s1` through `.s7` → consistent ✅
- `SCENE_DURATIONS.s1` through `.s7` → consistent ✅
