import { useEffect, useRef, useState } from "react";

export function useCountUp(
  target: number,
  options?: { step?: number; threshold?: number }
): { count: number; ref: React.RefObject<HTMLDivElement> } {
  const step = options?.step ?? 3;
  const threshold = options?.threshold ?? 0.2;

  const ref = useRef<HTMLDivElement>(null!);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion preference
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setCount(target);
      return;
    }

    let rafId: number;
    let started = false;

    const startAnimation = () => {
      if (started) return;
      started = true;

      let current = 0;

      function tick() {
        current = Math.min(current + step, target);
        setCount(current);
        if (current < target) {
          rafId = requestAnimationFrame(tick);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, step, threshold]);

  return { count, ref };
}
