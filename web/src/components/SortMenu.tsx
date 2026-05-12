"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Flame, MapPin, SlidersHorizontal, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SortKey = "nearest" | "busiest" | "rated";

const options: { key: SortKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "nearest", label: "Mais próximos", icon: MapPin, desc: "Distância da sua localização" },
  { key: "busiest", label: "Mais movimentados", icon: Flame, desc: "Maior número de check-ins agora" },
  { key: "rated", label: "Melhor avaliados", icon: Star, desc: "Nota média da comunidade" },
];

interface SortMenuProps {
  value: SortKey;
  onChange: (v: SortKey) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.key === value) ?? options[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-pill border border-border bg-surface px-4 text-sm font-medium text-text transition-colors hover:border-brand/40"
      >
        <SlidersHorizontal className="size-4 text-brand" />
        <span className="hidden sm:inline">Ordenar por:</span>
        <span className="font-semibold">{current.label}</span>
        <ChevronDown
          className={cn("size-4 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 overflow-hidden rounded-2xl glass-strong shadow-soft"
          >
            <ul className="p-1.5">
              {options.map((o, idx) => {
                const Icon = o.icon;
                const active = o.key === value;
                return (
                  <motion.li
                    key={o.key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <button
                      onClick={() => {
                        onChange(o.key);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-brand/15" : "hover:bg-white/[0.04]"
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-9 place-items-center rounded-lg transition-colors",
                          active ? "bg-brand text-white" : "bg-surface-3 text-brand"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text">{o.label}</p>
                        <p className="truncate text-xs text-text-soft">{o.desc}</p>
                      </div>
                      {active && <Check className="size-4 shrink-0 text-brand" />}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NearbyButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={cn(
        "group relative flex h-11 items-center gap-2 overflow-hidden rounded-pill px-4 text-sm font-semibold transition-all",
        active
          ? "bg-brand text-white shadow-glow"
          : "border border-border bg-surface text-text hover:border-brand/40"
      )}
    >
      <Users className="size-4" />
      <span>Perto de mim</span>
      {active && (
        <motion.span
          layoutId="nearbyGlow"
          className="absolute inset-0 -z-10 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft"
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        />
      )}
    </motion.button>
  );
}
