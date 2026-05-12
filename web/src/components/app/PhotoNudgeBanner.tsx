"use client";

import { motion } from "framer-motion";
import { Camera, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function PhotoNudgeBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("imhere-photo-nudge-dismissed");
    if (stored === "1") setDismissed(true);
  }, []);

  if (dismissed) return null;

  function dismiss() {
    sessionStorage.setItem("imhere-photo-nudge-dismissed", "1");
    setDismissed(true);
  }

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-warn/30 bg-gradient-to-r from-warn/10 via-brand/5 to-warn/10 px-4 py-3"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-warn to-brand text-white shadow-glow"
      >
        <Camera className="size-5" />
      </motion.div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="flex items-center gap-1.5 text-sm font-bold text-text">
          Adicione sua foto
          <Sparkles className="size-3 text-warn" />
        </p>
        <p className="text-[0.7rem] text-text-soft">
          Quem tem foto recebe <strong className="text-brand">4x mais</strong> aceite de contato.
        </p>
      </div>
      <Link
        href="/app/perfil"
        className="shrink-0 rounded-pill bg-gradient-to-r from-warn to-brand px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-white shadow-glow"
      >
        Adicionar
      </Link>
      <button
        onClick={dismiss}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-text-soft hover:bg-surface-2 hover:text-text"
        aria-label="Dispensar"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}
