"use client";

import { motion } from "framer-motion";
import { Coins, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { CreditPackCheckoutModal } from "@/components/CreditPackCheckoutModal";
import type { CreditPack } from "@/lib/actions/credits";
import { cn } from "@/lib/utils";

interface UserData {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  cpf?: string | null;
}

interface Props {
  packs: CreditPack[];
  userData?: UserData;
}

function fmtMoney(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const PACK_ACCENTS: Record<number, { from: string; to: string; icon: typeof Coins }> = {
  0: { from: "#6b6b75", to: "#3b82f6", icon: Coins },
  1: { from: "#f59e0b", to: "#ef2c39", icon: Sparkles },
  2: { from: "#a855f7", to: "#ef2c39", icon: TrendingUp },
  3: { from: "#ef2c39", to: "#dc1f2b", icon: Sparkles },
};

export function CreditosClient({ packs, userData }: Props) {
  const [checkout, setCheckout] = useState<CreditPack | null>(null);

  if (packs.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
        <Coins className="mx-auto size-12 text-muted" />
        <p className="mt-4 text-base font-bold text-text">Nenhum pacote disponível agora</p>
        <p className="mt-1 text-xs text-text-soft">
          Estamos preparando pacotes novos. Volta em breve.
        </p>
      </section>
    );
  }

  return (
    <>
      <section>
        <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-muted">
          Comprar créditos
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack, i) => {
            const accent = PACK_ACCENTS[i % 4] ?? PACK_ACCENTS[0];
            const Icon = accent.icon;
            const total = pack.credits + (pack.bonus ?? 0);
            const perCredit = pack.price_cents / 100 / total;
            return (
              <motion.button
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCheckout(pack)}
                className={cn(
                  "relative flex flex-col gap-4 overflow-hidden rounded-3xl border bg-surface p-5 text-left transition-all",
                  pack.highlight
                    ? "border-brand shadow-glow ring-1 ring-brand/30"
                    : "border-border hover:border-brand/40"
                )}
              >
                {pack.highlight && (
                  <span className="absolute right-4 top-4 rounded-pill bg-gradient-to-r from-warn to-brand px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">
                    Popular
                  </span>
                )}

                <div>
                  <div
                    className="grid size-11 place-items-center rounded-xl text-white"
                    style={{
                      background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                    }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-3 text-xl font-black text-text">{pack.name}</h3>
                  <p className="text-xs text-text-soft">
                    {pack.bonus > 0
                      ? `${pack.credits} + ${pack.bonus} bônus`
                      : `${pack.credits} créditos`}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight text-text">{total}</span>
                    <span className="text-base text-warn">🪙</span>
                  </div>
                  {pack.bonus > 0 && (
                    <p className="text-[0.65rem] font-bold text-success">
                      +{pack.bonus} bônus grátis
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-2xl font-black text-brand">{fmtMoney(pack.price_cents)}</p>
                  <p className="text-[0.65rem] text-muted">
                    ~R$ {perCredit.toFixed(2).replace(".", ",")} por crédito
                  </p>
                </div>

                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "mt-auto rounded-2xl px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wider transition-all",
                    pack.highlight
                      ? "bg-gradient-to-r from-warn via-brand to-brand-strong text-white shadow-glow"
                      : "border border-border bg-surface-2 text-text"
                  )}
                >
                  Comprar agora
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs text-text-soft">
          Pagamento processado pela <strong className="text-text">Efí Bank</strong> · PIX ou cartão ·
          Créditos liberados na hora
        </p>
      </section>

      <CreditPackCheckoutModal
        pack={checkout}
        open={!!checkout}
        onClose={() => setCheckout(null)}
        userData={userData}
      />
    </>
  );
}
