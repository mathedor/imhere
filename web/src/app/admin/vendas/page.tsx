import { Download } from "lucide-react";
import { DateRangeUrlFilter } from "@/components/panel/DateRangeUrlFilter";
import { parseRange, rangeToDays } from "@/components/panel/range-utils";
import { VendasClient } from "@/components/admin/VendasClient";
import {
  getRevenueByDay,
  getSalesKPIs,
  listRecentSubscriptions,
} from "@/lib/db/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams.catch(() => ({}));
  const rangeKey = parseRange(sp.range);
  const days = rangeToDays(rangeKey);

  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      console.error("[admin/vendas]", err);
      return fallback;
    }
  };

  const [kpis, revenueByDay, recent] = await Promise.all([
    safe(() => getSalesKPIs(), {
      mrrCents: 0,
      arrCents: 0,
      churnPct: 0,
      delinquentPct: 0,
      activeCount: 0,
      canceledCount: 0,
    }),
    safe(() => getRevenueByDay(days), []),
    safe(() => listRecentSubscriptions(50), []),
  ]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Vendas & assinaturas</h1>
        <p className="mt-1 text-sm text-text-soft">Receita, churn e detalhamento de cobranças</p>
      </header>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <DateRangeUrlFilter current={rangeKey} />
        <button className="flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-bold text-text hover:border-brand/40">
          <Download className="size-3.5" />
          Exportar CSV
        </button>
      </div>

      <VendasClient kpis={kpis} revenueByDay={revenueByDay} recent={recent} days={days} />
    </>
  );
}
