"use client";

import { motion } from "framer-motion";
import { clipReveal, defaultTransition } from "@/lib/animations";

const lines = [
  { text: "You\u2019ve tried journaling before.", className: "text-white/40" },
  { text: "You bought the notebook.", className: "text-white/40" },
  { text: "You wrote for three days.", className: "text-white/40" },
  { text: "Then you stopped.", className: "text-white/60 !text-2xl sm:!text-3xl md:!text-4xl" },
];

export function ProblemSection() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center space-y-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.25, delayChildren: 0.15 } },
        }}
      >
        {lines.map((line, i) => (
          <motion.p
            key={i}
            variants={clipReveal}
            transition={{ ...defaultTransition, duration: 1.0 }}
            className={`text-xl sm:text-2xl md:text-3xl font-light ${line.className}`}
          >
            {line.text}
          </motion.p>
        ))}

        {/* Dramatic pause spacer */}
        <motion.div variants={clipReveal} transition={defaultTransition} className="h-8" />

        <motion.p
          variants={clipReveal}
          transition={{ ...defaultTransition, delay: 0.2 }}
          className="text-xs text-white/25 uppercase tracking-[0.3em]"
        >
          Because nobody told you the truth:
        </motion.p>

        <motion.p
          variants={{
            hidden: { opacity: 0, scale: 0.96, y: 20, filter: "blur(4px)" },
            visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 pt-2"
        >
          You were writing too much.
        </motion.p>
      </motion.div>
    </section>
  );
}
