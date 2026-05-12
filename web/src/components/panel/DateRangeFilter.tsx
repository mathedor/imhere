"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const RANGES = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "year", label: "Ano" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

export function DateRangeFilter({
  value,
  onChange,
}: {
  value?: RangeKey;
  onChange?: (v: RangeKey) => void;
}) {
  const [internal, setInternal] = useState<RangeKey>(value ?? "30d");
  const current = value ?? internal;

  function pick(k: RangeKey) {
    setInternal(k);
    onChange?.(k);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
      <span className="hidden md:inline-flex items-center gap-1.5 pl-2.5 pr-1 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
        <Calendar className="size-3.5" />
        Período
      </span>
      {RANGES.map((r) => {
        const active = current === r.key;
        return (
          <button
            key={r.key}
            onClick={() => pick(r.key)}
            className={cn(
              "relative rounded-pill px-3 py-1.5 text-xs font-bold transition-colors",
              active ? "text-white" : "text-text-soft hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId="dateRangePill"
                className="absolute inset-0 -z-10 rounded-pill bg-gradient-to-r from-brand-strong to-brand"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
