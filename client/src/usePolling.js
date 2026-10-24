import { useEffect, useRef } from 'react';

// Calls fn every `ms` milliseconds while the tab is visible, so pages stay current without a reload
export default function usePolling(fn, ms = 30000) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) saved.current();
    }, ms);
    return () => clearInterval(id);
  }, [ms]);
}
