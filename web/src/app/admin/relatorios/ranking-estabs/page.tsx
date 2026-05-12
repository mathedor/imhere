import Link from "next/link";
import { BarChart } from "@/components/panel/BarChart";
import { getRankingEstabelecimentos } from "@/lib/db/admin-rankings";
import type { Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(v?: string): Period {
  if (v === "today" || v === "7d" || v === "30d") return v;
  return "30d";
}

function fmtMoney(cents: number) {
  if (cents >= 10_000_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const MEDAL = ["#f59e0b", "#94a3b8", "#b45309"];

const TYPE_LABEL: Record<string, string> = {
  bar: "Bar",
  restaurant: "Restaurante",
  club: "Club",
  show: "Show",
  lounge: "Lounge",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const rows = await getRankingEstabelecimentos(period);
  const chartData = rows.slice(0, 10).map((r) => ({ label: r.name.slice(0, 12), value: r.checkins }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Ranking de estabelecimentos
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Top performers por check-ins, receita e presença
        </p>
      </header>

      <div className="mb-5 flex gap-2">
        {(["today", "7d", "30d"] as const).map((p) => (
          <Link
            key={p}
            href={p === "30d" ? "?" : `?period=${p}`}
            className={`rounded-pill px-3 py-1.5 text-xs font-bold ${
              period === p
                ? "bg-gradient-to-r from-brand-strong to-brand text-white shadow-glow"
                : "border border-border bg-surface text-text-soft hover:text-text"
            }`}
          >
            {p === "today" ? "Hoje" : p === "7d" ? "7 dias" : "30 dias"}
          </Link>
        ))}
      </div>

      {chartData.length > 0 && (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Top 10 por check-ins</h2>
          <BarChart data={chartData} color="#ef2c39" height={220} />
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface">
        <div className="hidden grid-cols-[60px_1fr_120px_100px_100px_100px] gap-4 border-b border-border px-5 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted md:grid">
          <span>#</span>
          <span>Estabelecimento</span>
          <span className="text-right">Receita</span>
          <span className="text-right">Assinaturas</span>
          <span className="text-right">Check-ins</span>
          <span className="text-right">Presentes</span>
        </div>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-soft">
            Nenhum estabelecimento ativo no período.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.id}
              className="grid grid-cols-2 gap-2 border-b border-border/60 px-5 py-4 last:border-0 md:grid-cols-[60px_1fr_120px_100px_100px_100px]"
            >
              <div
                className="col-span-2 grid size-9 place-items-center rounded-full text-xs font-black text-white md:col-span-1"
                style={{ background: i < 3 ? MEDAL[i] : "rgba(255,255,255,0.06)", color: i < 3 ? "#fff" : "var(--text-soft, #94a3b8)" }}
              >
                #{i + 1}
              </div>
              <div className="col-span-2 min-w-0 md:col-span-1">
                <p className="truncate text-sm font-bold text-text">{r.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-text-soft">
                  <span>
                    {r.city}/{r.state}
                  </span>
                  <span className="rounded-pill border border-border bg-bg/40 px-2 py-0.5 font-bold uppercase tracking-widest text-muted">
                    {TYPE_LABEL[r.type] ?? r.type}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-text md:text-right">{fmtMoney(r.revenueCents)}</p>
              <p className="text-sm text-text-soft md:text-right">{r.subscriptions}</p>
              <p className="text-sm font-bold text-text md:text-right">{r.checkins}</p>
              <p className="text-sm text-success md:text-right">{r.presentNow}</p>
            </div>
          ))
        )}
      </section>
    </>
  );
}
