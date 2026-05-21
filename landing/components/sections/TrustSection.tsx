"use client";

import { motion } from "framer-motion";
import { Lock, EyeOff, Download } from "lucide-react";
import { springScale, springTransition } from "@/lib/animations";
import { Reveal } from "@/components/ui/Reveal";

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
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
        {badges.map((badge, i) => (
          <Reveal key={badge.title} delay={i * 0.12}>
            <motion.div
              variants={springScale}
              transition={springTransition}
              className="text-center"
            >
              <badge.icon className="w-5 h-5 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-white/50">{badge.title}</p>
              <p className="text-xs text-white/20 mt-1">{badge.description}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
