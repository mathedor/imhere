"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Sparkles } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}

export function ComingSoonPanel({ icon: Icon = Sparkles, title, description, features = [] }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 py-12 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-strong via-brand to-brand-soft shadow-glow">
          <Icon className="size-10 text-white" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute inset-0 -z-10 rounded-3xl bg-brand/40 blur-2xl"
        />
      </motion.div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tight text-text md:text-3xl">{title}</h2>
        <p className="max-w-md text-sm leading-relaxed text-text-soft">{description}</p>
      </div>

      {features.length > 0 && (
        <ul className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-xs text-text-soft">
              <span className="text-brand">✓</span> {f}
            </li>
          ))}
        </ul>
      )}

      <span className="rounded-pill border border-brand/30 bg-brand/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand">
        Em construção
      </span>
    </div>
  );
}
