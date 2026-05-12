"use client";

import { motion } from "framer-motion";
import { Building2, Check, Crown, Edit3, Plus, Sparkles, Star, Trash2, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { plans as mockPlans } from "@/data/plans";
import { cn } from "@/lib/utils";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

type Target = "user" | "establishment";

const ESTAB_PLANS = [
  {
    id: "casa-basic",
    name: "Básico Casa",
    tagline: "Comece no app",
    monthlyPrice: 290,
    annualPrice: 240,
    color: { from: "#3b82f6", to: "#1d4ed8" },
    features: [
      { label: "Aparece na busca", included: true },
      { label: "NO MOMENTO 4h", included: true },
      { label: "Analytics básico", included: true },
      { label: "Chat livre na casa", included: false },
      { label: "Boost de visibilidade", included: false },
    ],
    highlight: false,
  },
  {
    id: "casa-premium",
    name: "Premium Casa+",
    tagline: "Mais conexões na sua casa",
    monthlyPrice: 590,
    annualPrice: 490,
    color: { from: "#ef2c39", to: "#b41822" },
    features: [
      { label: "Tudo do Básico", included: true },
      { label: "Chat livre incluso", included: true },
      { label: "Boost de visibilidade", included: true },
      { label: "Stories 12h", included: true },
      { label: "Cortesias em massa", included: true },
    ],
    highlight: true,
    badge: "Mais escolhido",
  },
];

export default function AdminPlanosPage() {
  const [target, setTarget] = useState<Target>("user");
  const userPlans = mockPlans;
  const list = target === "user" ? userPlans : ESTAB_PLANS;

  return (
    <PanelLayout
      scope="admin"
      title="Planos"
      subtitle="Gerencie planos de usuário e estabelecimento"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
          <button
            onClick={() => setTarget("user")}
            className={cn(
              "relative flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-bold transition-colors",
              target === "user" ? "text-white" : "text-text-soft"
            )}
          >
            {target === "user" && (
              <motion.span
                layoutId="planTargetPill"
                className="absolute inset-0 -z-10 rounded-pill bg-gradient-to-r from-brand-strong to-brand"
              />
            )}
            <UserIcon className="size-3.5" />
            Usuário
          </button>
          <button
            onClick={() => setTarget("establishment")}
            className={cn(
              "relative flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-bold transition-colors",
              target === "establishment" ? "text-white" : "text-text-soft"
            )}
          >
            {target === "establishment" && (
              <motion.span
                layoutId="planTargetPill"
                className="absolute inset-0 -z-10 rounded-pill bg-gradient-to-r from-brand-strong to-brand"
              />
            )}
            <Building2 className="size-3.5" />
            Estabelecimento
          </button>
        </div>

        <Link
          href="/admin/planos/novo"
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          Novo plano
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {list.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-3xl border bg-surface p-5",
              plan.highlight ? "border-brand shadow-glow" : "border-border"
            )}
          >
            {plan.highlight && plan.badge && (
              <span className="absolute right-4 top-4 rounded-pill bg-brand/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-brand">
                {plan.badge}
              </span>
            )}

            <div
              className="grid size-11 place-items-center rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${plan.color.from}, ${plan.color.to})` }}
            >
              {plan.id === "vip" ? <Crown className="size-5" /> : <Sparkles className="size-5" />}
            </div>
            <h3 className="mt-3 text-xl font-black text-text">{plan.name}</h3>
            <p className="text-xs text-text-soft">{plan.tagline}</p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xs text-muted">R$</span>
              <span className="text-3xl font-black tracking-tight text-text">
                {plan.monthlyPrice.toFixed(0)}
              </span>
              <span className="text-xs text-muted">/mês</span>
            </div>
            {plan.annualPrice !== plan.monthlyPrice && (
              <p className="text-[0.65rem] text-success">
                anual: R$ {plan.annualPrice.toFixed(0)}/mês
              </p>
            )}

            <ul className="mt-4 flex flex-1 flex-col gap-1.5 border-t border-border pt-3 text-xs">
              {plan.features.slice(0, 5).map((f) => (
                <li
                  key={f.label}
                  className={cn(
                    "flex items-start gap-1.5",
                    f.included ? "text-text" : "text-muted line-through"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full",
                      f.included ? "bg-success/20 text-success" : "bg-surface-3 text-muted"
                    )}
                  >
                    {f.included ? <Check className="size-2" /> : <X className="size-2" />}
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2 border-t border-border pt-3">
              <Link
                href={`/admin/planos/${plan.id}/editar`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 py-2 text-xs font-bold text-text hover:border-brand/40"
              >
                <Edit3 className="size-3.5" />
                Editar
              </Link>
              <button className="grid size-9 place-items-center rounded-xl border border-border text-text-soft hover:border-brand/40 hover:text-brand">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Star className="size-4 text-warn" />
          <h2 className="text-sm font-bold text-text">Como funciona o pagamento</h2>
        </div>
        <p className="mt-2 text-xs text-text-soft">
          Planos cobrados via <strong className="text-text">Efí Bank</strong> (PIX ou cartão recorrente).
          Você define preços, features e tiers aqui. Cobrança automática nos pagamentos recorrentes.
        </p>
      </section>
    </PanelLayout>
  );
}
