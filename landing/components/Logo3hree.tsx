"use client";

import { motion } from "framer-motion";

interface Logo3hreeProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo3hree({ className, size = "lg" }: Logo3hreeProps) {
  const sizeClasses = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
    xl: "text-[12rem]",
  };

  return (
    <motion.div
      className={`font-mono font-bold tracking-tighter ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <span className={`${sizeClasses[size]} inline-flex items-baseline`}>
        {/* The "3" digit */}
        <motion.span
          className="text-white relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          3
        </motion.span>
        {/* The "hree" extending from the slash of 3 */}
        <motion.span
          className="text-white/90 -ml-[0.05em]"
          style={{
            fontSize: "0.45em",
            verticalAlign: "middle",
            letterSpacing: "-0.02em"
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          hree
        </motion.span>
      </span>
    </motion.div>
  );
}
