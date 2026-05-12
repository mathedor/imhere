"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Filter, Lock, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditConfirmDialog } from "@/components/CreditConfirmDialog";
import { spendCreditsAction } from "@/lib/actions/credits";
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

const FILTERS_COST = 20;
const FILTERS_UNLOCK_HOURS = 24;
const STORAGE_KEY = "imhere-filters-unlocked-until";

interface Props {
  isPremium: boolean;
  value: AdvancedFilterValues;
  onChange: (v: AdvancedFilterValues) => void;
  /** Saldo atual em créditos — usado pra pay-as-you-go */
  balance?: number;
}

export function AdvancedFilters({ isPremium, value, onChange, balance = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [creditUnlockedUntil, setCreditUnlockedUntil] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const ts = Number(stored);
      if (Number.isFinite(ts) && ts > Date.now()) setCreditUnlockedUntil(ts);
    }
  }, []);

  // Bloqueia scroll quando o modal está aberto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const creditUnlocked = creditUnlockedUntil !== null && creditUnlockedUntil > Date.now();
  const unlocked = isPremium || creditUnlocked;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleCreditUnlock() {
    const result = await spendCreditsAction("discovery:advanced_filters");
    if (result.success) {
      const until = Date.now() + FILTERS_UNLOCK_HOURS * 3600 * 1000;
      localStorage.setItem(STORAGE_KEY, String(until));
      setCreditUnlockedUntil(until);
      setCurrentBalance(result.newBalance);
    } else {
      alert(result.message);
    }
  }

  function hoursLeft() {
    if (!creditUnlockedUntil) return 0;
    return Math.max(0, Math.ceil((creditUnlockedUntil - Date.now()) / 3600_000));
  }

  const activeCount =
    (value.gender !== "all" ? 1 : 0) +
    (value.minAge !== DEFAULT.minAge ? 1 : 0) +
    (value.maxAge !== DEFAULT.maxAge ? 1 : 0) +
    (value.onlyOpen ? 1 : 0);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 shrink-0 items-center gap-1.5 rounded-pill border px-3 text-sm font-medium transition-colors",
          activeCount > 0
            ? "border-brand bg-brand/10 text-brand"
            : "border-border bg-surface text-text hover:border-brand/40"
        )}
      >
        {unlocked ? <Filter className="size-4" /> : <Crown className="size-4 text-warn" />}
        <span>Filtros</span>
        {!isPremium && creditUnlocked && (
          <span className="rounded-pill bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-bold text-success">
            {hoursLeft()}h
          </span>
        )}
        {!unlocked && (
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
                <div className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  unlocked ? "bg-brand/15 text-brand" : "bg-warn/15 text-warn"
                )}>
                  {unlocked ? <Filter className="size-4" /> : <Crown className="size-4" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-text">Filtros avançados</h3>
                  <p className="text-[0.65rem] text-text-soft">
                    {unlocked ? "Refine quem você quer encontrar" : "Recurso premium · disponível por créditos ou VIP"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
                <X className="size-4" />
              </button>
            </header>

            {!unlocked ? (
              <div className="flex flex-col gap-4 py-2">
                <div className="rounded-2xl border border-warn/30 bg-warn/10 p-5 text-center">
                  <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-warn to-brand text-white shadow-glow">
                    <Lock className="size-6" />
                  </div>
                  <p className="text-base font-black text-text">Filtre quem você quer encontrar</p>
                  <p className="mt-1 text-xs text-text-soft">
                    Filtrar por gênero, faixa de idade e ver só lugares com pessoas abertas a conversa é
                    um recurso pago.
                  </p>
                  <ul className="mt-4 flex flex-col gap-2 text-left text-xs text-text-soft">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" />
                      Filtre por gênero (homem, mulher, outros)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" />
                      Defina faixa de idade (18 a 80)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" />
                      Veja só lugares com gente disponível
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-warn via-brand to-brand-strong px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
                >
                  <Sparkles className="size-4" />
                  Liberar 24h por {FILTERS_COST} 🪙
                </button>

                <Link
                  href="/app/planos"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm font-bold text-warn hover:bg-warn/10"
                >
                  <Crown className="size-4" />
                  ou assine o plano VIP →
                </Link>
              </div>
            ) : (
            <div className="flex flex-col gap-4">
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
                      onClick={() => unlocked && onChange({ ...value, gender: opt.v })}
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
                    onChange={(e) => unlocked && onChange({ ...value, minAge: Number(e.target.value) })}
                    className="flex-1 accent-brand"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={value.maxAge}
                    onChange={(e) => unlocked && onChange({ ...value, maxAge: Number(e.target.value) })}
                    className="flex-1 accent-brand"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                <input
                  type="checkbox"
                  checked={value.onlyOpen}
                  onChange={(e) => unlocked && onChange({ ...value, onlyOpen: e.target.checked })}
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

              <div className="mt-3 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-pill border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-text-soft hover:text-text"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-xs font-bold text-white shadow-glow"
                >
                  Aplicar
                </button>
              </div>
            </div>
            )}
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        cost={FILTERS_COST}
        balance={currentBalance}
        featureLabel={`Filtros avançados (${FILTERS_UNLOCK_HOURS}h)`}
        onConfirm={handleCreditUnlock}
      />
    </>
  );
}
