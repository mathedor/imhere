"use client";

import {
  BarChart3,
  Building2,
  Camera,
  CircleDollarSign,
  Coins,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeUrlFilter, type RangeKey } from "@/components/panel/DateRangeUrlFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import type { DailyPoint, DashboardKPIs, PlanRow, RecentSubscription } from "@/lib/db/admin-dashboard";

const PLAN_COLORS: Record<string, string> = {
  Free: "#6b6b75",
  "Básico": "#3b82f6",
  Premium: "#ef2c39",
  VIP: "#a855f7",
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Ativo" },
  trialing: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Trial" },
  canceled: { bg: "rgba(239,44,57,0.15)", color: "#ef2c39", label: "Cancelado" },
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

const subColumns: Column<RecentSubscription>[] = [
  { key: "user", label: "Usuário", sortable: true },
  {
    key: "plan",
    label: "Plano",
    sortable: true,
    render: (r) => (
      <span
        className="rounded-pill px-2 py-0.5 text-[0.65rem] font-bold"
        style={{
          background: `${PLAN_COLORS[r.plan] ?? "#6b6b75"}25`,
          color: PLAN_COLORS[r.plan] ?? "#6b6b75",
        }}
      >
        {r.plan}
      </span>
    ),
  },
  {
    key: "amount",
    label: "Valor",
    sortable: true,
    align: "right",
    accessor: (r) => r.amount,
    render: (r) => <span className="font-bold">R$ {r.amount.toFixed(2)}</span>,
  },
  { key: "method", label: "Pgto", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (r) => {
      const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.active;
      return (
        <span
          className="rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
          style={{ background: s.bg, color: s.color }}
        >
          {s.label}
        </span>
      );
    },
  },
  { key: "date", label: "Data", sortable: true },
];

interface Props {
  kpis: DashboardKPIs;
  planDistribution: PlanRow[];
  recentSubs: RecentSubscription[];
  revenueByDay: DailyPoint[];
  usersByDay: DailyPoint[];
  interactionsByDay: DailyPoint[];
  range: RangeKey;
}

export function AdminDashboardClient({
  kpis,
  planDistribution,
  recentSubs,
  revenueByDay,
  usersByDay,
  interactionsByDay,
  range,
}: Props) {
  const planTotal = planDistribution.reduce((a, p) => a + p.count, 0);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">
          Visão geral
        </span>
        <DateRangeUrlFilter current={range} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Usuários totais"
          value={fmtK(kpis.totalUsers)}
          color="#3b82f6"
          index={0}
        />
        <KpiCard
          icon={CircleDollarSign}
          label="MRR ativo"
          value={fmtMoney(kpis.mrrCents)}
          delta={{ value: kpis.totalSubscriptions, sign: "up", period: `${kpis.totalSubscriptions} ativos` }}
          color="#22c55e"
          index={1}
        />
        <KpiCard
          icon={Building2}
          label="Estabelecimentos"
          value={String(kpis.totalEstabs)}
          color="#a855f7"
          index={2}
        />
        <KpiCard
          icon={MessageCircle}
          label="Msgs 24h"
          value={fmtK(kpis.totalInteractions)}
          color="#ef2c39"
          index={3}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Receita diária</h2>
              <p className="text-[0.7rem] text-muted">R$ por dia · últimos 30 dias</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              MRR: {fmtMoney(kpis.mrrCents)}
            </span>
          </div>
          <BarChart
            data={revenueByDay}
            color="#22c55e"
            formatValue={(v) => `R$ ${v.toLocaleString("pt-BR")}`}
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Novos usuários</h2>
              <p className="text-[0.7rem] text-muted">Cadastros por dia · últimos 30</p>
            </div>
          </div>
          <BarChart data={usersByDay} color="#3b82f6" />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Mensagens enviadas</h2>
              <p className="text-[0.7rem] text-muted">Total por dia · últimos 30</p>
            </div>
          </div>
          <BarChart data={interactionsByDay} color="#ef2c39" />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-text">Distribuição de planos (real)</h2>
          <p className="mb-4 text-[0.7rem] text-muted">
            {planTotal.toLocaleString("pt-BR")} usuários cadastrados
          </p>
          <div className="flex flex-col gap-3">
            {planDistribution.map((p) => {
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
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={UserCheck}
          label="Check-ins ativos"
          value={fmtK(kpis.activeCheckins)}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={Sparkles}
          label="Assinantes ativos"
          value={String(kpis.totalSubscriptions)}
          color="#ef2c39"
          index={1}
        />
        <KpiCard
          icon={Coins}
          label="Créditos na economia"
          value={fmtK(kpis.totalCreditsInEconomy)}
          color="#f59e0b"
          index={2}
        />
        <KpiCard
          icon={Camera}
          label="Stories ativos agora"
          value={String(kpis.totalMomentsActive)}
          color="#a855f7"
          index={3}
        />
      </section>

      {recentSubs.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold text-text">Últimas assinaturas</h2>
            <Link href="/admin/vendas" className="text-xs font-bold text-brand hover:underline">
              Ver todas →
            </Link>
          </div>
          <DataTable columns={subColumns} data={recentSubs} rowKey={(r) => r.id} pageSize={10} />
        </section>
      )}
    </>
  );
}
