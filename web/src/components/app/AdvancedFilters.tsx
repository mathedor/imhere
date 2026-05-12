"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Filter, Lock, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AdvancedFilterValues {
  gender: "all" | "male" | "female" | "other";
  minAge: number;
  maxAge: number;
  onlyOpen: boolean;
}

const DEFAULT: AdvancedFilterValues = {
  gender: "all",
  minAge: 18,
  maxAge: 65,
  onlyOpen: false,
};

interface Props {
  isPremium: boolean;
  value: AdvancedFilterValues;
  onChange: (v: AdvancedFilterValues) => void;
}

export function AdvancedFilters({ isPremium, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeCount =
    (value.gender !== "all" ? 1 : 0) +
    (value.minAge !== DEFAULT.minAge ? 1 : 0) +
    (value.maxAge !== DEFAULT.maxAge ? 1 : 0) +
    (value.onlyOpen ? 1 : 0);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 items-center gap-2 rounded-pill border px-4 text-sm font-medium transition-colors",
          activeCount > 0
            ? "border-brand bg-brand/10 text-brand"
            : "border-border bg-surface text-text hover:border-brand/40"
        )}
      >
        {isPremium ? <Filter className="size-4" /> : <Crown className="size-4 text-warn" />}
        <span className="hidden sm:inline">Filtros</span>
        {!isPremium && (
          <span className="rounded-pill bg-warn/15 px-1.5 py-0.5 text-[0.6rem] font-bold text-warn">
            VIP
          </span>
        )}
        {activeCount > 0 && (
          <span className="grid size-4 place-items-center rounded-full bg-brand text-[0.6rem] font-bold text-white">
            {activeCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+8px)] z-30 w-80 overflow-hidden rounded-2xl glass-strong p-4 shadow-soft"
          >
            <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-brand" />
                <h3 className="text-sm font-bold text-text">Filtros avançados</h3>
                {!isPremium && (
                  <span className="rounded-pill bg-warn/15 px-1.5 py-0.5 text-[0.6rem] font-bold text-warn">
                    Premium
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="grid size-7 place-items-center rounded-full text-muted hover:text-text">
                <X className="size-3.5" />
              </button>
            </header>

            {!isPremium && (
              <div className="mb-4 rounded-xl border border-warn/30 bg-warn/10 p-3 text-center">
                <Lock className="mx-auto mb-1 size-5 text-warn" />
                <p className="text-xs font-bold text-text">Recurso Premium / VIP</p>
                <p className="mt-0.5 text-[0.65rem] text-text-soft">
                  Filtre por gênero, idade e disponibilidade real
                </p>
                <Link
                  href="/app/planos"
                  className="mt-2 inline-block rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-1 text-[0.65rem] font-bold text-white shadow-glow"
                >
                  Liberar agora →
                </Link>
              </div>
            )}

            <div className={cn("flex flex-col gap-4", !isPremium && "pointer-events-none opacity-40")}>
              <div>
                <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                  Gênero
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { v: "all", l: "Todos" },
                      { v: "female", l: "♀ Mulheres" },
                      { v: "male", l: "♂ Homens" },
                      { v: "other", l: "Outros" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => isPremium && onChange({ ...value, gender: opt.v })}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors",
                        value.gender === opt.v
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-surface text-text-soft hover:text-text"
                      )}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                    Idade
                  </p>
                  <span className="text-xs font-bold text-text">
                    {value.minAge} – {value.maxAge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={value.minAge}
                    onChange={(e) => isPremium && onChange({ ...value, minAge: Number(e.target.value) })}
                    className="flex-1 accent-brand"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={value.maxAge}
                    onChange={(e) => isPremium && onChange({ ...value, maxAge: Number(e.target.value) })}
                    className="flex-1 accent-brand"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                <input
                  type="checkbox"
                  checked={value.onlyOpen}
                  onChange={(e) => isPremium && onChange({ ...value, onlyOpen: e.target.checked })}
                  className="accent-brand"
                />
                <Sparkles className="size-3.5 text-brand" />
                <span className="text-xs font-semibold text-text">Só lugares com pessoas abertas</span>
              </label>

              <button
                onClick={() => onChange(DEFAULT)}
                className="text-center text-[0.65rem] font-bold uppercase tracking-widest text-muted hover:text-text"
              >
                Limpar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
