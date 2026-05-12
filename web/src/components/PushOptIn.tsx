"use client";

import { motion } from "framer-motion";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { usePushSubscription } from "@/lib/hooks/usePushSubscription";

export function PushOptIn() {
  const { supported, permission, subscribed, loading, subscribe, unsubscribe } = usePushSubscription();

  if (!supported) return null;

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3">
        <BellOff className="size-4 shrink-0 text-warn" />
        <p className="text-xs text-warn">
          Notificações bloqueadas no navegador. Libere nas configurações do site.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
        {subscribed ? <Bell className="size-5" /> : <BellOff className="size-5" />}
      </div>
      <div className="flex-1 leading-tight">
        <p className="text-sm font-bold text-text">
          {subscribed ? "Notificações ativadas ✓" : "Ative as notificações"}
        </p>
        <p className="text-[0.7rem] text-text-soft">
          {subscribed
            ? "Você recebe alertas em tempo real (check-ins, mensagens, cortesias)"
            : "Receba alertas em tempo real, mesmo com o app fechado"}
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => (subscribed ? unsubscribe() : subscribe())}
        disabled={loading}
        className={
          subscribed
            ? "rounded-pill border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-text hover:border-brand/40"
            : "rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 py-2 text-xs font-bold text-white shadow-glow"
        }
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : subscribed ? "Desativar" : "Ativar"}
      </motion.button>
    </div>
  );
}
