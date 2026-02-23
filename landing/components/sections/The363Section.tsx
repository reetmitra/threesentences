"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";
import { blurIn, fadeUp, defaultTransition } from "@/lib/animations";
import { useCountUp } from "@/lib/useCountUp";

export function The363Section() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const count = useCountUp(363, 1.8, isInView);

  return (
    <section
      ref={ref}
      className="min-h-[70vh] flex items-center justify-center px-6 py-24 relative overflow-hidden"
    >
      {/* Giant background watermark */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-[20rem] sm:text-[28rem] md:text-[36rem] font-bold font-mono text-white/[0.03] select-none pointer-events-none leading-none"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      >
        363
      </motion.span>

      {/* Foreground content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Label */}
        <TextScramble
          className="text-xs uppercase tracking-[0.3em] text-white/30"
          duration={0.8}
          speed={0.04}
          trigger={isInView}
          characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        >
          Not 365.
        </TextScramble>

        {/* Counter */}
        <motion.div
          className="mt-6 mb-8"
          variants={blurIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <span className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono text-white tabular-nums">
            {String(count).padStart(3, "0")}
          </span>
        </motion.div>

        {/* Philosophy pivot */}
        <motion.div
          className="space-y-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.25, delayChildren: 0.7 } },
          }}
        >
          <motion.p
            variants={fadeUp}
            transition={defaultTransition}
            className="text-xl sm:text-2xl text-white/50 font-light"
          >
            You cannot be perfect.
          </motion.p>
          <motion.p
            variants={blurIn}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl sm:text-2xl text-white/80 font-medium"
          >
            But you can be relentless.
          </motion.p>
        </motion.div>

        {/* Grace explanation */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...defaultTransition, delay: 1.0 }}
          className="text-sm text-white/20 max-w-md mx-auto leading-relaxed mt-10"
        >
          Two days of grace. Because life happens. Miss a day,
          forgive yourself, and show up tomorrow.
        </motion.p>
      </div>
    </section>
  );
}
