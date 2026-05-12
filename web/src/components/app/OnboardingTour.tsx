"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircleHeart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { completeOnboardingAction } from "@/lib/actions/onboarding";

const SLIDES = [
  {
    icon: MapPin,
    color: "from-success to-success/70",
    title: "Faça check-in onde você está",
    desc: "Bares, restaurantes, baladas — toque em 'Estou aqui' e seu perfil aparece pra galera no lugar.",
    accent: "#22c55e",
  },
  {
    icon: Users,
    color: "from-brand-strong to-brand",
    title: "Veja quem está no mesmo lugar",
    desc: "Filtre por idade, gênero, vibe. Sem feed infinito — só quem tá AGORA com você.",
    accent: "#ef2c39",
  },
  {
    icon: MessageCircleHeart,
    color: "from-warn to-brand",
    title: "Inicie a conversa, sem cringe",
    desc: "Mande um pedido de contato. Se aceitar, o chat libera. Conheceu? Pode rolar offline.",
    accent: "#f59e0b",
  },
];

interface Props {
  show: boolean;
}

export function OnboardingTour({ show }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!show) return;
    // Verifica localStorage pra evitar mostrar se já dispensou nesta sessão
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("imhere-onboarding-seen");
      if (seen === "1") return;
    }
    setOpen(true);
  }, [show]);

  function next() {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      finish();
    }
  }

  function finish() {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("imhere-onboarding-seen", "1");
    }
    completeOnboardingAction().catch(() => {});
  }

  if (!open) return null;

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-md md:items-center"
      >
        <motion.div
          key={index}
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface"
        >
          <div className="relative">
            <div
              className={`flex items-center justify-center bg-gradient-to-br ${slide.color} px-8 py-12`}
            >
              <motion.div
                key={index}
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
                className="grid size-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-sm"
              >
                <Icon className="size-12 text-white drop-shadow-lg" />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-center gap-1.5">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-brand" : "w-2 bg-surface-3"
                  }`}
                />
              ))}
            </div>

            <h2 className="text-center text-2xl font-black text-text">{slide.title}</h2>
            <p className="text-center text-sm leading-relaxed text-text-soft">{slide.desc}</p>

            <div className="mt-2 flex flex-col gap-2">
              <button
                onClick={next}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
              >
                {index === SLIDES.length - 1 ? "Bora começar" : "Próximo"}
                <ArrowRight className="size-4" />
              </button>

              {index < SLIDES.length - 1 && (
                <button
                  onClick={finish}
                  className="text-xs font-bold text-text-soft hover:text-text"
                >
                  Pular tour
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
