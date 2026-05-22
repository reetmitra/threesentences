"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

interface FinalCTASectionProps {
  onCTAClick: () => void;
}

export function FinalCTASection({ onCTAClick }: FinalCTASectionProps) {
  return (
    <section className="py-32 px-6 text-center">
      {/* Floating mark — three ivory dots with staggered infinite y animation */}
      <div className="flex justify-center gap-3 mb-8">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, delay }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#FFFFF0" }}
          />
        ))}
      </div>

      {/* Blur-in headline */}
      <motion.h2
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-2xl mx-auto leading-tight"
      >
        Start with
        <br />
        today.
      </motion.h2>

      {/* Supporting copy */}
      <Reveal delay={0.2}>
        <p className="text-sm sm:text-base text-white/30 font-light max-w-md mx-auto mb-10">
          Three sentences. Every day. That&apos;s all it takes to change your life.
        </p>
      </Reveal>

      {/* CTA button */}
      <Reveal delay={0.35}>
        <button
          onClick={onCTAClick}
          className="bg-[#FFFFF0] text-black font-mono text-xs tracking-[2px] uppercase px-10 py-4 rounded-full hover:-translate-y-px transition-transform duration-200"
        >
          Request access →
        </button>
      </Reveal>

      {/* Bottom trust strip */}
      <Reveal delay={0.45}>
        <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2.4, color: '#75726a', marginTop: 32 }}>
          Invite only · iOS · Q4 2026 · No spam, ever
        </p>
      </Reveal>
    </section>
  );
}
