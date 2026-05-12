"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export type RangeKey = "today" | "7d" | "30d" | "90d" | "year";

const RANGES: ReadonlyArray<{ key: RangeKey; label: string }> = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "year", label: "Ano" },
];

export function parseRange(value: string | null | undefined): RangeKey {
  if (value === "today" || value === "7d" || value === "90d" || value === "year") return value;
  return "30d";
}

export function rangeToDays(r: RangeKey): number {
  switch (r) {
    case "today":
      return 1;
    case "7d":
      return 7;
    case "90d":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}

interface Props {
  /** Range atual lido do server (de searchParams) */
  current: RangeKey;
  /** Nome do parâmetro de URL — default "range". Use outro nome quando houver múltiplos filtros na mesma página. */
  paramName?: string;
}

export function DateRangeUrlFilter({ current, paramName = "range" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function pick(k: RangeKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (k === "30d") params.delete(paramName);
    else params.set(paramName, k);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-pill border border-border bg-surface p-1", pending && "opacity-70")}>
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
            disabled={pending}
            className={cn(
              "relative rounded-pill px-3 py-1.5 text-xs font-bold transition-colors",
              active ? "text-white" : "text-text-soft hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={`dateRangePill-${paramName}`}
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
