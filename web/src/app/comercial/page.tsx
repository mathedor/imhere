"use client";

import {
  BarChart3,
  Briefcase,
  Building2,
  CircleDollarSign,
  Handshake,
  LayoutDashboard,
  Plus,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { revenueByDay, topEstablishments } from "@/data/analytics";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

interface Row {
  id: string;
  name: string;
  city: string;
  status: "active" | "trial" | "paused" | "lead";
  plan: string;
  mrr: number;
  signedAt: string;
}

const rows: Row[] = topEstablishments.map((e, i) => ({
  id: e.id,
  name: e.name,
  city: e.city,
  status: e.mrr > 0 ? "active" : i % 3 === 0 ? "trial" : "lead",
  plan: e.mrr > 2000 ? "Premium Casa+" : e.mrr > 0 ? "Básico Casa" : "—",
  mrr: e.mrr,
  signedAt: `2026-0${(i % 4) + 1}-${10 + (i % 18)}`,
}));

const STATUS: Record<Row["status"], { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Ativo" },
  trial: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Trial" },
  paused: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pausado" },
  lead: { bg: "rgba(107,107,117,0.20)", color: "#b8b8c0", label: "Lead" },
};

const columns: Column<Row>[] = [
  {
    key: "name",
    label: "Estabelecimento",
    sortable: true,
    render: (r) => (
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-text">{r.name}</span>
        <span className="text-[0.7rem] text-muted">{r.city}</span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (r) => {
      const s = STATUS[r.status];
      return (
        <span
          className="rounded-pill px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider"
          style={{ background: s.bg, color: s.color }}
        >
          {s.label}
        </span>
      );
    },
  },
  { key: "plan", label: "Plano", sortable: true },
  {
    key: "mrr",
    label: "MRR",
    sortable: true,
    align: "right",
    accessor: (r) => r.mrr,
    render: (r) => (
      <span className="font-bold text-text">
        {r.mrr > 0 ? `R$ ${r.mrr.toLocaleString("pt-BR")}` : "—"}
      </span>
    ),
  },
  {
    key: "commission",
    label: "Comissão",
    align: "right",
    accessor: (r) => r.mrr * 0.1,
    render: (r) => (
      <span className="text-success">
        {r.mrr > 0 ? `R$ ${(r.mrr * 0.1).toLocaleString("pt-BR")}` : "—"}
      </span>
    ),
  },
  { key: "signedAt", label: "Assinado em", sortable: true },
];

export default function ComercialDashboard() {
  const [range, setRange] = useState("30d");

  return (
    <PanelLayout
      scope="comercial"
      title="Painel Comercial"
      subtitle="Acompanhe estabelecimentos, vendas e comissões"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">
          Olá Renata, este é seu mês
        </span>
        <DateRangeFilter value={range as "30d"} onChange={(v) => setRange(v)} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Building2}
          label="Estabelecimentos"
          value="19"
          delta={{ value: 3, sign: "up", period: "este mês" }}
          color="#3b82f6"
          index={0}
        />
        <KpiCard
          icon={Handshake}
          label="MRR sob gestão"
          value="R$ 24.3k"
          delta={{ value: 12, sign: "up", period: "vs mês ant." }}
          color="#22c55e"
          index={1}
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Comissão do mês"
          value="R$ 2.430"
          delta={{ value: 18, sign: "up", period: "estimativa" }}
          color="#a855f7"
          index={2}
        />
        <KpiCard
          icon={Target}
          label="Taxa conversão"
          value="38%"
          delta={{ value: 4, sign: "up", period: "30 dias" }}
          color="#f59e0b"
          index={3}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Vendas no período</h2>
              <p className="text-[0.7rem] text-muted">Receita diária (R$)</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              +12% vs período ant.
            </span>
          </div>
          <BarChart
            data={revenueByDay}
            color="#a855f7"
            height={220}
            formatValue={(v) => `R$ ${v.toLocaleString("pt-BR")}`}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/comercial/novo"
            className="group flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-4 transition-all hover:border-brand"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-brand text-white shadow-glow">
              <Plus className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-text">Cadastrar estabelecimento</p>
              <p className="text-[0.7rem] text-text-soft">Sua comissão começa aqui</p>
            </div>
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Meta do mês</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-text">R$ 24.300</span>
              <span className="text-xs text-success">81%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[81%] rounded-full bg-gradient-to-r from-brand-strong to-brand-soft" />
            </div>
            <p className="mt-2 text-[0.65rem] text-muted">Faltam R$ 5.700 para atingir R$ 30k</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Pipeline rápido</h3>
            {[
              { stage: "Lead", count: 12, color: "#6b6b75" },
              { stage: "Reunião", count: 5, color: "#3b82f6" },
              { stage: "Proposta", count: 3, color: "#f59e0b" },
              { stage: "Fechado", count: 7, color: "#22c55e" },
            ].map((s) => (
              <div key={s.stage} className="mb-2 flex items-center gap-2 last:mb-0">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 text-xs text-text-soft">{s.stage}</span>
                <span className="text-sm font-bold text-text">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-text">Meus estabelecimentos</h2>
          <Link
            href="/comercial/estabelecimentos"
            className="text-xs font-bold text-brand hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <DataTable columns={columns} data={rows} rowKey={(r) => r.id} pageSize={8} />
      </section>
    </PanelLayout>
  );
}
