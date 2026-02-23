"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, duration: number, trigger: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [trigger, target, duration]);

  return count;
}
