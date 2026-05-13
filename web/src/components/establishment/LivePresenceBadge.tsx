"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { useEstabPresence } from "@/lib/hooks/useEstabPresence";

interface Props {
  estabId: string;
  userId: string | null;
  /** Fallback inicial (server-side) caso presence ainda não tenha sincronizado */
  initialCount: number;
}

export function LivePresenceBadge({ estabId, userId, initialCount }: Props) {
  const { online, recentJoin } = useEstabPresence(estabId, userId);
  const count = Math.max(online, initialCount);

  return (
    <div className="flex items-center gap-2 rounded-pill bg-success/15 px-3 py-1.5 text-xs font-bold text-success">
      <span className="size-1.5 rounded-full bg-success live-dot" />
      <Users className="size-3.5" />
      <span>{count} aqui agora</span>
      <AnimatePresence>
        {recentJoin && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7, x: -5 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="rounded-pill bg-success px-1.5 py-0.5 text-[0.55rem] font-bold text-white"
          >
            +1
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
