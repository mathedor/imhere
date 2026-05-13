"use client";

import { motion } from "framer-motion";
import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Verifica se já instalou ou dispensou recentemente
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("imhere-pwa-dismissed");
    if (dismissed) {
      const dismissedAt = Number(dismissed);
      if (Date.now() - dismissedAt < 7 * 86400_000) return; // 7 dias
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // Mostra após 30s pro user explorar o app primeiro
      setTimeout(() => setOpen(true), 30_000);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setOpen(false);
    }
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem("imhere-pwa-dismissed", String(Date.now()));
    setOpen(false);
  }

  if (!open || !deferred) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-24 left-3 right-3 z-40 mx-auto max-w-md md:bottom-4"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-strong/20 via-brand/10 to-brand-soft/20 p-4 backdrop-blur-md shadow-glow">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-strong to-brand text-white">
          <Smartphone className="size-6" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-black text-text">Instale o app</p>
          <p className="text-[0.7rem] text-text-soft">
            Tela inicial · notificações · acesso rápido
          </p>
        </div>
        <button
          onClick={install}
          className="shrink-0 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-2 text-xs font-bold text-white shadow-glow"
        >
          <Download className="mr-1 inline size-3" />
          Instalar
        </button>
        <button
          onClick={dismiss}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
