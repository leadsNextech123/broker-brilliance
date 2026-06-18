import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  format?: (n: number) => string;
}

export function CountUp({ value, duration = 1200, prefix = "", format }: Props) {
  const [n, setN] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    start.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (start.current === null) start.current = t;
      const p = Math.min(1, (t - start.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const display = format ? format(n) : n.toLocaleString("en-IN");
  return (
    <span>
      {prefix}
      {display}
    </span>
  );
}
