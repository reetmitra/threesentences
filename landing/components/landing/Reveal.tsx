"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "h1" | "h2" | "h3" | "p" | "article" | "section" | "ul" | "span";

interface RevealProps {
  as?: Tag;
  /** Stagger position: each step waits 85ms longer. */
  i?: number;
  className?: string;
  children?: ReactNode;
}

/** Rises into place once, as it enters the screen. Content is visible if the script never runs. */
export function Reveal({ as = "div", i = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(as, { ref, className, "data-reveal": "", style: { "--i": i } as CSSProperties }, children);
}
