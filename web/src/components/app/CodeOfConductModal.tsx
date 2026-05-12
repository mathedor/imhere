"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Shield, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { acceptCodeOfConductAction } from "@/lib/actions/onboarding";

interface Props {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

const RULES = [
  {
    icon: Heart,
    color: "#ec4899",
    title: "Respeito sempre",
    desc: "Sem xingamento, racismo, machismo, homofobia. Quem viola é banido sem aviso.",
  },
  {
    icon: Shield,
    color: "#3b82f6",
    title: "Você manda no seu sim",
    desc: "Aceitar contato é opcional. Pedir é OK, insistir não. 'Não' encerra a conversa.",
  },
  {
    icon: ShieldCheck,
    color: "#22c55e",
    title: "Privacidade primeiro",
    desc: "Não compartilhe nudes sem consentimento. Não publique conversa de outro user em lugar público.",
  },
];

export function CodeOfConductModal({ open, onAccept, onClose }: Props) {
  const [accepting, setAccepting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    await acceptCodeOfConductAction();
    setAccepting(false);
    onAccept();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-md md:items-center"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface"
          >
            <header className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text">Código de conduta</h3>
                  <p className="text-[0.65rem] text-text-soft">Antes do seu primeiro check-in</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={accepting}
                className="grid size-9 place-items-center rounded-full text-muted hover:text-text"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex flex-col gap-3 p-4">
              <p className="text-sm text-text-soft">
                I&apos;m Here é um lugar pra conhecer gente nova em segurança. Pra usar, você concorda:
              </p>

              <ul className="flex flex-col gap-2">
                {RULES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <li
                      key={r.title}
                      className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-3"
                    >
                      <div
                        className="grid size-9 shrink-0 place-items-center rounded-xl"
                        style={{ background: `${r.color}25`, color: r.color }}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-sm font-bold text-text">{r.title}</p>
                        <p className="mt-0.5 text-[0.7rem] text-text-soft">{r.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 size-4 accent-brand"
                />
                <span className="text-xs leading-tight text-text">
                  Li, entendi e concordo. Sei que violações resultam em banimento.
                </span>
              </label>

              <button
                onClick={handleAccept}
                disabled={!agreed || accepting}
                className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all ${
                  agreed && !accepting
                    ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {accepting ? "Confirmando..." : "Aceito e quero fazer check-in"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
