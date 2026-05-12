import {
  Coins,
  EyeOff,
  MessageCircle,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { listAllCreditPacks, listFeatures } from "@/lib/actions/credits";
import {
  createCreditPackAction,
  deleteCreditPackAction,
  toggleCreditPackAction,
  toggleCreditPackHighlightAction,
  updateCreditPackAction,
  updateFeaturePricingAction,
} from "@/lib/actions/admin-credits";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const SCOPE_META: Record<string, { icon: typeof MessageCircle; color: string; label: string }> = {
  chat: { icon: MessageCircle, color: "#a855f7", label: "Chat" },
  profile: { icon: UserIcon, color: "#3b82f6", label: "Perfil" },
  discovery: { icon: Sparkles, color: "#f59e0b", label: "Descoberta" },
  establishment: { icon: Zap, color: "#22c55e", label: "Estabelecimento" },
};

interface StatsRow {
  total_users: number;
  total_balance: number;
  total_spent_30d: number;
  total_purchased_30d: number;
}

async function getCreditStats(): Promise<StatsRow> {
  if (isMockMode()) {
    return { total_users: 1, total_balance: 250, total_spent_30d: 10, total_purchased_30d: 0 };
  }
  const sb = await supabaseServer();
  const [users, balances, spent, purchased] = await Promise.all([
    sb.from("credit_balances").select("profile_id", { count: "exact", head: true }),
    sb.from("credit_balances").select("balance"),
    sb.from("credit_transactions").select("amount").eq("kind", "spend").gt("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
    sb.from("credit_transactions").select("amount").eq("kind", "purchase").gt("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
  ]);
  return {
    total_users: users.count ?? 0,
    total_balance: (balances.data ?? []).reduce((a, b) => a + (b.balance ?? 0), 0),
    total_spent_30d: Math.abs((spent.data ?? []).reduce((a, t) => a + (t.amount ?? 0), 0)),
    total_purchased_30d: (purchased.data ?? []).reduce((a, t) => a + (t.amount ?? 0), 0),
  };
}

export default async function AdminCreditosPage() {
  const [features, packs, stats] = await Promise.all([listFeatures(), listAllCreditPacks(), getCreditStats()]);

  const grouped = features.reduce<Record<string, typeof features>>((acc, f) => {
    (acc[f.scope] = acc[f.scope] || []).push(f);
    return acc;
  }, {});

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Sistema de créditos</h1>
        <p className="mt-1 text-sm text-text-soft">Edite preços por feature e pacotes de compra · 250 créditos no cadastro</p>
      </header>
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Usuários com saldo", value: stats.total_users.toLocaleString("pt-BR"), color: "#3b82f6" },
          { label: "Saldo total na economia", value: stats.total_balance.toLocaleString("pt-BR"), color: "#22c55e" },
          { label: "Gasto 30d", value: stats.total_spent_30d.toLocaleString("pt-BR"), color: "#ef2c39" },
          { label: "Comprado 30d", value: stats.total_purchased_30d.toLocaleString("pt-BR"), color: "#a855f7" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <div className="grid size-9 place-items-center rounded-xl" style={{ background: `${s.color}25`, color: s.color }}>
              <Coins className="size-4" />
            </div>
            <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">{s.label}</p>
            <p className="mt-0.5 text-2xl font-black text-text">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">Preço por feature</h2>
            <p className="text-xs text-text-soft">
              Edite quanto cada ação custa em créditos. Em &ldquo;Planos&rdquo;, liste os planos que dão grátis (basic, premium, vip).
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Object.entries(grouped).map(([scope, items]) => {
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

                <ul className="flex flex-col gap-3">
                  {items.map((f) => (
                    <li key={f.code} className="rounded-xl bg-surface-2 p-3">
                      <p className="text-xs font-bold text-text">{f.label}</p>
                      {f.description && <p className="mt-0.5 text-[0.65rem] text-text-soft">{f.description}</p>}

                      <form action={updateFeaturePricingAction} className="mt-3 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                        <input type="hidden" name="code" value={f.code} />
                        <input type="hidden" name="active" value="true" />
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                            Custo (créditos)
                          </label>
                          <input
                            name="cost"
                            type="number"
                            min="0"
                            defaultValue={f.cost_credits}
                            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                            Grátis nos planos
                          </label>
                          <input
                            name="unlockedFor"
                            defaultValue={f.unlocked_for_plans.join(", ")}
                            placeholder="basic, premium, vip"
                            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-xs text-text focus:border-brand/60 outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="grid size-9 place-items-center rounded-lg bg-brand text-white hover:bg-brand-strong"
                          title="Salvar"
                        >
                          <Save className="size-4" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">Pacotes de compra</h2>
            <p className="text-xs text-text-soft">
              {packs.length} pacote{packs.length !== 1 ? "s" : ""} cadastrado{packs.length !== 1 ? "s" : ""} ·
              edite preço/créditos/bônus ou crie novos
            </p>
          </div>
        </header>

        <form
          action={createCreditPackAction}
          className="mb-4 grid grid-cols-1 gap-2 rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] md:items-end"
        >
          <div>
            <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">
              Nome do pacote
            </label>
            <input
              name="name"
              required
              placeholder="Ex: Mega Pacote"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">Créditos</label>
            <input
              name="credits"
              type="number"
              min="1"
              defaultValue="50"
              required
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">Bônus</label>
            <input
              name="bonus"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">Preço (R$)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="1"
              defaultValue="9.90"
              required
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">Ordem</label>
            <input
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={packs.length}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex h-9 items-center justify-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 text-xs font-bold uppercase tracking-wider text-white shadow-glow"
          >
            <Plus className="size-3.5" />
            Criar
          </button>
        </form>

        {packs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
            <Coins className="mx-auto size-8 text-muted" />
            <p className="mt-3 text-sm font-bold text-text">Nenhum pacote cadastrado</p>
            <p className="mt-1 text-xs text-text-soft">
              Use o formulário acima para criar o primeiro pacote vendido em /app/creditos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packs.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border bg-surface p-4 ${
                  p.active ? "border-border" : "border-dashed border-border opacity-60"
                }`}
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-text">{p.name}</h3>
                  <div className="flex items-center gap-1">
                    {p.highlight && (
                      <span className="rounded-pill bg-brand/15 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-brand">
                        Popular
                      </span>
                    )}
                    {!p.active && (
                      <span className="rounded-pill bg-muted/20 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-muted">
                        Inativo
                      </span>
                    )}
                  </div>
                </header>

                <form action={updateCreditPackAction} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="highlight" value={p.highlight ? "true" : "false"} />
                  <input type="hidden" name="active" value={p.active ? "true" : "false"} />

                  <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                    Créditos
                  </label>
                  <input
                    name="credits"
                    type="number"
                    min="1"
                    defaultValue={p.credits}
                    className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
                  />

                  <label className="mt-1 block text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                    Bônus
                  </label>
                  <input
                    name="bonus"
                    type="number"
                    min="0"
                    defaultValue={p.bonus}
                    className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
                  />

                  <label className="mt-1 block text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                    Preço (R$)
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(p.price_cents / 100).toFixed(2)}
                    className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text focus:border-brand/60 outline-none"
                  />

                  <button
                    type="submit"
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-strong"
                  >
                    <Save className="size-3.5" />
                    Salvar
                  </button>
                </form>

                <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2">
                  <form action={toggleCreditPackHighlightAction} className="flex-1">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="highlight" value={p.highlight ? "true" : "false"} />
                    <button
                      type="submit"
                      className={`flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[0.65rem] font-bold transition-colors ${
                        p.highlight
                          ? "bg-brand/15 text-brand hover:bg-brand/25"
                          : "bg-surface-2 text-text-soft hover:text-text"
                      }`}
                      title={p.highlight ? "Remover destaque" : "Marcar como popular"}
                    >
                      <Star className="size-3" />
                      {p.highlight ? "Popular" : "Destacar"}
                    </button>
                  </form>
                  <form action={toggleCreditPackAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={p.active ? "true" : "false"} />
                    <button
                      type="submit"
                      className="grid size-7 place-items-center rounded-lg bg-surface-2 text-text-soft hover:text-text"
                      title={p.active ? "Desativar pacote" : "Reativar pacote"}
                    >
                      <EyeOff className="size-3.5" />
                    </button>
                  </form>
                  <form action={deleteCreditPackAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="grid size-7 place-items-center rounded-lg bg-surface-2 text-text-soft hover:text-brand"
                      title="Apagar pacote"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
