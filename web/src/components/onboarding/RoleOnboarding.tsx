"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { ONBOARDING_CONFIG, type OnboardingRole } from "./slides";

interface Props {
  role: OnboardingRole;
  /** Se true, abre o tour assim que monta (respeitando localStorage). */
  autoOpenIfUnseen?: boolean;
  /** Controle externo: se true, abre incondicionalmente (uso pelo HelpTrigger). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RoleOnboarding({ role, autoOpenIfUnseen = false, open, onOpenChange }: Props) {
  const config = ONBOARDING_CONFIG[role];
  const [internalOpen, setInternalOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const isOpen = open ?? internalOpen;

  function setOpen(v: boolean) {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  }

  useEffect(() => {
    if (!autoOpenIfUnseen) return;
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(config.storageKey);
    if (seen === "1") return;
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenIfUnseen, config.storageKey]);

  function next() {
    if (index < config.slides.length - 1) setIndex(index + 1);
    else finish();
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  function finish() {
    setOpen(false);
    setIndex(0);
    if (typeof window !== "undefined") {
      localStorage.setItem(config.storageKey, "1");
    }
    if (role === "user") {
      completeOnboardingAction().catch(() => {});
    }
  }

  function skip() {
    finish();
  }

  if (!isOpen) return null;

  const slide = config.slides[index];
  const Mockup = slide.mockup;
  const isLast = index === config.slides.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/85 p-3 backdrop-blur-md md:items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) skip();
        }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-surface md:max-w-lg"
        >
          <button
            onClick={skip}
            aria-label="Fechar tour"
            className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm hover:bg-black/60 hover:text-white"
          >
            <X className="size-4" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Mockup />
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-4 p-6 pt-2">
            <div className="flex items-center justify-center gap-1.5">
              {config.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir para slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-brand" : "w-2 bg-surface-3 hover:bg-surface-3/80"
                  }`}
                />
              ))}
            </div>

            <div>
              <h2 className="text-center text-xl font-black text-text md:text-2xl">
                {slide.title}
              </h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-text-soft">
                {slide.desc}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={prev}
                disabled={index === 0}
                aria-label="Anterior"
                className="grid size-11 place-items-center rounded-2xl border border-border text-text-soft transition-colors hover:border-brand/40 hover:text-text disabled:opacity-30"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                onClick={next}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${config.primary} px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow`}
              >
                {isLast ? (
                  <>
                    Entendi <Check className="size-4" />
                  </>
                ) : (
                  <>
                    Próximo <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>

            {!isLast && (
              <button
                onClick={skip}
                className="-mt-1 text-center text-xs font-bold text-text-soft hover:text-text"
              >
                Pular tour
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
