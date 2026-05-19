"use client";

import { HelpCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { RoleOnboarding } from "./RoleOnboarding";
import { ONBOARDING_CONFIG, type OnboardingRole } from "./slides";

interface Props {
  role: OnboardingRole;
  /** Auto-abre o tour na primeira visita (se nunca dispensou). */
  autoOpenIfUnseen?: boolean;
  variant?: "sidebar" | "header" | "card";
}

export function HelpTrigger({ role, autoOpenIfUnseen = false, variant = "header" }: Props) {
  const [open, setOpen] = useState(false);
  const config = ONBOARDING_CONFIG[role];

  return (
    <>
      {variant === "header" && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Como funciona"
          title="Como funciona — rever tour"
          className="grid size-9 place-items-center rounded-xl border border-border text-text-soft transition-colors hover:border-brand/40 hover:text-brand"
        >
          <HelpCircle className="size-4" />
        </button>
      )}

      {variant === "sidebar" && (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 p-3 text-sm transition-colors hover:border-brand/40 hover:bg-surface"
        >
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand text-white">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1 text-left leading-tight">
            <p className="text-xs font-bold text-text">Como funciona</p>
            <p className="text-[0.65rem] text-muted">Rever tour rápido</p>
          </div>
        </button>
      )}

      {variant === "card" && (
        <button
          onClick={() => setOpen(true)}
          className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-brand/40"
        >
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-text">{config.label}</p>
            <p className="text-xs text-text-soft">Tour rápido com tudo o que dá pra fazer aqui</p>
          </div>
        </button>
      )}

      <RoleOnboarding
        role={role}
        autoOpenIfUnseen={autoOpenIfUnseen}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
