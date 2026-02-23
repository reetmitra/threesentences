"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { blurIn, scaleIn, defaultTransition } from "@/lib/animations";

interface FinalCTASectionProps {
  onCTAClick: () => void;
}

export function FinalCTASection({ onCTAClick }: FinalCTASectionProps) {
  return (
    <section className="min-h-[50vh] flex items-center justify-center px-6 relative">
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.h2
          variants={blurIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white"
        >
          Start today.
        </motion.h2>

        <motion.p
          variants={blurIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...defaultTransition, delay: 0.3 }}
          className="text-sm sm:text-base text-white/30 font-light max-w-md mx-auto mt-4"
        >
          Three sentences. That&apos;s all it takes to change your life.
        </motion.p>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ ...defaultTransition, delay: 0.5 }}
          className="mt-10"
        >
          <Button
            size="lg"
            onClick={onCTAClick}
            className="text-base px-10 py-7 h-auto"
          >
            Get early access
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
