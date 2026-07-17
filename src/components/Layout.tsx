import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    let observer: ResizeObserver | null = null;
    let rafId: number;

    const measure = () => {
      const header = document.querySelector('header');
      if (header) {
        const h = header.getBoundingClientRect().height;
        if (h > 0) setHeaderHeight(h);
      }
    };

    rafId = requestAnimationFrame(measure);

    const header = document.querySelector('header');
    if (header) {
      observer = new ResizeObserver(measure);
      observer.observe(header);
    }

    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      className="bg-dark text-white min-h-screen relative font-sans select-none selection:bg-gold-500 selection:text-dark"
      style={{ '--header-height': `${headerHeight}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
