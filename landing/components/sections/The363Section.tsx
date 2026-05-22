"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function The363Section() {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;
    let rafId: number;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          observer.disconnect();
          if (reduced) {
            setCount(363); // instant snap
          } else {
            let current = 0;
            const step = () => {
              current = Math.min(current + 3, 363);
              setCount(current);
              if (current < 363) {
                rafId = requestAnimationFrame(step);
              }
            };
            rafId = requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  return (
    <section className="relative py-32 px-6 overflow-hidden text-center">
      {/* Giant watermark "363" behind all content */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none font-serif italic"
        initial={{ opacity: reduced ? 0.03 : 0, scale: reduced ? 1 : 0.9 }}
        whileInView={reduced ? undefined : { opacity: 0.03, scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(220px, 32vw, 520px)",
          color: "#FFFFF0",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-12px",
        }}
      >
        363
      </motion.div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Count-up number */}
        <div ref={countRef}>
          <div
            className="tabular-nums font-mono font-bold"
            style={{
              fontSize: "clamp(80px, 12vw, 130px)",
              color: "#FFFFF0",
              lineHeight: 1,
            }}
          >
            {String(count).padStart(3, '0')}
          </div>
          <p className="mt-3 text-sm uppercase tracking-widest text-white/40">
            daily reflections captured
          </p>
        </div>

        {/* Two-color headline */}
        <Reveal delay={0.2}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 48px)', lineHeight: 1.1, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }} className="mt-10">
            <span style={{ color: '#8a877e' }}>You cannot be perfect. </span>
            <span style={{ color: '#ebe7dc' }}>But you can be relentless.</span>
          </h2>
        </Reveal>

        {/* Supporting copy */}
        <Reveal delay={0.35}>
          <p className="mt-5 text-base sm:text-lg text-white/50 max-w-md mx-auto leading-relaxed">
            The constraint that changes everything.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
