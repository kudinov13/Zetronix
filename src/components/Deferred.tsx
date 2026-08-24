import { useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredProps {
  children: ReactNode;
  fallbackHeight?: number;
}

export function Deferred({ children, fallbackHeight = 1 }: DeferredProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (show) return <>{children}</>;

  return <div ref={ref} style={{ minHeight: fallbackHeight }} />;
}
