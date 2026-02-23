"use client";

import { motion } from "framer-motion";

interface GlowOrbProps {
  className?: string;
  color?: string;
  size?: number;
  delay?: number;
}

export function GlowOrb({
  className = "",
  color = "255, 255, 255",
  size = 400,
  delay = 0,
}: GlowOrbProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 2, delay }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, rgba(${color}, 0.06) 0%, rgba(${color}, 0.02) 40%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      />
    </motion.div>
  );
}
