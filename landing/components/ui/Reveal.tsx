"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;
    let fallback: ReturnType<typeof setTimeout> | null = null;

    const reveal = () => {
      setRevealed(true);
      if (observer) observer.disconnect();
      if (fallback !== null) clearTimeout(fallback);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);

    // Check immediately if already on-screen at mount
    const initialEntry = el.getBoundingClientRect();
    if (
      initialEntry.top < window.innerHeight &&
      initialEntry.bottom > 0
    ) {
      reveal();
      return;
    }

    // 2000ms fallback — never leave content permanently invisible
    fallback = setTimeout(reveal, 2000);

    return () => {
      if (observer) observer.disconnect();
      if (fallback !== null) clearTimeout(fallback);
    };
  }, []);

  if (reduced) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
