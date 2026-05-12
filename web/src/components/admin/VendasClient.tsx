"use client";

import { Coins, CreditCard, RefreshCcw, TrendingUp, Wallet } from "lucide-react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { KpiCard } from "@/components/panel/KpiCard";
import type { DailyPoint, SalesKPIsByType, SalesTxRow, SalesType } from "@/lib/db/admin-sales";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Ativo" },
  trialing: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Trial" },
  canceled: { bg: "rgba(239,44,57,0.15)", color: "#ef2c39", label: "Cancelado" },
  delinquent: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Inadimpl." },
  paid: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Pago" },
  pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pendente" },
};

function fmtMoney(cents: number): string {
  if (cents >= 100_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const columns: Column<SalesTxRow>[] = [
  { key: "id", label: "ID", sortable: true, width: "90px" },
  {
    key: "kind",
    label: "Tipo",
    sortable: true,
    render: (r) => {
      const isSub = r.kind === "subscription";
      return (
        <span
          className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
          style={{
            background: isSub ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)",
            color: isSub ? "#3b82f6" : "#f59e0b",
          }}
        >
          {isSub ? <CreditCard className="size-2.5" /> : <Coins className="size-2.5" />}
          {isSub ? "Assinatura" : "Créditos"}
        </span>
      );
    },
  },
  { key: "user", label: "Usuário", sortable: true },
  { key: "description", label: "Descrição", sortable: true },
  {
    key: "amount",
    label: "Valor",
    sortable: true,
    align: "right",
    accessor: (r) => r.amount,
    render: (r) => <span className="font-bold">R$ {r.amount.toFixed(2).replace(".", ",")}</span>,
  },
  { key: "method", label: "Pgto", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (r) => {
      const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.paid;
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
  kpis: SalesKPIsByType;
  revenueByDay: DailyPoint[];
  recent: SalesTxRow[];
  days: number;
  type: SalesType;
}

export function VendasClient({ kpis, revenueByDay, recent, days, type }: Props) {
  const showSubs = type !== "credits";
  const showCredits = type !== "subscriptions";

  return (
    <>
      {/* KPIs principais */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label={type === "both" ? "Receita total" : type === "subscriptions" ? "Receita assinaturas" : "Receita créditos"}
          value={fmtMoney(kpis.totalRevenueCents)}
          color="#22c55e"
          index={0}
        />
        {showSubs && (
          <KpiCard
            icon={CreditCard}
            label="MRR (assinaturas)"
            value={fmtMoney(kpis.subsRevenueCents)}
            delta={{
              value: kpis.subsActiveCount,
              sign: "up",
              period: `${kpis.subsActiveCount} ativas`,
            }}
            color="#3b82f6"
            index={1}
          />
        )}
        {showCredits && (
          <KpiCard
            icon={Coins}
            label="Receita créditos"
            value={fmtMoney(kpis.creditsRevenueCents)}
            delta={{
              value: kpis.creditsPacksSold,
              sign: "up",
              period: `${kpis.creditsPacksSold} packs`,
            }}
            color="#f59e0b"
            index={2}
          />
        )}
        {showSubs ? (
          <KpiCard
            icon={RefreshCcw}
            label="Churn"
            value={`${kpis.churnPct.toFixed(1)}%`}
            delta={{
              value: kpis.subsCanceledCount,
              sign: kpis.churnPct > 5 ? "up" : "down",
              period: `${kpis.subsCanceledCount} cancel.`,
            }}
            color="#a855f7"
            index={3}
          />
        ) : (
          <KpiCard
            icon={TrendingUp}
            label="Ticket médio"
            value={fmtMoney(kpis.avgTicketCents)}
            color="#a855f7"
            index={3}
          />
        )}
      </section>

      {/* Comparativo Assinaturas vs Créditos quando "both" */}
      {type === "both" && (kpis.subsRevenueCents > 0 || kpis.creditsRevenueCents > 0) && (
        <section className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold text-text">Composição da receita</h2>
          <div className="space-y-3">
            <RevenueBar
              label="Assinaturas"
              value={kpis.subsRevenueCents}
              total={kpis.totalRevenueCents}
              color="#3b82f6"
              icon={CreditCard}
            />
            <RevenueBar
              label="Créditos"
              value={kpis.creditsRevenueCents}
              total={kpis.totalRevenueCents}
              color="#f59e0b"
              icon={Coins}
            />
          </div>
        </section>
      )}

      {/* Chart de receita por dia */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-bold text-text">Receita por dia</h2>
            <p className="text-[0.7rem] text-muted">
              R$ por dia · últimos {days} dias ·{" "}
              {type === "both" ? "ambos" : type === "subscriptions" ? "assinaturas" : "créditos"}
            </p>
          </div>
          <span className="rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
            Total: {fmtMoney(kpis.totalRevenueCents)}
          </span>
        </div>
        <BarChart
          data={revenueByDay}
          color={type === "credits" ? "#f59e0b" : type === "subscriptions" ? "#3b82f6" : "#22c55e"}
          formatValue={(v) => `R$ ${v.toLocaleString("pt-BR")}`}
          height={220}
        />
      </section>

      {/* Tabela de transações */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-text">
          Transações recentes
          {type !== "both" && (
            <span className="ml-2 text-xs font-normal text-text-soft">
              · só {type === "subscriptions" ? "assinaturas" : "créditos"}
            </span>
          )}
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-10 text-center text-sm text-text-soft">
            Nenhuma transação no período.
          </div>
        ) : (
          <DataTable columns={columns} data={recent} rowKey={(r) => r.id} pageSize={10} />
        )}
      </section>
    </>
  );
}

function RevenueBar({
  label,
  value,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: typeof CreditCard;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs">
        <div
          className="grid size-7 shrink-0 place-items-center rounded-lg"
          style={{ background: `${color}25`, color }}
        >
          <Icon className="size-3.5" />
        </div>
        <span className="font-bold text-text">{label}</span>
        <span className="ml-auto text-muted">
          <strong className="text-text">{fmtMoney(value)}</strong> · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          }}
        />
      </div>
    </div>
  );
}
