import { ArrowDownRight, ArrowUpRight, Coins, MessageCircle, Sparkles, User, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getMyBalance, listCreditPacks, listFeatures, listMyCreditTransactions } from "@/lib/actions/credits";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const SCOPE_META: Record<string, { icon: typeof MessageCircle; color: string; label: string }> = {
  chat: { icon: MessageCircle, color: "#a855f7", label: "Chat" },
  profile: { icon: User, color: "#3b82f6", label: "Perfil" },
  discovery: { icon: Sparkles, color: "#f59e0b", label: "Descoberta" },
  establishment: { icon: Zap, color: "#22c55e", label: "Estabelecimento" },
};

export default async function CreditosPage() {
  const [balance, packs, features, txs] = await Promise.all([
    getMyBalance(),
    listCreditPacks(),
    listFeatures(),
    listMyCreditTransactions(),
  ]);

  const featuresByScope = features.reduce<Record<string, typeof features>>((acc, f) => {
    (acc[f.scope] = acc[f.scope] || []).push(f);
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-8">
      <header className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-warn via-brand to-brand-soft shadow-glow">
          <Coins className="size-8 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Seus créditos</h1>
        <p className="text-sm text-text-soft">Use em features avulsas sem precisar de plano mensal</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-black text-text">{balance}</span>
          <span className="text-lg text-muted">créditos</span>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
          Comprar créditos
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {packs.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col gap-3 rounded-3xl border bg-surface p-4 text-left transition-all ${
                p.highlight ? "border-brand shadow-glow" : "border-border hover:border-brand/40"
              }`}
            >
              {p.highlight && (
                <span className="absolute right-3 top-3 rounded-pill bg-brand px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                  Popular
                </span>
              )}
              <div className="grid size-10 place-items-center rounded-xl bg-warn/15 text-warn">
                <Coins className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-text">
                  {p.credits + p.bonus}
                </p>
                <p className="text-[0.65rem] uppercase tracking-widest text-muted">
                  créditos
                  {p.bonus > 0 && <span className="ml-1 text-success">+{p.bonus} bônus</span>}
                </p>
              </div>
              <div className="mt-auto">
                <p className="text-lg font-black text-brand">{formatPrice(p.price_cents)}</p>
                <p className="text-[0.6rem] text-muted">
                  ~{(p.price_cents / 100 / (p.credits + p.bonus)).toFixed(2)} por crédito
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
          Tabela de preços (custo por uso)
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Object.entries(featuresByScope).map(([scope, items]) => {
            const meta = SCOPE_META[scope] ?? SCOPE_META.chat;
            const Icon = meta.icon;
            return (
              <div key={scope} className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg" style={{ background: `${meta.color}25`, color: meta.color }}>
                    <Icon className="size-4" />
                  </div>
                  <h3 className="text-sm font-bold text-text">{meta.label}</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {items.map((f) => (
                    <li
                      key={f.code}
                      className="flex items-start gap-3 rounded-xl bg-surface-2 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-xs font-bold text-text">{f.label}</p>
                        {f.description && (
                          <p className="text-[0.65rem] text-text-soft">{f.description}</p>
                        )}
                        {f.unlocked_for_plans.length > 0 && (
                          <p className="mt-1 text-[0.6rem] text-muted">
                            Grátis no:{" "}
                            <span className="font-bold text-brand">
                              {f.unlocked_for_plans.join(", ")}
                            </span>
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-pill bg-warn/15 px-2 py-1 text-[0.65rem] font-bold text-warn">
                        {f.cost_credits} 🪙
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {txs.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
            Histórico recente
          </h2>
          <ul className="flex flex-col gap-2">
            {txs.map((tx) => {
              const isIn = tx.amount > 0;
              return (
                <li
                  key={tx.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div
                    className="grid size-9 place-items-center rounded-xl"
                    style={{
                      background: isIn ? "rgba(34,197,94,0.15)" : "rgba(239,44,57,0.15)",
                      color: isIn ? "#22c55e" : "#ef2c39",
                    }}
                  >
                    {isIn ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-sm font-bold text-text">{tx.description ?? tx.kind}</p>
                    <p className="text-[0.65rem] text-muted">{timeAgo(tx.created_at)} atrás</p>
                  </div>
                  <span
                    className={`text-sm font-black ${isIn ? "text-success" : "text-brand"}`}
                  >
                    {isIn ? "+" : ""}
                    {tx.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
