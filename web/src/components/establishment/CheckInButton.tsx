"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, LogOut, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  establishmentName: string;
}

export function CheckInButton({ establishmentName }: CheckInButtonProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggle() {
    setBusy(true);
    setTimeout(() => {
      setCheckedIn((v) => !v);
      setBusy(false);
    }, 450);
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      onClick={toggle}
      disabled={busy}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl px-5 py-4 text-base font-bold tracking-wide transition-all",
        checkedIn
          ? "bg-surface text-text border border-border hover:border-brand/40"
          : "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
      )}
    >
      <AnimatePresence mode="wait">
        {checkedIn ? (
          <motion.div
            key="out"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="grid size-7 place-items-center rounded-full bg-success/15 text-success">
              <Check className="size-4" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm">Você está aqui</span>
              <span className="text-[0.7rem] font-medium text-muted">
                Toque para sair de {establishmentName}
              </span>
            </div>
            <LogOut className="ml-auto size-4 text-muted" />
          </motion.div>
        ) : (
          <motion.div
            key="in"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <MapPin className="size-5" />
            <span className="text-base font-extrabold uppercase tracking-wide">Fazer check-in</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!checkedIn && (
        <motion.span
          aria-hidden
          initial={false}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}
    </motion.button>
  );
}
