"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

export function The363Section() {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;
    let rafId: number;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          observer.disconnect();
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
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="relative py-32 px-6 overflow-hidden text-center">
      {/* Giant watermark "363" behind all content */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 0.03, scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(200px, 30vw, 400px)",
          color: "#FFFFF0",
          fontWeight: 700,
          lineHeight: 1,
          fontFamily: "monospace",
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
            {count}
          </div>
          <p className="mt-3 text-sm uppercase tracking-widest text-white/40">
            daily reflections captured
          </p>
        </div>

        {/* Two-color headline */}
        <Reveal delay={0.2}>
          <h2 className="mt-10 text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            <span style={{ color: "#FFFFF0" }}>Three sentences.</span>{" "}
            <span className="text-white/40">Every day.</span>
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
