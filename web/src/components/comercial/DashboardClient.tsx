"use client";

import {
  Building2,
  CircleDollarSign,
  Handshake,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import type { DailyPoint } from "@/lib/db/admin-dashboard";
import type { CommercialContext, CommercialEstab } from "@/lib/db/sales-agents";

const STATUS: Record<CommercialEstab["status"], { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Ativo" },
  trial: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Trial" },
  paused: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pausado" },
  lead: { bg: "rgba(107,107,117,0.20)", color: "#b8b8c0", label: "Lead" },
};

function fmtMoney(cents: number): string {
  if (cents >= 100_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const columns: Column<CommercialEstab>[] = [
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
    accessor: (r) => r.mrrCents,
    render: (r) => (
      <span className="font-bold text-text">{r.mrrCents > 0 ? fmtMoney(r.mrrCents) : "—"}</span>
    ),
  },
  {
    key: "commission",
    label: "Comissão",
    align: "right",
    accessor: (r) => r.mrrCents * 0.1,
    render: (r) => (
      <span className="text-success">
        {r.mrrCents > 0 ? fmtMoney(Math.round(r.mrrCents * 0.1)) : "—"}
      </span>
    ),
  },
  { key: "signedAt", label: "Assinado em", sortable: true },
];

const PIPELINE_STAGES: Array<{ stage: CommercialEstab["status"]; label: string; color: string }> = [
  { stage: "lead", label: "Lead", color: "#6b6b75" },
  { stage: "trial", label: "Trial", color: "#3b82f6" },
  { stage: "paused", label: "Pausado", color: "#f59e0b" },
  { stage: "active", label: "Ativo", color: "#22c55e" },
];

const META_MENSAL_CENTS = 3_000_000;

interface Props {
  ctx: CommercialContext;
  revenueByDay: DailyPoint[];
}

export function ComercialDashboardClient({ ctx, revenueByDay }: Props) {
  const [range, setRange] = useState("30d");

  const pipelineCounts = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: ctx.estabs.filter((e) => e.status === s.stage).length,
  }));

  const goalPct = Math.min(100, (ctx.mrrCents / META_MENSAL_CENTS) * 100);
  const goalRemainingCents = Math.max(0, META_MENSAL_CENTS - ctx.mrrCents);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">
          {ctx.profile?.name ? `Olá ${ctx.profile.name.split(" ")[0]}, este é seu mês` : "Visão do mês"}
        </span>
        <DateRangeFilter value={range as "30d"} onChange={(v) => setRange(v)} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Building2}
          label="Estabelecimentos"
          value={String(ctx.estabsCount)}
          color="#3b82f6"
          index={0}
        />
        <KpiCard
          icon={Handshake}
          label="MRR sob gestão"
          value={fmtMoney(ctx.mrrCents)}
          color="#22c55e"
          index={1}
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Comissão estimada"
          value={fmtMoney(ctx.commissionCents)}
          color="#a855f7"
          index={2}
        />
        <KpiCard
          icon={Target}
          label="Conversão"
          value={`${ctx.conversionPct}%`}
          color="#f59e0b"
          index={3}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Vendas da plataforma</h2>
              <p className="text-[0.7rem] text-muted">Receita diária da plataforma · 30d</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              Real time
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
              <span className="text-3xl font-black text-text">{fmtMoney(ctx.mrrCents)}</span>
              <span className="text-xs text-success">{goalPct.toFixed(0)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-strong to-brand-soft"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="mt-2 text-[0.65rem] text-muted">
              {goalRemainingCents > 0
                ? `Faltam ${fmtMoney(goalRemainingCents)} para atingir ${fmtMoney(META_MENSAL_CENTS)}`
                : "🎉 Meta batida no mês"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Pipeline</h3>
            {pipelineCounts.map((s) => (
              <div key={s.stage} className="mb-2 flex items-center gap-2 last:mb-0">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 text-xs text-text-soft">{s.label}</span>
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
        {ctx.estabs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
            <Building2 className="mx-auto size-8 text-muted" />
            <p className="mt-3 text-sm font-bold text-text">Nenhum estabelecimento ainda</p>
            <p className="mt-1 text-xs text-text-soft">
              Cadastre o primeiro pra começar a comissionar.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={ctx.estabs} rowKey={(r) => r.id} pageSize={8} />
        )}
      </section>
    </>
  );
}
