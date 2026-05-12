"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Coins, Lock, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Custo da feature em créditos */
  cost: number;
  /** Saldo atual do user */
  balance: number;
  /** Label da feature ("Enviar foto no chat") */
  featureLabel: string;
  /** Confirmação — chamado se o user aceita gastar */
  onConfirm: () => Promise<void> | void;
}

export function CreditConfirmDialog({ open, onClose, cost, balance, featureLabel, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);
  const insufficient = balance < cost;

  async function handleConfirm() {
    if (insufficient) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
          >
            <header className="flex items-center justify-end p-3">
              <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
                <X className="size-4" />
              </button>
            </header>

            <div className="flex flex-col items-center gap-3 px-6 pb-6 text-center">
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
                className={`grid size-16 place-items-center rounded-3xl ${
                  insufficient
                    ? "bg-gradient-to-br from-warn to-brand"
                    : "bg-gradient-to-br from-warn via-brand to-brand-strong"
                } shadow-glow`}
              >
                {insufficient ? <Lock className="size-7 text-white" /> : <Coins className="size-7 text-white" />}
              </motion.div>

              <h3 className="text-xl font-black tracking-tight text-text">
                {insufficient ? "Créditos insuficientes" : `Usar ${cost} créditos?`}
              </h3>

              <p className="text-sm leading-relaxed text-text-soft">
                {insufficient ? (
                  <>
                    Você tem <strong className="text-text">{balance}</strong> créditos. Pra usar{" "}
                    <strong className="text-text">{featureLabel}</strong> precisa de{" "}
                    <strong className="text-brand">{cost}</strong>.
                  </>
                ) : (
                  <>
                    Pra usar <strong className="text-text">{featureLabel}</strong>, você vai gastar{" "}
                    <strong className="text-brand">{cost}</strong> créditos.
                  </>
                )}
              </p>

              {!insufficient && (
                <div className="my-2 flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-2.5 text-xs">
                  <Coins className="size-4 text-warn" />
                  <div className="text-left leading-tight">
                    <p className="font-bold text-text">Saldo após: {balance - cost}</p>
                    <p className="text-[0.65rem] text-text-soft">Atual: {balance} créditos</p>
                  </div>
                </div>
              )}

              {insufficient ? (
                <Link
                  href="/app/creditos"
                  onClick={onClose}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
                >
                  <Sparkles className="mr-1 inline size-4" />
                  Comprar mais créditos
                </Link>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
                >
                  {loading ? "..." : "Continuar"}
                </motion.button>
              )}

              <button
                onClick={onClose}
                className="text-xs font-bold text-text-soft hover:text-text"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Alerta de saldo baixo (<50 créditos) com botão comprar */
export function LowCreditBanner({ balance, threshold = 50 }: { balance: number; threshold?: number }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Persiste dismiss por sessão (sessionStorage)
    const stored = sessionStorage.getItem("imhere-low-credit-dismissed");
    if (stored === "1") setDismissed(true);
  }, []);

  if (balance >= threshold || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem("imhere-low-credit-dismissed", "1");
    setDismissed(true);
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-warn text-white shadow"
      >
        <AlertTriangle className="size-4" />
      </motion.div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-xs font-bold text-text">Saldo baixo</p>
        <p className="text-[0.7rem] text-text-soft">
          Você tem só {balance} créditos. Compre mais pra liberar foto/áudio no chat.
        </p>
      </div>
      <Link
        href="/app/creditos"
        className="shrink-0 rounded-pill bg-gradient-to-r from-warn to-brand px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-glow"
      >
        Comprar
      </Link>
      <button
        onClick={dismiss}
        className="shrink-0 grid size-7 place-items-center rounded-lg text-warn hover:bg-warn/15"
        aria-label="Dispensar"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}
