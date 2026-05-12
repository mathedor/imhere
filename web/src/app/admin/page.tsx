import {
  Activity,
  Briefcase,
  Building2,
  CircleDollarSign,
  Coins,
  Crown,
  FileBarChart,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getAdminDashboardKPIs, getPlanDistribution } from "@/lib/db/admin-dashboard";

export const dynamic = "force-dynamic";

const PLAN_COLORS: Record<string, string> = {
  Free: "#6b6b75",
  "Básico": "#3b82f6",
  Premium: "#ef2c39",
  VIP: "#a855f7",
};

function fmtK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function fmtMoney(cents: number): string {
  if (cents >= 100_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/page]", err);
    return fallback;
  }
}

export default async function AdminDashboardPage() {
  const [kpis, planDist] = await Promise.all([
    safe(() => getAdminDashboardKPIs(), {
      totalUsers: 0,
      totalEstabs: 0,
      activeCheckins: 0,
      mrrCents: 0,
      totalInteractions: 0,
      totalCreditsInEconomy: 0,
      totalSubscriptions: 0,
      totalMomentsActive: 0,
    }),
    safe(() => getPlanDistribution(), []),
  ]);

  const planTotal = planDist.reduce((a, p) => a + p.count, 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Visão geral da plataforma
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          KPIs em tempo real direto do banco · use o menu pra ir nas seções
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Users} label="Usuários totais" value={fmtK(kpis.totalUsers)} color="#3b82f6" />
        <KpiCard
          icon={CircleDollarSign}
          label="MRR ativo"
          value={fmtMoney(kpis.mrrCents)}
          color="#22c55e"
          hint={`${kpis.totalSubscriptions} ativas`}
        />
        <KpiCard
          icon={Building2}
          label="Estabelecimentos"
          value={String(kpis.totalEstabs)}
          color="#a855f7"
        />
        <KpiCard
          icon={MessageCircle}
          label="Msgs 24h"
          value={fmtK(kpis.totalInteractions)}
          color="#ef2c39"
        />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={UserCheck}
          label="Check-ins ativos"
          value={fmtK(kpis.activeCheckins)}
          color="#22c55e"
        />
        <KpiCard
          icon={Sparkles}
          label="Assinantes ativos"
          value={String(kpis.totalSubscriptions)}
          color="#ef2c39"
        />
        <KpiCard
          icon={Coins}
          label="Créditos na economia"
          value={fmtK(kpis.totalCreditsInEconomy)}
          color="#f59e0b"
        />
        <KpiCard
          icon={Activity}
          label="Moments ativos"
          value={String(kpis.totalMomentsActive)}
          color="#a855f7"
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-text">Distribuição de planos</h2>
          <p className="mb-4 text-[0.7rem] text-muted">
            {planTotal.toLocaleString("pt-BR")} usuários cadastrados
          </p>
          {planDist.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/40 py-8 text-center text-xs text-text-soft">
              Sem dados de planos ainda
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {planDist.map((p) => {
                const pct = planTotal > 0 ? (p.count / planTotal) * 100 : 0;
                const color = PLAN_COLORS[p.plan] ?? "#6b6b75";
                return (
                  <div key={p.plan} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ background: color }} />
                        <span className="font-semibold text-text">{p.plan}</span>
                      </span>
                      <span className="text-muted">
                        <strong className="text-text">
                          {p.count.toLocaleString("pt-BR")}
                        </strong>{" "}
                        · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-text">Atalhos</h2>
          <ShortcutCard
            href="/admin/usuarios/novo"
            icon={Users}
            color="#3b82f6"
            title="Novo usuário"
            desc="Cadastro manual"
          />
          <ShortcutCard
            href="/admin/relatorios"
            icon={FileBarChart}
            color="#f59e0b"
            title="Relatórios"
            desc="Análise completa"
          />
          <ShortcutCard
            href="/admin/creditos"
            icon={Coins}
            color="#22c55e"
            title="Gerir pacotes"
            desc="Preços e features"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">
          Outras seções
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <NavTile href="/admin/usuarios" icon={Users} label="Usuários" />
          <NavTile href="/admin/estabelecimentos" icon={Building2} label="Estabs" />
          <NavTile href="/admin/vendas" icon={CircleDollarSign} label="Vendas" />
          <NavTile href="/admin/comerciais" icon={Briefcase} label="Comerciais" />
          <NavTile href="/admin/planos" icon={Crown} label="Planos" />
          <NavTile href="/admin/creditos" icon={Sparkles} label="Créditos" />
          <NavTile href="/admin/moderacao" icon={ShieldCheck} label="Moderação" />
          <NavTile href="/admin/relatorios" icon={FileBarChart} label="Relatórios" />
          <NavTile href="/admin/config" icon={Settings} label="Config" />
        </div>
      </section>
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div
        className="grid size-9 place-items-center rounded-xl"
        style={{ background: `${color}25`, color }}
      >
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-text">{value}</p>
      {hint && <p className="text-[0.65rem] text-text-soft">{hint}</p>}
    </div>
  );
}

function ShortcutCard({
  href,
  icon: Icon,
  color,
  title,
  desc,
}: {
  href: string;
  icon: typeof Users;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40"
    >
      <div
        className="grid size-10 place-items-center rounded-xl"
        style={{ background: `${color}25`, color }}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex-1 leading-tight">
        <p className="text-sm font-bold text-text">{title}</p>
        <p className="text-[0.65rem] text-muted">{desc}</p>
      </div>
    </Link>
  );
}

function NavTile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand/40"
    >
      <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand transition-all group-hover:bg-brand group-hover:text-white">
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-bold text-text">{label}</span>
    </Link>
  );
}
