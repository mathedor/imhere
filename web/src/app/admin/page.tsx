import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  CircleDollarSign,
  Coins,
  Crown,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AdminSidebarToggle } from "@/components/admin/AdminSidebarToggle";
import { Logo } from "@/components/Logo";
import { signOutAction } from "@/lib/auth/actions";
import { getAdminDashboardKPIs, getPlanDistribution } from "@/lib/db/admin-dashboard";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", icon: Building2 },
  { href: "/admin/vendas", label: "Vendas", icon: CircleDollarSign },
  { href: "/admin/comerciais", label: "Comerciais", icon: Briefcase },
  { href: "/admin/planos", label: "Planos", icon: Crown },
  { href: "/admin/creditos", label: "Créditos", icon: Sparkles },
  { href: "/admin/moderacao", label: "Moderação", icon: ShieldCheck },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

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

function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-3 px-1">
        <Logo size={28} compact />
      </div>

      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white shadow-glow">
        Administração
      </span>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-soft transition-all hover:bg-surface-2 hover:text-text"
            >
              <Icon className="size-4 shrink-0 transition-colors group-hover:text-brand" />
              <span className="flex-1 font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={signOutAction} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-sm transition-colors hover:border-brand/40"
        >
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand text-white">
            <LogOut className="size-4" />
          </div>
          <div className="flex-1 text-left leading-tight">
            <p className="text-xs font-bold text-text">Sair</p>
            <p className="text-[0.65rem] text-muted">Encerrar sessão</p>
          </div>
        </button>
      </form>
    </div>
  );
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
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-surface/40 backdrop-blur-sm md:flex">
        <Sidebar />
      </aside>

      <AdminSidebarToggle>
        <Sidebar />
      </AdminSidebarToggle>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/85 px-5 py-4 backdrop-blur-md md:px-8">
          <AdminSidebarToggle>
            <Sidebar />
          </AdminSidebarToggle>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black tracking-tight text-text md:text-2xl">
              Visão geral da plataforma
            </h1>
            <p className="truncate text-xs text-text-soft md:text-sm">
              KPIs em tempo real direto do banco
            </p>
          </div>
          <Link
            href="/admin/relatorios"
            className="hidden items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-2 text-xs font-bold text-white shadow-glow md:flex"
          >
            <BarChart3 className="size-3.5" />
            Relatórios
          </Link>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">
          {/* KPIs principais */}
          <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              icon={Users}
              label="Usuários totais"
              value={fmtK(kpis.totalUsers)}
              color="#3b82f6"
            />
            <KpiCard
              icon={CircleDollarSign}
              label="MRR ativo"
              value={fmtMoney(kpis.mrrCents)}
              color="#22c55e"
              hint={`${kpis.totalSubscriptions} assinaturas ativas`}
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

          {/* KPIs secundários */}
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

          {/* Distribuição de planos + Atalhos */}
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
                            <strong className="text-text">{p.count.toLocaleString("pt-BR")}</strong> · {pct.toFixed(1)}%
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
              <h2 className="text-sm font-bold text-text">Atalhos rápidos</h2>
              <Link
                href="/admin/usuarios/novo"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
                  <Users className="size-5" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-text">Novo usuário</p>
                  <p className="text-[0.65rem] text-muted">Cadastro manual</p>
                </div>
              </Link>
              <Link
                href="/admin/relatorios"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-warn/15 text-warn">
                  <FileBarChart className="size-5" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-text">Relatórios completos</p>
                  <p className="text-[0.65rem] text-muted">Check-ins, buscas, contatos</p>
                </div>
              </Link>
              <Link
                href="/admin/creditos"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
                  <Coins className="size-5" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-text">Gerir pacotes</p>
                  <p className="text-[0.65rem] text-muted">Preços e features</p>
                </div>
              </Link>
            </div>
          </section>

          {/* Grid de seções */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">
              Outras seções
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {NAV_ITEMS.filter((i) => !i.exact).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand/40"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand transition-all group-hover:bg-brand group-hover:text-white">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xs font-bold text-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
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
      <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-black text-text">{value}</p>
      {hint && <p className="text-[0.65rem] text-text-soft">{hint}</p>}
    </div>
  );
}
