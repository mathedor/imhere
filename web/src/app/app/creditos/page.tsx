import { ArrowDownRight, ArrowUpRight, Coins, MessageCircle, Sparkles, User, Zap } from "lucide-react";
import { CreditosClient } from "@/components/app/CreditosClient";
import { getMyBalance, listCreditPacks, listFeatures, listMyCreditTransactions } from "@/lib/actions/credits";
import { getCurrentProfile } from "@/lib/db/profiles";

export const dynamic = "force-dynamic";

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
  const [balance, packs, features, txs, profile] = await Promise.all([
    getMyBalance(),
    listCreditPacks(),
    listFeatures(),
    listMyCreditTransactions(),
    getCurrentProfile(),
  ]);

  const featuresByScope = features.reduce<Record<string, typeof features>>((acc, f) => {
    (acc[f.scope] = acc[f.scope] || []).push(f);
    return acc;
  }, {});

  const userData = profile
    ? {
        name: profile.name,
        email: profile.email,
        whatsapp: profile.whatsapp,
        cpf: (profile as { cpf?: string | null }).cpf ?? null,
      }
    : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-8">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="rounded-pill border border-warn/30 bg-warn/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-warn">
          <Coins className="mr-1 inline size-3" />
          Sua carteira
        </span>
        <h1 className="text-3xl font-black tracking-tight text-text text-balance md:text-5xl">
          Créditos <span className="text-brand">I&apos;m Here</span>
        </h1>
        <p className="max-w-xl text-sm text-text-soft md:text-base">
          Use em features avulsas sem precisar de plano mensal. Pagamento PIX ou cartão via Efí.
        </p>

        <div className="mt-3 flex items-baseline gap-2 rounded-3xl border border-warn/30 bg-gradient-to-br from-warn/10 to-brand/10 px-8 py-5 shadow-glow">
          <span className="text-5xl font-black text-text md:text-6xl">{balance}</span>
          <span className="text-base font-bold text-warn">🪙</span>
        </div>
      </header>

      <CreditosClient packs={packs} userData={userData} />

      <section className="mt-10 mb-8">
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
