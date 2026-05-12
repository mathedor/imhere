import { Coins, CreditCard, Download, Layers } from "lucide-react";
import Link from "next/link";
import { DateRangeUrlFilter } from "@/components/panel/DateRangeUrlFilter";
import { parseRange, rangeToDays } from "@/components/panel/range-utils";
import { VendasClient } from "@/components/admin/VendasClient";
import {
  getRevenueByDayByType,
  getSalesKPIsByType,
  listRecentSalesTx,
  type SalesType,
} from "@/lib/db/admin-sales";

export const dynamic = "force-dynamic";

function parseType(v?: string): SalesType {
  if (v === "subscriptions" || v === "credits" || v === "both") return v;
  return "both";
}

const TYPE_LABELS: Record<SalesType, { label: string; desc: string; icon: typeof Coins }> = {
  subscriptions: { label: "Assinaturas", desc: "Planos premium/VIP/casa", icon: CreditCard },
  credits: { label: "Créditos", desc: "Pacotes de créditos avulsos", icon: Coins },
  both: { label: "Ambos", desc: "Receita consolidada", icon: Layers },
};

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; type?: string }>;
}) {
  const sp = await searchParams.catch(() => ({}) as { range?: string; type?: string });
  const rangeKey = parseRange(sp.range);
  const days = rangeToDays(rangeKey);
  const type = parseType(sp.type);

  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      console.error("[admin/vendas]", err);
      return fallback;
    }
  };

  const [kpis, revenueByDay, recent] = await Promise.all([
    safe(() => getSalesKPIsByType(type, days), {
      totalRevenueCents: 0,
      subsRevenueCents: 0,
      creditsRevenueCents: 0,
      subsActiveCount: 0,
      subsCanceledCount: 0,
      creditsPacksSold: 0,
      churnPct: 0,
      arrCents: 0,
      avgTicketCents: 0,
    }),
    safe(() => getRevenueByDayByType(type, days), []),
    safe(() => listRecentSalesTx(type, 50), []),
  ]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Vendas & assinaturas
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Receita por tipo · {TYPE_LABELS[type].desc.toLowerCase()}
        </p>
      </header>

      {/* Filtro principal: TIPO de receita */}
      <section className="mb-4 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="size-4 text-brand" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Tipo de receita · filtro principal
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["both", "subscriptions", "credits"] as SalesType[]).map((t) => {
            const meta = TYPE_LABELS[t];
            const TIcon = meta.icon;
            const active = type === t;
            return (
              <Link
                key={t}
                href={
                  t === "both"
                    ? sp.range
                      ? `?range=${sp.range}`
                      : "?"
                    : sp.range
                    ? `?type=${t}&range=${sp.range}`
                    : `?type=${t}`
                }
                className={`flex items-center gap-2.5 rounded-xl border p-3 transition-all ${
                  active
                    ? "border-brand bg-brand/10 shadow-glow"
                    : "border-border bg-surface-2 hover:border-brand/40"
                }`}
              >
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    active ? "bg-brand text-white" : "bg-surface text-brand"
                  }`}
                >
                  <TIcon className="size-4" />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-bold text-text">{meta.label}</p>
                  <p className="hidden text-[0.65rem] text-text-soft sm:block">{meta.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Filtro secundário: período */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <DateRangeUrlFilter current={rangeKey} />
        <button className="flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-bold text-text hover:border-brand/40">
          <Download className="size-3.5" />
          Exportar CSV
        </button>
      </div>

      <VendasClient
        kpis={kpis}
        revenueByDay={revenueByDay}
        recent={recent}
        days={days}
        type={type}
      />
    </>
  );
}
