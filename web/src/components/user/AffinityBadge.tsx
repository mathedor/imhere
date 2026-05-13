"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getAffinityWithUserAction } from "@/lib/actions/quiz";

export function AffinityBadge({ otherProfileId }: { otherProfileId: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAffinityWithUserAction(otherProfileId)
      .then((s) => {
        if (!cancelled) {
          setScore(s);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [otherProfileId]);

  if (!loaded || score === null) return null;

  const color = score >= 80 ? "#ef2c39" : score >= 50 ? "#a855f7" : "#6b6b75";
  const label = score >= 80 ? "Alta afinidade" : score >= 50 ? "Boa afinidade" : "Afinidade baixa";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 rounded-2xl border p-3"
      style={{ borderColor: `${color}40`, background: `${color}10` }}
    >
      <div
        className="grid size-10 shrink-0 place-items-center rounded-xl"
        style={{ background: `${color}25`, color }}
      >
        <Sparkles className="size-5" />
      </div>
      <div className="flex-1 leading-tight">
        <p className="text-sm font-bold text-text">{label}</p>
        <p className="text-[0.7rem] text-text-soft">Calculado pelo quiz de afinidade</p>
      </div>
      <p className="text-2xl font-black" style={{ color }}>
        {score}%
      </p>
    </motion.div>
  );
}
