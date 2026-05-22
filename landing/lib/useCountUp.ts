import { useEffect, useState } from 'react';

export function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let n = 0;
    let rafId: number;
    const step = () => {
      n = Math.min(n + 3, target);
      setCount(n);
      if (n < target) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [active, target]);

  return count;
}
