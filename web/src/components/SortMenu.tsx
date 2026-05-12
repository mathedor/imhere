"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Flame, MapPin, SlidersHorizontal, Star, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const current = options.find((o) => o.key === value) ?? options[0];

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-pill border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:border-brand/40"
      >
        <SlidersHorizontal className="size-4 text-brand" />
        <span>Ordenar</span>
        <ChevronDown className="size-4 text-muted" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 360, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-soft"
            >
              <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
                    <SlidersHorizontal className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text">Ordenar por</h3>
                    <p className="text-[0.65rem] text-text-soft">Como quer ver a lista?</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
                >
                  <X className="size-4" />
                </button>
              </header>

              <ul className="flex flex-col gap-2">
                {options.map((o) => {
                  const Icon = o.icon;
                  const active = o.key === value;
                  return (
                    <li key={o.key}>
                      <button
                        onClick={() => {
                          onChange(o.key);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                          active
                            ? "border-brand bg-brand/10 shadow-glow"
                            : "border-border bg-surface-2 hover:border-brand/40"
                        )}
                      >
                        <div
                          className={cn(
                            "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
                            active ? "bg-brand text-white" : "bg-surface text-brand"
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-text">{o.label}</p>
                          <p className="text-xs text-text-soft">{o.desc}</p>
                        </div>
                        {active && <Check className="size-5 shrink-0 text-brand" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-3 text-center text-[0.65rem] text-muted">
                Atual: <span className="font-bold text-text">{current.label}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function NearbyButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={cn(
        "group relative flex h-11 shrink-0 items-center gap-1.5 overflow-hidden rounded-pill px-3 text-sm font-semibold transition-all",
        active
          ? "bg-brand text-white shadow-glow"
          : "border border-border bg-surface text-text hover:border-brand/40"
      )}
    >
      <Users className="size-4" />
      <span className="hidden sm:inline">Perto de mim</span>
      <span className="sm:hidden">Perto</span>
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
