"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: { value: number; sign: "up" | "down"; period?: string };
  color?: string;
  index?: number;
}

export function KpiCard({ icon: Icon, label, value, delta, color = "#ef2c39", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className="grid size-10 place-items-center rounded-xl"
          style={{ background: `${color}25`, color }}
        >
          <Icon className="size-5" />
        </div>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-pill px-2 py-0.5 text-[0.65rem] font-bold",
              delta.sign === "up"
                ? "bg-success/15 text-success"
                : "bg-brand/15 text-brand"
            )}
          >
            {delta.sign === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {delta.value}%
          </span>
        )}
      </div>
      <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-text">{value}</p>
      {delta?.period && <p className="mt-0.5 text-[0.65rem] text-text-soft">{delta.period}</p>}
      <span
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
    </motion.div>
  );
}
