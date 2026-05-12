import { CircleDollarSign, Download, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeUrlFilter, parseRange, rangeToDays } from "@/components/panel/DateRangeUrlFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import { PanelLayout } from "@/components/panel/PanelLayout";
import {
  getRevenueByDay,
  getSalesKPIs,
  listRecentSubscriptions,
  type RecentSubscription,
} from "@/lib/db/admin-dashboard";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

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
  delinquent: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Inadimpl." },
};

function fmtMoney(cents: number): string {
  if (cents >= 100_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const columns: Column<RecentSubscription>[] = [
  { key: "id", label: "ID", sortable: true, width: "100px" },
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

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const days = rangeToDays(rangeKey);

  const [kpis, revenueByDay, recent] = await Promise.all([
    getSalesKPIs(),
    getRevenueByDay(days),
    listRecentSubscriptions(50),
  ]);

  return (
    <PanelLayout
      scope="admin"
      title="Vendas & assinaturas"
      subtitle="Receita, churn e detalhamento de cobranças"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <DateRangeUrlFilter current={rangeKey} />
        <button className="flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-bold text-text hover:border-brand/40">
          <Download className="size-3.5" />
          Exportar CSV
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={CircleDollarSign}
          label="MRR atual"
          value={fmtMoney(kpis.mrrCents)}
          delta={{ value: kpis.activeCount, sign: "up", period: `${kpis.activeCount} ativos` }}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={TrendingUp}
          label="ARR projetado"
          value={fmtMoney(kpis.arrCents)}
          color="#3b82f6"
          index={1}
        />
        <KpiCard
          icon={RefreshCcw}
          label="Churn"
          value={`${kpis.churnPct.toFixed(1)}%`}
          delta={{ value: kpis.canceledCount, sign: kpis.churnPct > 5 ? "up" : "down", period: `${kpis.canceledCount} cancel.` }}
          color="#a855f7"
          index={2}
        />
        <KpiCard
          icon={TrendingDown}
          label="Inadimplência"
          value={`${kpis.delinquentPct.toFixed(1)}%`}
          color="#f59e0b"
          index={3}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-bold text-text">Receita diária</h2>
            <p className="text-[0.7rem] text-muted">R$ por dia · últimos {days} dias</p>
          </div>
          <span className="rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
            MRR: {fmtMoney(kpis.mrrCents)}
          </span>
        </div>
        <BarChart data={revenueByDay} color="#22c55e" formatValue={(v) => `R$ ${v.toLocaleString("pt-BR")}`} height={220} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-text">Cobranças recentes</h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-10 text-center text-sm text-text-soft">
            Nenhuma assinatura ainda.
          </div>
        ) : (
          <DataTable columns={columns} data={recent} rowKey={(r) => r.id} pageSize={10} />
        )}
      </section>
    </PanelLayout>
  );
}
