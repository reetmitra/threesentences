"use client";

import { useEffect, useRef, useState } from "react";
import { KEPT_NIGHTS } from "@/components/scene/night";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** The scene starts this year-scene with this many nights already lit (see yearScene.ts). */
const START = 20;

const PHASES = [
  "A year has 365 nights.",
  "Keep 363 of them.",
  "You cannot be perfect. But you can be relentless.",
  "Two slips stay paper white: your days of grace.",
];

/** Pinned: scroll turns you round the inside of the year while the nights light up. */
export function Year() {
  const root = useRef<HTMLElement>(null);
  const numeral = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      const k = smooth(clamp(p / 0.84));
      if (numeral.current) numeral.current.textContent = String(Math.round(START + (KEPT_NIGHTS - START) * k));
      setPhase(p < 0.26 ? 0 : p < 0.56 ? 1 : p < 0.84 ? 2 : 3);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <section id="year" ref={root} data-stop="year" className="year">
      <div className="year-pin">
        <div className="year-hit" data-scene-hover aria-hidden="true" />
        <div className="year-col scrim">
          <h2 className="year-top">363, not 365.</h2>
          <div className="year-phases">
            {PHASES.map((text, i) => (
              <div className="year-phase" data-on={phase === i} key={text}>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div>
            <span className="year-numeral" aria-hidden="true">
              <span ref={numeral}>{KEPT_NIGHTS}</span>
            </span>
            <p className="year-label small">nights kept, out of 365</p>
          </div>
        </div>
      </div>
    </section>
  );
}
