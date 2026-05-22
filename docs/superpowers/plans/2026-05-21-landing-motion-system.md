# Landing Page Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete motion system for the Three Sentences Next.js + Framer Motion landing page, as specified in the motion prompt (sections 0, 2, 3.2–3.4).

**Architecture:** A single `<Reveal>` component wraps all scroll-triggered elements. Parallax and scroll effects use Framer Motion's `useScroll` + `useTransform`. Infinite cycles (prompt-stack, Circle view) use plain `setInterval` with cleanup. Three new sections (How, Features, FAQ) are created to complete the page.

**Tech Stack:** Next.js 16, React 19, `framer-motion` v11, Tailwind CSS.

---

## File map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `landing/components/ui/Reveal.tsx` | Scroll-trigger wrapper: opacity/translateY reveal with IntersectionObserver |
| Modify | `landing/lib/animations.ts` | Add `lpFloat`, `lpModalIn`, `lpFadeIn` variants; brand easing constant |
| Modify | `landing/components/sections/HeroSection.tsx` | Parallax scroll, floating mark, scroll cue, nav elevation |
| Create | `landing/hooks/useScrollY.ts` | RAF-throttled scroll Y value |
| Modify | `landing/components/WaitlistModal.tsx` | `lp-modal-in` entrance (translateY 16→0, scale 0.98→1) |
| Modify | `landing/components/sections/ConstraintSection.tsx` | Add MiniPhone typing demo |
| Create | `landing/components/sections/HowSection.tsx` | Staggered 3-card How section |
| Create | `landing/components/sections/FeaturesSection.tsx` | 4-tab features with prompt-stack + Circle cycle |
| Modify | `landing/components/sections/The363Section.tsx` | Count-up 0→363, watermark scale-in |
| Modify | `landing/components/sections/PrinciplesSection.tsx` | Staggered Reveal 2×2 |
| Modify | `landing/components/sections/AIReflectionSection.tsx` | Timeframe chip swap fade-in |
| Modify | `landing/components/sections/TrustSection.tsx` | Staggered Reveal 3 quotes |
| Create | `landing/components/sections/FAQSection.tsx` | Accordion with max-height + rotate icon |
| Modify | `landing/components/sections/FinalCTASection.tsx` | Mirror hero: floating mark + blur-in headlines |
| Modify | `landing/app/page.tsx` | Wire HowSection, FeaturesSection, FAQSection into page |

---

## Task 1: `Reveal` component + `useScrollY` hook + update `animations.ts`

**Files:**
- Create: `landing/components/ui/Reveal.tsx`
- Create: `landing/hooks/useScrollY.ts`
- Modify: `landing/lib/animations.ts`

- [ ] **Step 1: Create `useScrollY` hook**

```ts
// landing/hooks/useScrollY.ts
"use client";
import { useState, useEffect } from "react";

export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrollY;
}
```

- [ ] **Step 2: Create `Reveal` component**

```tsx
// landing/components/ui/Reveal.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setReveal] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Safety net: if element is already in view on mount, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setReveal(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReveal(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);

    // 2s fallback — never leave content invisible
    const fallback = setTimeout(() => {
      setReveal(true);
      observer.disconnect();
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Add missing variants to `landing/lib/animations.ts`**

Append to the existing file:

```ts
// Add to landing/lib/animations.ts

export const lpFloat: Variants = {
  // Used with animate prop + repeat: Infinity
  float: {
    y: [0, -10, 0],
    transition: { duration: 4.5, ease: "easeInOut", repeat: Infinity },
  },
};

export const lpModalIn: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const lpFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const brandTransition: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

export const modalTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/ui/Reveal.tsx landing/hooks/useScrollY.ts landing/lib/animations.ts
git commit -m "feat(landing-motion): Reveal component, useScrollY hook, animation variants"
```

---

## Task 2: Nav scroll elevation + Hero parallax + floating mark + scroll cue

**Files:**
- Modify: `landing/components/sections/HeroSection.tsx`

Spec §2.2: Nav elevates at scrollY > 40 with 240ms ease (padding, bg, border).
Spec §2.4: Hero contents move at 0.3 rate, fade by scrollY/600.
Spec §2.5: Floating mark uses `lp-float` (4.5s ease-in-out infinite).
Spec §2.6: Scroll cue = "SCROLL" label + 56px vertical hairline gradient, fades with hero.

- [ ] **Step 1: Replace `HeroSection.tsx` nav + hero with spec-compliant version**

```tsx
// landing/components/sections/HeroSection.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useScrollY } from "@/hooks/useScrollY";

interface HeroSectionProps {
  onCTAClick: () => void;
}

function FloatingMark() {
  return (
    <motion.div
      className="w-14 h-14 mb-8 flex items-center justify-center"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
    >
      {/* Brand three-dot mark */}
      <div className="flex gap-[10px] items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-full"
            style={{ backgroundColor: "#FFFFF0" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ScrollCue({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      style={{ opacity }}
    >
      <span className="font-mono text-[10px] tracking-[3px] uppercase text-white/30">
        Scroll
      </span>
      <div
        className="w-px h-14"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
        }}
      />
    </div>
  );
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const scrollY = useScrollY();
  const elevated = scrollY > 40;

  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const heroY = Math.min(scrollY * 0.3, 200);
  const glowY = scrollY * 0.15;

  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          padding: elevated ? "14px 64px" : "24px 64px",
          background: elevated ? "rgba(6,6,8,0.78)" : "transparent",
          backdropFilter: elevated ? "blur(16px)" : "none",
          WebkitBackdropFilter: elevated ? "blur(16px)" : "none",
          borderBottom: `1px solid ${elevated ? "rgba(255,255,255,0.06)" : "transparent"}`,
          transition: "all 240ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs tracking-[3px] uppercase text-white/70">
            Three Sentences
          </span>
          <Button variant="outline" onClick={onCTAClick} className="text-sm">
            Join the waitlist
          </Button>
        </div>
      </nav>

      {/* Background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%)",
          transform: `translateY(${glowY}px)`,
          opacity: heroOpacity,
        }}
      />

      {/* Hero content */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 relative"
        style={{
          transform: `translateY(${heroY}px)`,
          opacity: heroOpacity,
        }}
      >
        <div className="text-center max-w-3xl mx-auto">
          <FloatingMark />

          <motion.h1
            className="text-7xl sm:text-8xl font-bold tracking-tight text-white leading-none mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            Three Sentences
          </motion.h1>

          <motion.p
            className="font-mono text-xs tracking-[3px] uppercase text-white/30 mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            BE BETTER. DO BETTER.
          </motion.p>

          <motion.p
            className="text-white/40 text-base max-w-lg mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            A daily journaling practice built on one unbreakable constraint.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          >
            <Button
              onClick={onCTAClick}
              className="bg-white text-black hover:bg-white/90 transition-transform hover:-translate-y-px"
            >
              Join the waitlist
            </Button>
          </motion.div>
        </div>
      </main>

      <ScrollCue opacity={heroOpacity} />
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/sections/HeroSection.tsx
git commit -m "feat(landing-motion): hero parallax, floating mark, scroll cue, nav elevation per spec §2.2–2.6"
```

---

## Task 3: WaitlistModal — `lp-modal-in` entrance

**Files:**
- Modify: `landing/components/WaitlistModal.tsx`

Spec §2.18: On open, backdrop `lp-fade-in` 200ms + blur(12px). Modal `lp-modal-in` 300ms brand easing (translateY 16→0, scale 0.98→1, opacity 0→1). On close: instant backdrop fade 200ms, no modal exit animation. Form: email focus border-color 200ms. Submit: spinner → 900ms delay → success cross-fade.

- [ ] **Step 1: Update WaitlistModal to use `lpModalIn` variant and correct timing**

In `landing/components/WaitlistModal.tsx`, find the modal `motion.div` that renders the modal box and update:

```tsx
// Replace existing modal entrance:
<motion.div
  key="modal"
  variants={{
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  }}
  initial="hidden"
  animate="visible"
  // No exit animation per spec
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  className="relative bg-[#0d0d0f] border border-white/[0.06] rounded-2xl p-8 w-full max-w-md mx-4 z-10"
>
```

For the backdrop, ensure `backdropFilter: blur(12px)` and fade 200ms:

```tsx
<motion.div
  key="backdrop"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 z-50 flex items-center justify-center"
  style={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(0,0,0,0.6)" }}
  onClick={handleClose}
>
```

For the submit flow — find `handleSubmit`. Update the simulated delay:
```tsx
// Simulate network (spec says 900ms)
await new Promise(resolve => setTimeout(resolve, 900));
```

The success cross-fade — use AnimatePresence with two states:
```tsx
<AnimatePresence mode="wait">
  {isSuccess ? (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* success content */}
    </motion.div>
  ) : (
    <motion.div
      key="form"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* form content */}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/WaitlistModal.tsx
git commit -m "feat(landing-motion): waitlist modal lp-modal-in 300ms, blur backdrop, success cross-fade per spec §2.18"
```

---

## Task 4: ConstraintSection — MiniPhone typing demo

**Files:**
- Modify: `landing/components/sections/ConstraintSection.tsx`

Spec §2.7: On first scroll-into-view (threshold 0.3), wait 400ms, then type a 3-sentence script char-by-char (38–68ms per char). After typing, wait 600ms then transition to submitted state.

- [ ] **Step 1: Read the current `ConstraintSection.tsx`** to understand its existing structure before modifying.

```bash
cat /Users/reetmitra/Desktop/363/threesentences/landing/components/sections/ConstraintSection.tsx
```

- [ ] **Step 2: Add the typing demo**

The `ConstraintSection` should contain a `<MiniPhone>` component. Add this typing demo logic:

```tsx
// Add inside ConstraintSection.tsx (or a sub-component MiniPhone)
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const SCRIPT =
  "The rain stopped just after lunch.\nI walked the long way to the post office.\nA small kindness from a stranger.";

function countSentences(text: string): number {
  return (text.match(/[.!?]/g) || []).length;
}

function MiniPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!inView) return;

    let cancelled = false;
    const delays: ReturnType<typeof setTimeout>[] = [];

    const startTyping = () => {
      let elapsed = 400; // initial wait
      for (let i = 0; i < SCRIPT.length; i++) {
        const charDelay = 38 + Math.random() * 30; // 38–68ms
        elapsed += charDelay;
        const idx = i + 1;
        const t = setTimeout(() => {
          if (cancelled) return;
          setTyped(SCRIPT.slice(0, idx));
        }, elapsed);
        delays.push(t);
      }
      // After typing completes, wait 600ms then submitted state
      const doneDelay = elapsed + 600;
      const t = setTimeout(() => {
        if (!cancelled) setSubmitted(true);
      }, doneDelay);
      delays.push(t);
    };

    startTyping();
    timeoutsRef.current = delays;

    return () => {
      cancelled = true;
      delays.forEach(clearTimeout);
    };
  }, [inView]);

  const dotCount = countSentences(typed);

  return (
    <div
      ref={ref}
      className="w-64 bg-[#0d0d0f] border border-white/[0.06] rounded-3xl p-5 font-mono text-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-white/70 transition-colors duration-500"
          style={{ color: submitted ? "#FFFFFF" : undefined }}
        >
          {submitted ? "Done." : "Today"}
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: i < dotCount ? "#FFFFFF" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Text area */}
      <div className="min-h-[80px] text-white/70 text-xs leading-relaxed whitespace-pre-wrap">
        {typed}
        {!submitted && (
          <span
            className="inline-block w-0.5 h-3 bg-white/70 ml-0.5 align-middle"
            style={{ animation: "lpCursor 1s step-start infinite" }}
          />
        )}
      </div>

      {/* Counter + submit */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-white/30">
          {submitted ? "✓ Locked" : `${dotCount} / 3 · ${dotCount === 3 ? "Ready" : "more"}`}
        </span>
        <div
          className="px-3 py-1 rounded-full text-[10px] transition-all duration-600"
          style={{
            backgroundColor: submitted ? "#FFFFFF" : "transparent",
            border: "1px solid",
            borderColor: submitted ? "#FFFFFF" : "rgba(255,255,255,0.15)",
            color: submitted ? "#0a0a0a" : "rgba(255,255,255,0.4)",
          }}
        >
          {submitted ? "Submitted · Tomorrow returns" : "Submit"}
        </div>
      </div>

      <style>{`
        @keyframes lpCursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      `}</style>
    </div>
  );
}
```

Then use `<MiniPhone />` inside the `ConstraintSection` render (alongside the existing copy).

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 4: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/sections/ConstraintSection.tsx
git commit -m "feat(landing-motion): MiniPhone typing demo in ConstraintSection per spec §2.7"
```

---

## Task 5: Create HowSection + FeaturesSection + FAQSection

**Files:**
- Create: `landing/components/sections/HowSection.tsx`
- Create: `landing/components/sections/FeaturesSection.tsx`
- Create: `landing/components/sections/FAQSection.tsx`

These three sections exist in the reference (`landing-sections-b.jsx`, `landing-sections-c.jsx`) but are missing from the Next.js codebase.

- [ ] **Step 1: Create `HowSection.tsx`**

Spec §2.8: Three step cards, `<Reveal delay={index * 150}>`.

```tsx
// landing/components/sections/HowSection.tsx
"use client";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    num: "01",
    title: "Open the app",
    body: "Every day, one blank page. No feeds, no distractions. Just your three sentences.",
  },
  {
    num: "02",
    title: "Write three sentences",
    body: "Three sentences about anything. Your day, a thought, a moment. The constraint is the point.",
  },
  {
    num: "03",
    title: "Lock and go",
    body: "Submit. It's done. Come back tomorrow. That's the whole practice.",
  },
];

export function HowSection() {
  return (
    <section id="how" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="font-mono text-xs tracking-[3px] uppercase text-white/30 mb-16 text-center">
            How it works
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.15}>
              <div className="border border-white/[0.06] rounded-2xl p-8">
                <p className="font-serif italic text-5xl text-white/10 mb-6">{step.num}</p>
                <h3 className="text-white font-medium mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `FeaturesSection.tsx`**

Spec §2.9–2.11: Four tabs (Today / History / Insights / The Circle). Active chip fills. Insights tab has prompt-stack cycling every 1800ms. Circle tab has 3-view cycle every 5s.

```tsx
// landing/components/sections/FeaturesSection.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const TABS = ["Today", "History", "Insights", "The Circle"] as const;
type Tab = (typeof TABS)[number];

const PROMPTS = [
  { eyebrow: "PATTERN", body: "You write most when you're between things." },
  { eyebrow: "OBSERVATION", body: "Three weeks of mornings. The afternoons are quieter." },
  { eyebrow: "QUESTION", body: "What would you do differently on a Tuesday?" },
  { eyebrow: "THEME", body: "Patience keeps surfacing. You're working on something." },
];

const CIRCLE_VIEWS = ["friends", "dm", "group"] as const;

function PromptStack() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 4), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-2">
      {PROMPTS.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: i === active ? 1 : 0.55,
            borderColor: i === active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.06)",
          }}
          transition={{ duration: 0.4, ease: "ease" }}
          className="border-l-2 pl-4 py-2"
        >
          <p
            className="font-mono text-[10px] tracking-[2px] uppercase mb-1 transition-colors duration-400"
            style={{ color: i === active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}
          >
            {p.eyebrow}
          </p>
          <p className="text-white/60 text-xs leading-relaxed">{p.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

function CircleViews() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 5000);
    return () => clearInterval(id);
  }, []);

  const LABELS = ["Friends", "Direct", "Group"];

  return (
    <div className="relative h-48">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <p className="font-mono text-xs tracking-[2px] uppercase text-white/30 mb-3">
              {LABELS[active]}
            </p>
            <p className="text-white/60 text-sm">
              {active === 0 && "See who's keeping their streak today."}
              {active === 1 && "Send your entry to a close friend."}
              {active === 2 && "A small group, held accountable together."}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pager dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              width: i === active ? 14 : 4,
              backgroundColor: i === active ? "#FFFFFF" : "rgba(255,255,255,0.2)",
            }}
            transition={{ duration: 0.3, ease: "ease" }}
            className="h-1 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  if (tab === "Insights") return <PromptStack />;
  if (tab === "The Circle") return <CircleViews />;
  return (
    <p className="text-white/40 text-sm leading-relaxed">
      {tab === "Today" && "Write your three sentences. Every day. No exceptions."}
      {tab === "History" && "Every entry you've ever written. Searchable, private, yours."}
    </p>
  );
}

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Today");

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="font-mono text-xs tracking-[3px] uppercase text-white/30 mb-12 text-center">
            Inside the app
          </p>
        </Reveal>

        {/* Tab chips */}
        <Reveal delay={0.1}>
          <div className="flex gap-2 flex-wrap justify-center mb-12">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
                  color: activeTab === tab ? "#0a0a0a" : "rgba(255,255,255,0.4)",
                  border: "1px solid",
                  borderColor: activeTab === tab ? "#FFFFFF" : "rgba(255,255,255,0.1)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0d0d0f] border border-white/[0.06] rounded-2xl p-8 min-h-[200px]"
          >
            <TabContent tab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `FAQSection.tsx`**

Spec §2.16: Single-open accordion. `+` rotates 45deg on open. `max-height: 0 → 300px` with 300ms brand easing.

```tsx
// landing/components/sections/FAQSection.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const FAQS = [
  {
    q: "Why only three sentences?",
    a: "The constraint is the practice. Three sentences is enough to capture the truth of a day without turning it into a project. It removes the excuse of 'I don't have time.'",
  },
  {
    q: "What if I miss a day?",
    a: "You restart. The streak resets. That's not a punishment — it's clarity. You either showed up or you didn't. There's no partial credit.",
  },
  {
    q: "Are my entries private?",
    a: "Yes. Your entries are encrypted end-to-end. We cannot read them. Only you can.",
  },
  {
    q: "What is 363?",
    a: "363 is the number of days in the full commitment. Three hundred and sixty three daily entries. Not a year — a choice.",
  },
  {
    q: "What is The Circle?",
    a: "A small, private social layer. Share your streak (not your words) with a few close friends. Accountability without exposure.",
  },
  {
    q: "Is there an AI?",
    a: "Optionally. The AI Reflection reads your entries and surfaces patterns, themes, and questions. It's opt-in and you can turn it off at any time.",
  },
  {
    q: "When does it launch?",
    a: "We're rolling out in waves. Join the waitlist and you'll hear from us.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-5 text-left gap-4"
      >
        <span className="text-white/80 text-sm">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "ease" }}
          className="text-white/40 text-xl flex-shrink-0"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/40 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <p className="font-mono text-xs tracking-[3px] uppercase text-white/30 mb-12 text-center">
            Questions
          </p>
        </Reveal>
        <div>
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <FAQItem q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 5: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/sections/HowSection.tsx landing/components/sections/FeaturesSection.tsx landing/components/sections/FAQSection.tsx
git commit -m "feat(landing-motion): create HowSection, FeaturesSection (tabs+cycles), FAQSection (accordion) per spec §2.8–2.11, 2.16"
```

---

## Task 6: Wire new sections into `page.tsx`

**Files:**
- Modify: `landing/app/page.tsx`

- [ ] **Step 1: Import and add the three new sections**

In `landing/app/page.tsx`, add after `ConstraintSection`:

```tsx
import { HowSection } from "@/components/sections/HowSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FAQSection } from "@/components/sections/FAQSection";
```

In the JSX, insert them in order: `ConstraintSection → HowSection → FeaturesSection → The363Section → PrinciplesSection → AIReflectionSection → TrustSection → FAQSection → FinalCTASection → FooterSection`.

- [ ] **Step 2: TypeScript + build check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/app/page.tsx
git commit -m "feat(landing-motion): wire HowSection, FeaturesSection, FAQSection into page"
```

---

## Task 7: The363Section — count-up + watermark

**Files:**
- Modify: `landing/components/sections/The363Section.tsx`

Spec §2.12: On scroll-into-view (threshold 0.2), count 0→363 in ~1.8s via rAF. Giant watermark fades in over 2500ms with `scale 0.9→1`. Two-color headline with staggered blur-in.

- [ ] **Step 1: Read current `The363Section.tsx`**

```bash
cat /Users/reetmitra/Desktop/363/threesentences/landing/components/sections/The363Section.tsx
```

- [ ] **Step 2: Add count-up and watermark**

Add a `useCountUp` hook inline:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let n = 0;
    const step = () => {
      n = Math.min(n + 3, target);
      setValue(n);
      if (n < target) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [active, target]);

  return value;
}

export function The363Section() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const count = useCountUp(363, inView);

  return (
    <section className="py-32 px-6 relative overflow-hidden" ref={ref}>
      {/* Watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 0.03, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      >
        <span className="font-serif italic text-[40vw] text-white leading-none">363</span>
      </motion.div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Count-up display */}
        <Reveal>
          <p className="font-mono text-7xl tracking-tight text-white mb-8">
            {String(count).padStart(3, "0")}
          </p>
        </Reveal>

        {/* Two-color headline */}
        <div className="space-y-1">
          <Reveal delay={0.7}>
            <p className="text-white/30 text-2xl font-light">
              You cannot be perfect.
            </p>
          </Reveal>
          <Reveal delay={0.95}>
            <motion.p
              className="text-white text-2xl font-light"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={inView ? { opacity: 1, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.9, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            >
              But you can be relentless.
            </motion.p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 4: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/sections/The363Section.tsx
git commit -m "feat(landing-motion): 363 count-up rAF, watermark scale-in, blur-in headline per spec §2.12"
```

---

## Task 8: Staggered Reveal — Principles, Trust, AIReflection chip swap

**Files:**
- Modify: `landing/components/sections/PrinciplesSection.tsx`
- Modify: `landing/components/sections/TrustSection.tsx`
- Modify: `landing/components/sections/AIReflectionSection.tsx`

- [ ] **Step 1: Read all three sections**

```bash
cat /Users/reetmitra/Desktop/363/threesentences/landing/components/sections/PrinciplesSection.tsx
cat /Users/reetmitra/Desktop/363/threesentences/landing/components/sections/TrustSection.tsx
cat /Users/reetmitra/Desktop/363/threesentences/landing/components/sections/AIReflectionSection.tsx
```

- [ ] **Step 2: Wrap `PrinciplesSection` cards with `<Reveal delay={i * 0.08}>`**

Find where the 4 principle cards are rendered. Wrap each in `<Reveal delay={i * 0.08}>`. Import `Reveal` from `@/components/ui/Reveal`.

- [ ] **Step 3: Wrap `TrustSection` quote cards with `<Reveal delay={i * 0.12}>`**

Find where the 3 quote cards are rendered. Wrap each in `<Reveal delay={i * 0.12}>`. The decorative `"` glyph stays at `opacity: 0.12` (no separate animation).

- [ ] **Step 4: Add `AIReflectionSection` chip swap fade**

In `AIReflectionSection.tsx`, find the timeframe chip state. When chip changes, remount the content area using `key={selectedRange}`:

```tsx
// Wrap the 3 content cards:
<AnimatePresence mode="wait">
  <motion.div
    key={selectedRange}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="grid md:grid-cols-3 gap-6"
  >
    {/* Theme / Observation / Question cards */}
  </motion.div>
</AnimatePresence>
```

Chip background `transition-colors duration-200` via Tailwind class is sufficient.

- [ ] **Step 5: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 6: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/sections/PrinciplesSection.tsx landing/components/sections/TrustSection.tsx landing/components/sections/AIReflectionSection.tsx
git commit -m "feat(landing-motion): staggered Reveal on Principles, Trust; chip swap fade on AIReflection per spec §2.13–2.15"
```

---

## Task 9: FinalCTASection — mirror hero

**Files:**
- Modify: `landing/components/sections/FinalCTASection.tsx`

Spec §2.17: Mirrors the hero: floating mark (`lp-float`), headlines with `pt-fade-up` + `blur(10px)→0`, CTA reveals via `<Reveal>`.

- [ ] **Step 1: Read current `FinalCTASection.tsx`**

```bash
cat /Users/reetmitra/Desktop/363/threesentences/landing/components/sections/FinalCTASection.tsx
```

- [ ] **Step 2: Add floating mark and blur-in headline**

```tsx
// In FinalCTASection.tsx
"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/button";

interface FinalCTASectionProps { onCTAClick: () => void; }

export function FinalCTASection({ onCTAClick }: FinalCTASectionProps) {
  return (
    <section className="py-40 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Floating mark — mirrors hero */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
        >
          <div className="flex gap-[10px] items-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: "#FFFFF0" }} />
            ))}
          </div>
        </motion.div>

        {/* Headline with blur-in */}
        <Reveal y={12}>
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight"
            initial={{ filter: "blur(10px)" }}
            whileInView={{ filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Three sentences. Every day. Starting tonight.
          </motion.h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-white/40 mb-10 text-base">
            Join the waitlist. No spam. Just a notification when your spot opens.
          </p>
        </Reveal>

        <Reveal delay={0.35}>
          <Button
            onClick={onCTAClick}
            className="bg-white text-black hover:bg-white/90 transition-transform hover:-translate-y-px px-8 py-3"
          >
            Join the waitlist
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 4: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/sections/FinalCTASection.tsx
git commit -m "feat(landing-motion): FinalCTA mirrors hero with floating mark and blur-in per spec §2.17"
```

---

## Task 10: prefers-reduced-motion pass (landing)

**Files:**
- Modify: `landing/components/ui/Reveal.tsx`
- Modify: `landing/components/sections/The363Section.tsx` (already handles it in Task 7)
- Modify: `landing/components/sections/FeaturesSection.tsx` (PromptStack, CircleViews intervals)

Spec §0: Disable scroll-triggered reveals (instant opacity 1), hero parallax, count-up snap, infinite loops.

- [ ] **Step 1: Update `Reveal.tsx` to honor reduced motion**

```tsx
// In Reveal.tsx, add inside the component:
const prefersReduced = typeof window !== "undefined"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// If prefersReduced, skip the observer — just set revealed = true immediately:
useEffect(() => {
  if (prefersReduced) {
    setReveal(true);
    return;
  }
  // ... existing IntersectionObserver setup
}, []);

// And in the motion.div, when prefersReduced, use duration: 0:
transition={prefersReduced
  ? { duration: 0 }
  : { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
```

- [ ] **Step 2: Pause PromptStack and CircleViews intervals under reduced motion**

In `FeaturesSection.tsx`, add to `PromptStack` and `CircleViews`:

```tsx
// At the top of each component:
const prefersReduced = typeof window !== "undefined"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// In the setInterval useEffect:
if (prefersReduced) return; // don't start the interval
```

- [ ] **Step 3: Disable hero parallax under reduced motion**

In `HeroSection.tsx`:

```tsx
const prefersReduced = typeof window !== "undefined"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const heroY = prefersReduced ? 0 : Math.min(scrollY * 0.3, 200);
const glowY = prefersReduced ? 0 : scrollY * 0.15;
const heroOpacity = prefersReduced ? 1 : Math.max(0, 1 - scrollY / 600);
// Also stop FloatingMark animation:
// Pass prefersReduced to FloatingMark and skip animate prop
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/reetmitra/Desktop/363/threesentences/landing && npx tsc --noEmit 2>&1 | grep "error" | head -10
```

- [ ] **Step 5: Verify Reveal safety net**

In a browser, add `?debugReveal=1` handling (or just manually test) by setting `IntersectionObserver` to a mock that never fires — after 2 seconds, content should be visible.

- [ ] **Step 6: Commit**

```bash
cd /Users/reetmitra/Desktop/363/threesentences
git add landing/components/ui/Reveal.tsx landing/components/sections/FeaturesSection.tsx landing/components/sections/HeroSection.tsx
git commit -m "feat(landing-motion): honor prefers-reduced-motion throughout landing per spec §0"
```

---

## Sign-off checklist (landing)

- [ ] Nav: transparent at top, elevated (blur + border) after scrollY > 40. All transitions 240ms ease.
- [ ] Hero: content parallaxes down at 0.3× scroll rate, fades out by y=600. Floating mark bounces on 4.5s loop.
- [ ] Scroll cue hairline visible at top, fades with hero.
- [ ] All page sections reveal on scroll via `<Reveal>`, fire once, never reset.
- [ ] Deep-link to `/#features` — Reveal safety net ensures content visible within 2s.
- [ ] ConstraintSection: MiniPhone types the 3-sentence script on scroll-into-view, transitions to submitted state.
- [ ] FeaturesSection: tab chips switch content 400ms fade. Insights prompt-stack cycles every 1.8s. Circle views cycle every 5s with pager dots.
- [ ] The363 count-up: 0→363 in ~1.8s. Watermark fades in with scale(0.9→1).
- [ ] AI Reflection: chip change fades in new content with `key` remount.
- [ ] Principles 2×2 and Trust 3 quotes: staggered Reveal.
- [ ] FAQ: single-open, `+` rotates 45deg, answer expands with max-height transition.
- [ ] Waitlist modal: backdrop blur 200ms, modal lp-modal-in 300ms. Submit: spinner 900ms → success cross-fade.
- [ ] `prefers-reduced-motion: reduce`: all reveals instant, parallax disabled, loops paused, count-up snaps to 363.
- [ ] Hero parallax holds 60fps in DevTools Performance tab.
- [ ] No content stuck at `opacity: 0` with JS disabled (Reveal should still show content via the 2s fallback which fires without IO).
