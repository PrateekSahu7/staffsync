import { useEffect, useRef, useState } from 'react';

// Counts a number up to its target once, so the dashboard numbers settle in.
// Text values are returned as they are, and reduced-motion users get the number at once.
export default function useCountUp(target, ms = 700) {
  const [val, setVal] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (typeof target !== 'number') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target);
      from.current = target;
      return undefined;
    }
    const begin = from.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      const v = Math.round(begin + (target - begin) * (1 - Math.pow(1 - p, 3)));
      setVal(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return typeof target === 'number' ? val : target;
}
