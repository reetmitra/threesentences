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
  const [revealed, setReveal] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setReveal(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Already in view on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setReveal(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReveal(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);

    // 2s fallback — never leave content invisible
    const fallback = setTimeout(() => {
      setReveal(true);
      observer.disconnect();
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [reduced]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      animate={revealed || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={reduced ? { duration: 0 } : { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
