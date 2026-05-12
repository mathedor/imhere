"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { recentSubscriptions, revenueByDay } from "@/data/analytics";
import { CircleDollarSign, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";
import { NAV_ADMIN } from "../page";

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

type Row = (typeof recentSubscriptions)[number];

const columns: Column<Row>[] = [
  { key: "id", label: "ID", sortable: true, width: "100px" },
  { key: "user", label: "Usuário", sortable: true },
  {
    key: "plan",
    label: "Plano",
    sortable: true,
    render: (r) => (
      <span
        className="rounded-pill px-2 py-0.5 text-[0.65rem] font-bold"
        style={{ background: `${PLAN_COLORS[r.plan]}25`, color: PLAN_COLORS[r.plan] }}
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

export default function VendasPage() {
  const [range, setRange] = useState("30d");

  return (
    <PanelLayout
      scope="admin"
      title="Vendas & assinaturas"
      subtitle="Receita, churn e detalhamento de cobranças"
      nav={NAV_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <DateRangeFilter value={range as "30d"} onChange={(v) => setRange(v)} />
        <button className="flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-bold text-text hover:border-brand/40">
          <Download className="size-3.5" />
          Exportar CSV
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={CircleDollarSign} label="MRR atual" value="R$ 184k" delta={{ value: 14, sign: "up" }} color="#22c55e" index={0} />
        <KpiCard icon={TrendingUp} label="ARR projetado" value="R$ 2.2M" delta={{ value: 12, sign: "up" }} color="#3b82f6" index={1} />
        <KpiCard icon={RefreshCcw} label="Churn mensal" value="3.2%" delta={{ value: 0.4, sign: "down" }} color="#a855f7" index={2} />
        <KpiCard icon={TrendingDown} label="Inadimplência" value="1.1%" color="#f59e0b" index={3} />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-bold text-text">Receita diária</h2>
            <p className="text-[0.7rem] text-muted">R$ por dia</p>
          </div>
          <span className="rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
            +14% vs período anterior
          </span>
        </div>
        <BarChart data={revenueByDay} color="#22c55e" formatValue={(v) => `R$ ${v.toLocaleString("pt-BR")}`} height={220} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-text">Cobranças recentes</h2>
        <DataTable columns={columns} data={recentSubscriptions} rowKey={(r) => r.id} pageSize={10} />
      </section>
    </PanelLayout>
  );
}
