"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Logo3hreeProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "ink" | "paper";
}

const heightMap = { sm: 40, md: 60, lg: 80, xl: 120 };

export function Logo3hree({ className, size = "lg", variant = "ink" }: Logo3hreeProps) {
  const src = variant === "paper" ? "/wordmark/wordmark-paper.svg" : "/wordmark/wordmark-ink.svg";
  const h = heightMap[size];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <Image src={src} alt="Three Sentences" height={h} width={h * 4} style={{ height: h, width: "auto" }} priority />
    </motion.div>
  );
}
