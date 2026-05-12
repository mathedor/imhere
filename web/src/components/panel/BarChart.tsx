"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({
  data,
  height = 200,
  color = "#ef2c39",
  formatValue = (v) => String(v),
}: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex items-end justify-between gap-1.5" style={{ height }}>
        {data.map((p, i) => {
          const h = (p.value / max) * (height - 30);
          const isHover = hover === i;
          return (
            <div
              key={p.label + i}
              className="group relative flex flex-1 cursor-pointer flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {isHover && (
                <div
                  className="absolute z-10 flex flex-col items-center gap-0.5 rounded-lg bg-bg px-2 py-1 text-[0.65rem] font-bold text-text shadow-lg ring-1 ring-border"
                  style={{ bottom: h + 8 }}
                >
                  <span style={{ color }}>{formatValue(p.value)}</span>
                  <span className="text-muted">{p.label}</span>
                </div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.03, duration: 0.5, ease: [0.2, 0, 0.2, 1] }}
                className="w-full rounded-t-md transition-opacity"
                style={{
                  background: isHover
                    ? `linear-gradient(180deg, ${color}, ${color}aa)`
                    : `linear-gradient(180deg, ${color}cc, ${color}55)`,
                  minHeight: 4,
                  opacity: hover === null || isHover ? 1 : 0.4,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[0.6rem] text-muted">
        {data.map((p, i) =>
          i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? (
            <span key={p.label + i}>{p.label}</span>
          ) : (
            <span key={p.label + i} />
          )
        )}
      </div>
    </div>
  );
}
