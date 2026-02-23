"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";
import { fadeUp, defaultTransition } from "@/lib/animations";

export function ConstraintSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center px-6 py-32 sm:py-40"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Decorative line */}
        <motion.div
          className="w-16 h-px bg-white/10 mx-auto mb-12"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Main statement */}
        <TextScramble
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white"
          duration={1.2}
          speed={0.03}
          trigger={isInView}
          characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        >
          Three sentences.
        </TextScramble>

        {/* Sub-statement */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...defaultTransition, delay: 0.6 }}
          className="text-xl sm:text-2xl text-white/30 font-light mt-4"
        >
          No more. No less.
        </motion.p>

        {/* Philosophy */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...defaultTransition, delay: 1.0 }}
          className="text-sm text-white/20 max-w-sm mx-auto leading-relaxed mt-12"
        >
          Constraint breeds creativity. When you can only say three things,
          you say the right things.
        </motion.p>
      </div>
    </section>
  );
}
