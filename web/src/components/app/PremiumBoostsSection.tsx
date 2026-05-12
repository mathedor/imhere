"use client";

import { motion } from "framer-motion";
import { Crown, EyeOff, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreditConfirmDialog } from "@/components/CreditConfirmDialog";
import { spendCreditsAction } from "@/lib/actions/credits";
import { cn } from "@/lib/utils";

interface BoostConfig {
  code: string;
  label: string;
  description: string;
  duration: string;
  cost: number;
  icon: typeof Rocket;
  gradient: string;
  unlockedPlans: string[];
}

const BOOSTS: BoostConfig[] = [
  {
    code: "discovery:boost",
    label: "Boost de visibilidade",
    description: "Apareça no topo da lista de presentes pra todo mundo do lugar",
    duration: "1 hora",
    cost: 50,
    icon: Rocket,
    gradient: "from-warn via-brand to-brand-strong",
    unlockedPlans: ["vip"],
  },
  {
    code: "establishment:invisible_mode",
    label: "Modo invisível",
    description: "Veja quem tá no lugar sem aparecer na lista pros outros",
    duration: "1 hora",
    cost: 15,
    icon: EyeOff,
    gradient: "from-muted via-text-soft to-text",
    unlockedPlans: ["premium", "vip"],
  },
];

interface Props {
  credits: number;
  planKey: string;
}

export function PremiumBoostsSection({ credits, planKey }: Props) {
  const [pending, setPending] = useState<BoostConfig | null>(null);
  const [balance, setBalance] = useState(credits);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleConfirm() {
    if (!pending) return;
    const result = await spendCreditsAction(pending.code);
    if (result.success) {
      setBalance(result.newBalance);
      setSuccess(`${pending.label} ativado! Aproveita 🚀`);
      setTimeout(() => setSuccess(null), 4500);
    } else {
      alert(result.message);
    }
  }

  return (
    <section className="mb-6 rounded-3xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-text">Boosts e recursos</h2>
          </div>
          <p className="mt-0.5 text-xs text-text-soft">
            Use créditos pra liberar coisas instantâneas · saldo: <span className="font-bold text-text">{balance} 🪙</span>
          </p>
        </div>
        <Link
          href="/app/creditos"
          className="hidden sm:inline-flex items-center gap-1 rounded-pill bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand"
        >
          <Sparkles className="size-3.5" />
          Comprar mais
        </Link>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl border border-success/30 bg-success/10 px-4 py-2.5 text-sm font-bold text-success"
        >
          ✓ {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BOOSTS.map((b) => {
          const Icon = b.icon;
          const isFree = b.unlockedPlans.includes(planKey);
          const insufficient = !isFree && balance < b.cost;
          return (
            <motion.div
              key={b.code}
              whileHover={{ y: -2 }}
              className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-surface-2 p-4"
            >
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", b.gradient)} />
              <div className="flex items-start gap-3">
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", b.gradient)}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-text">{b.label}</p>
                    {isFree && (
                      <span className="inline-flex items-center gap-0.5 rounded-pill bg-warn/20 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wider text-warn">
                        <Crown className="size-2.5" />
                        Grátis
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-soft">{b.description}</p>
                  <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                    Duração: {b.duration}
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={insufficient}
                onClick={() => (isFree ? setSuccess(`${b.label} ativado! (grátis pelo plano)`) : setPending(b))}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-pill px-3 py-2 text-xs font-bold transition-all",
                  isFree
                    ? "bg-success/15 text-success hover:bg-success/25"
                    : insufficient
                    ? "bg-surface-2 text-muted cursor-not-allowed border border-border"
                    : "bg-gradient-to-r from-brand-strong to-brand text-white shadow-glow"
                )}
              >
                {isFree ? (
                  <>Ativar agora <Crown className="size-3.5" /></>
                ) : insufficient ? (
                  <>Saldo insuficiente · faltam {b.cost - balance} 🪙</>
                ) : (
                  <>Ativar por {b.cost} 🪙</>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <CreditConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        cost={pending?.cost ?? 0}
        balance={balance}
        featureLabel={pending?.label ?? ""}
        onConfirm={handleConfirm}
      />
    </section>
  );
}
