"use client";

import {
  BarChart3,
  Briefcase,
  Building2,
  CircleDollarSign,
  Crown,
  FileBarChart,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import { PanelLayout } from "@/components/panel/PanelLayout";
import {
  interactionsByDay,
  planDistribution,
  recentSubscriptions,
  revenueByDay,
  usersByDay,
} from "@/data/analytics";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

interface SubRow {
  id: string;
  user: string;
  plan: string;
  amount: number;
  status: string;
  date: string;
  method: string;
}

const PLAN_COLORS: Record<string, string> = {
  Free: "#6b6b75",
  Básico: "#3b82f6",
  Premium: "#ef2c39",
  VIP: "#a855f7",
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Ativo" },
  trialing: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Trial" },
  canceled: { bg: "rgba(239,44,57,0.15)", color: "#ef2c39", label: "Cancelado" },
};

const subColumns: Column<SubRow>[] = [
  { key: "user", label: "Usuário", sortable: true },
  {
    key: "plan",
    label: "Plano",
    sortable: true,
    render: (r) => (
      <span
        className="rounded-pill px-2 py-0.5 text-[0.65rem] font-bold"
        style={{
          background: `${PLAN_COLORS[r.plan]}25`,
          color: PLAN_COLORS[r.plan],
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
      const s = STATUS_STYLES[r.status];
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

export default function AdminDashboard() {
  const [range, setRange] = useState("30d");
  const planTotal = planDistribution.reduce((a, p) => a + p.value, 0);

  return (
    <PanelLayout
      scope="admin"
      title="Visão geral da plataforma"
      subtitle="Saúde do produto, vendas e operação em tempo real"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">Resumo</span>
        <DateRangeFilter value={range as "30d"} onChange={(v) => setRange(v)} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Users} label="Usuários totais" value="12.4k" delta={{ value: 8, sign: "up", period: "este mês" }} color="#3b82f6" index={0} />
        <KpiCard icon={CircleDollarSign} label="MRR" value="R$ 184k" delta={{ value: 14, sign: "up", period: "vs mês ant." }} color="#22c55e" index={1} />
        <KpiCard icon={Building2} label="Estabelecimentos" value="480" delta={{ value: 6, sign: "up", period: "30 dias" }} color="#a855f7" index={2} />
        <KpiCard icon={MessageCircle} label="Interações/dia" value="11.2k" delta={{ value: 12, sign: "up", period: "média 7 dias" }} color="#ef2c39" index={3} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Receita diária</h2>
              <p className="text-[0.7rem] text-muted">R$ por dia · 30 dias</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              +14%
            </span>
          </div>
          <BarChart data={revenueByDay} color="#22c55e" formatValue={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Novos usuários</h2>
              <p className="text-[0.7rem] text-muted">Cadastros por dia</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              +8%
            </span>
          </div>
          <BarChart data={usersByDay} color="#3b82f6" />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Interações no chat</h2>
              <p className="text-[0.7rem] text-muted">Conexões iniciadas</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              +12%
            </span>
          </div>
          <BarChart data={interactionsByDay} color="#ef2c39" />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-text">Distribuição de planos</h2>
          <p className="mb-4 text-[0.7rem] text-muted">{planTotal.toLocaleString("pt-BR")} usuários totais</p>
          <div className="flex flex-col gap-3">
            {planDistribution.map((p) => {
              const pct = (p.value / planTotal) * 100;
              return (
                <div key={p.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: PLAN_COLORS[p.label] }} />
                      <span className="font-semibold text-text">{p.label}</span>
                    </span>
                    <span className="text-muted">
                      <strong className="text-text">{p.value.toLocaleString("pt-BR")}</strong> · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${PLAN_COLORS[p.label]}, ${PLAN_COLORS[p.label]}aa)`,
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
        <KpiCard icon={UserCheck} label="Check-ins/dia" value="8.4k" color="#22c55e" index={0} />
        <KpiCard icon={Sparkles} label="Conversão Free→Pago" value="14%" delta={{ value: 2, sign: "up" }} color="#ef2c39" index={1} />
        <KpiCard icon={ShieldCheck} label="Bloqueios moderação" value="312" color="#f59e0b" index={2} />
        <KpiCard icon={Briefcase} label="Comerciais ativos" value="14" color="#a855f7" index={3} />
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold text-text">Últimas assinaturas</h2>
          <Link href="/admin/vendas" className="text-xs font-bold text-brand hover:underline">
            Ver todas →
          </Link>
        </div>
        <DataTable columns={subColumns} data={recentSubscriptions} rowKey={(r) => r.id} pageSize={6} />
      </section>
    </PanelLayout>
  );
}
