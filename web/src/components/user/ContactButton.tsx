"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, MessageCircle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type State = "idle" | "pending" | "accepted" | "rejected";

interface Props {
  userName: string;
  hasPlan?: boolean;
  sharedCheckin?: boolean;
}

export function ContactButton({ userName, hasPlan = false, sharedCheckin = true }: Props) {
  const [state, setState] = useState<State>("idle");

  if (!hasPlan) {
    return (
      <Link
        href="/app/planos"
        className="group relative block w-full overflow-hidden rounded-2xl border border-brand/30 bg-brand/10 px-5 py-4 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-brand text-white">
            <Lock className="size-4" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-bold text-text">Iniciar contato é Premium</span>
            <span className="text-[0.7rem] text-text-soft">Assine para falar com {userName}</span>
          </div>
          <Sparkles className="ml-auto size-5 text-brand" />
        </div>
      </Link>
    );
  }

  if (!sharedCheckin) {
    return (
      <div className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-center">
        <p className="text-sm font-semibold text-text">Você precisa estar no mesmo lugar</p>
        <p className="mt-0.5 text-xs text-text-soft">
          Faça check-in no estabelecimento de {userName} para iniciar conversa.
        </p>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={state === "idle" ? { scale: 0.97 } : undefined}
      whileHover={state === "idle" ? { y: -2 } : undefined}
      disabled={state !== "idle"}
      onClick={() => {
        setState("pending");
        setTimeout(() => {
          const outcome = Math.random() > 0.3 ? "accepted" : "rejected";
          setState(outcome);
        }, 2200);
      }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl px-5 py-4 text-base font-bold transition-all",
        state === "idle" && "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow",
        state === "pending" && "bg-surface border border-border text-text",
        state === "accepted" && "bg-success/15 border border-success/40 text-success",
        state === "rejected" && "bg-surface border border-border text-muted"
      )}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="size-5" />
            <span className="text-base font-extrabold uppercase tracking-wide">Iniciar contato</span>
          </motion.div>
        )}
        {state === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="size-4 rounded-full border-2 border-brand border-t-transparent"
            />
            <span>Aguardando {userName.split(" ")[0]} aceitar...</span>
          </motion.div>
        )}
        {state === "accepted" && (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <Check className="size-5" />
            <span>Contato aceito! Conversa aberta no chat.</span>
          </motion.div>
        )}
        {state === "rejected" && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <X className="size-5" />
            <span>{userName.split(" ")[0]} recusou o contato.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {state === "idle" && (
        <motion.span
          aria-hidden
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}
    </motion.button>
  );
}
