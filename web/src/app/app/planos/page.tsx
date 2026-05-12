"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { plans as mockPlans } from "@/data/plans";
import type { Plan } from "@/lib/db/types";
import { cn } from "@/lib/utils";

const plansData: Plan[] = mockPlans.map((p, i) => ({
  id: p.id,
  target: "user" as const,
  code: p.id,
  name: p.name,
  tagline: p.tagline,
  monthly_price_cents: Math.round(p.monthlyPrice * 100),
  annual_price_cents: Math.round(p.annualPrice * 100),
  features: p.features,
  highlight: p.highlight ?? false,
  active: true,
  sort_order: i,
}));

export default function PlanosPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [selected, setSelected] = useState("premium");
  const [checkout, setCheckout] = useState<Plan | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-8">
      <header className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="rounded-pill border border-brand/30 bg-brand/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand">
          <Sparkles className="mr-1 inline size-3" />
          Liberar tudo
        </span>
        <h1 className="text-3xl font-black tracking-tight text-text text-balance md:text-5xl">
          Escolha seu plano <span className="text-brand">I&apos;m Here</span>
        </h1>
        <p className="max-w-xl text-sm text-text-soft md:text-base">
          Conheça mais pessoas onde você está. Cancele quando quiser, pagamento via PIX ou cartão.
        </p>

        <div className="mt-2 inline-flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "relative rounded-pill px-4 py-1.5 text-xs font-bold transition-colors",
              billing === "monthly" ? "text-white" : "text-text-soft"
            )}
          >
            {billing === "monthly" && (
              <motion.span
                layoutId="billingPill"
                className="absolute inset-0 -z-10 rounded-pill bg-gradient-to-r from-brand-strong to-brand"
              />
            )}
            Mensal
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={cn(
              "relative rounded-pill px-4 py-1.5 text-xs font-bold transition-colors",
              billing === "annual" ? "text-white" : "text-text-soft"
            )}
          >
            {billing === "annual" && (
              <motion.span
                layoutId="billingPill"
                className="absolute inset-0 -z-10 rounded-pill bg-gradient-to-r from-brand-strong to-brand"
              />
            )}
            Anual <span className="text-[0.6rem] text-success">-25%</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockPlans.map((plan, i) => {
          const price = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
          const isSelected = selected === plan.id;
          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                setSelected(plan.id);
                if (plan.monthlyPrice > 0) {
                  setCheckout(plansData.find((p) => p.id === plan.id) ?? null);
                }
              }}
              className={cn(
                "relative flex flex-col gap-5 overflow-hidden rounded-3xl border bg-surface p-5 text-left transition-all",
                plan.highlight && "ring-1 ring-brand/40",
                isSelected ? "border-brand shadow-glow" : "border-border hover:border-brand/40"
              )}
            >
              {plan.badge && (
                <span
                  className="absolute right-4 top-4 rounded-pill bg-gradient-to-r px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${plan.color.from}, ${plan.color.to})`,
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <div>
                <div
                  className="grid size-10 place-items-center rounded-xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${plan.color.from}, ${plan.color.to})`,
                  }}
                >
                  {plan.id === "vip" ? <Crown className="size-5" /> : <Sparkles className="size-5" />}
                </div>
                <h3 className="mt-3 text-2xl font-black text-text">{plan.name}</h3>
                <p className="text-xs text-text-soft">{plan.tagline}</p>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted">R$</span>
                  <span className="text-4xl font-black tracking-tight text-text">
                    {price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-muted">/{billing === "monthly" ? "mês" : "mês*"}</span>
                </div>
                {billing === "annual" && plan.annualPrice > 0 && (
                  <p className="mt-0.5 text-[0.65rem] text-success">
                    *cobrado anualmente R$ {(plan.annualPrice * 12).toFixed(2).replace(".", ",")}
                  </p>
                )}
                {plan.monthlyPrice === 0 && (
                  <p className="mt-0.5 text-[0.65rem] text-muted">para sempre</p>
                )}
              </div>

              <ul className="flex flex-col gap-2 border-t border-border pt-4">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={cn(
                      "flex items-start gap-2 text-xs",
                      f.included ? "text-text" : "text-muted line-through"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full",
                        f.included ? "bg-success/20 text-success" : "bg-surface-3 text-muted"
                      )}
                    >
                      {f.included ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                    </span>
                    <span className="leading-snug">{f.label}</span>
                  </li>
                ))}
              </ul>

              <motion.div
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "mt-auto rounded-2xl px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wider transition-all",
                  isSelected
                    ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                    : "border border-border bg-surface-2 text-text"
                )}
              >
                {plan.monthlyPrice === 0 ? "Plano atual" : isSelected ? "Assinar agora" : "Escolher"}
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <section className="mt-8 rounded-3xl border border-border bg-surface p-5 text-center">
        <p className="text-xs text-text-soft">
          Pagamento processado pela <strong className="text-text">Efí Bank</strong> · PIX, cartão ou
          débito recorrente · Cancele a qualquer momento · Reembolso em 7 dias se não gostar
        </p>
      </section>

      {checkout && (
        <CheckoutModal
          plan={checkout}
          billing={billing}
          open={!!checkout}
          onClose={() => setCheckout(null)}
        />
      )}
    </div>
  );
}
