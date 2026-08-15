"use client";

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number | null;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  durationMs = 900,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (value === null || value < 0) {
      setReady(false);
      setDisplay(0);
      return;
    }

    setReady(true);
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || value === 0) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  if (!ready || value === null) {
    return <strong className={className}>—</strong>;
  }

  return (
    <strong className={className}>
      {display.toLocaleString()}
      {suffix}
    </strong>
  );
}
