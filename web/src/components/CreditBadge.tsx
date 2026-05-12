"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import Link from "next/link";

interface Props {
  balance: number;
  compact?: boolean;
}

export function CreditBadge({ balance, compact = false }: Props) {
  return (
    <Link href="/app/creditos">
      <motion.div
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -2, scale: 1.04 }}
        transition={{ type: "spring", stiffness: 420, damping: 14 }}
        className={
          compact
            ? "relative flex h-9 items-center gap-1.5 rounded-pill border border-border bg-surface px-2.5 text-xs font-bold text-text hover:border-warn/40"
            : "relative flex h-11 items-center gap-2 rounded-pill border border-border bg-surface px-3 text-sm font-bold text-text hover:border-warn/40"
        }
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 4 }}
          className={
            compact
              ? "grid size-5 place-items-center rounded-full bg-gradient-to-br from-warn to-brand text-white"
              : "grid size-7 place-items-center rounded-full bg-gradient-to-br from-warn to-brand text-white shadow-glow"
          }
        >
          <Coins className={compact ? "size-3" : "size-4"} />
        </motion.div>
        <span className={compact ? "text-xs" : "text-sm"}>
          {balance.toLocaleString("pt-BR")}
        </span>
        <span className={compact ? "hidden text-[0.65rem] text-muted" : "text-[0.65rem] uppercase tracking-wider text-muted"}>
          créditos
        </span>
      </motion.div>
    </Link>
  );
}
