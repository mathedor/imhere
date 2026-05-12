import Link from "next/link";
import { MapPin, TrendingUp, Calendar, Activity } from "lucide-react";
import { BarChart } from "@/components/panel/BarChart";
import { KpiCard } from "@/components/panel/KpiCard";
import { getCheckinReport, type Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(value?: string): Period {
  if (value === "today" || value === "7d" || value === "30d" || value === "custom") return value;
  return "30d";
}

const PERIODS: Array<{ key: "today" | "7d" | "30d"; label: string }> = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
];

function fmtNumber(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

export default async function CheckinsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const fromIso = sp.from;
  const toIso = sp.to;

  let data;
  try {
    data = await getCheckinReport(period, { fromIso, toIso });
  } catch (err) {
    console.error("[admin/relatorios/checkins] erro:", err);
    data = { total: 0, series: [], avgDaily: 0, peakDay: null };
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Check-ins · relatório completo
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Volume e padrão diário de check-ins · escolha o período
        </p>
      </header>

      {/* Period selector */}
      <section className="mb-5 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-brand" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted">Período</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <Link
                key={p.key}
                href={`?period=${p.key}`}
                scroll={false}
                className={
                  active
                    ? "rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-1.5 text-xs font-bold text-white shadow-glow"
                    : "rounded-pill border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-text-soft hover:text-text"
                }
              >
                {p.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPIs */}
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          icon={MapPin}
          label="Total"
          value={fmtNumber(data.total)}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={Activity}
          label="Média por dia"
          value={fmtNumber(data.avgDaily)}
          color="#3b82f6"
          index={1}
        />
        <KpiCard
          icon={TrendingUp}
          label="Pico do período"
          value={data.peakDay ? `${fmtNumber(data.peakDay.value)}` : "—"}
          delta={
            data.peakDay
              ? { value: 0, sign: "up", period: `em ${data.peakDay.label}` }
              : undefined
          }
          color="#a855f7"
          index={2}
        />
      </section>

      {/* Chart */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-success" />
              <h2 className="text-sm font-bold text-text">Check-ins por dia</h2>
            </div>
            <p className="text-[0.65rem] text-muted">
              Total {fmtNumber(data.total)} ·{" "}
              {data.peakDay
                ? `pico de ${data.peakDay.value} em ${data.peakDay.label}`
                : "sem dados"}
            </p>
          </div>
        </header>
        {data.series.length > 0 ? (
          <BarChart data={data.series} color="#22c55e" height={260} />
        ) : (
          <p className="py-10 text-center text-sm text-text-soft">
            Nenhum check-in no período selecionado.
          </p>
        )}
      </section>
    </>
  );
}
