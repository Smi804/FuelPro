import { useCallback, useEffect, useState } from 'react';

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

// Theme toggle backed by localStorage. The initial value is set by the
// pre-paint script in index.html; this hook keeps React state in sync and
// follows OS theme changes when the user hasn't explicitly chosen.
export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  const apply = useCallback((next) => {
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* private mode */
    }
    apply(next);
  }, [apply]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      let stored = null;
      try {
        stored = localStorage.getItem('theme');
      } catch (err) {
        /* ignore */
      }
      if (!stored) apply(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [apply]);

  return { theme, toggle };
}
