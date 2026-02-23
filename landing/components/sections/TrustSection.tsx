"use client";

import { motion } from "framer-motion";
import { Lock, EyeOff, Download } from "lucide-react";
import { springScale, springTransition } from "@/lib/animations";

const badges = [
  {
    icon: Lock,
    title: "Encrypted at rest",
    description: "Your words are yours",
  },
  {
    icon: EyeOff,
    title: "No ads. Ever.",
    description: "We don\u2019t sell data",
  },
  {
    icon: Download,
    title: "Export anytime",
    description: "Your data, your way",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 sm:py-24 px-6">
      <motion.div
        className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
          },
        }}
      >
        {badges.map((badge) => (
          <motion.div
            key={badge.title}
            variants={springScale}
            transition={springTransition}
            className="text-center"
          >
            <badge.icon className="w-5 h-5 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-white/50">{badge.title}</p>
            <p className="text-xs text-white/20 mt-1">{badge.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
