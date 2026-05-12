import Link from "next/link";
import { BarChart } from "@/components/panel/BarChart";
import { getRankingCidades } from "@/lib/db/admin-rankings";
import type { Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(v?: string): Period {
  if (v === "today" || v === "7d" || v === "30d") return v;
  return "30d";
}

const MEDAL = ["#f59e0b", "#94a3b8", "#b45309"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const rows = await getRankingCidades(period);
  const chartData = rows.slice(0, 10).map((r) => ({ label: r.city.slice(0, 10), value: r.checkins }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Ranking de cidades
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Quais cidades concentram mais check-ins, estabs e usuários
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
          <h2 className="mb-4 text-sm font-bold text-text">Top 10 cidades por check-ins</h2>
          <BarChart data={chartData} color="#3b82f6" height={220} />
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface">
        <div className="hidden grid-cols-[60px_1fr_100px_100px_100px_120px] gap-3 border-b border-border px-5 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted md:grid">
          <span>#</span>
          <span>Cidade</span>
          <span className="text-right">Estabs</span>
          <span className="text-right">Usuários</span>
          <span className="text-right">Check-ins</span>
          <span className="text-right">Presentes agora</span>
        </div>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-soft">
            Nenhuma cidade com atividade no período.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={`${r.city}|${r.state}`}
              className="grid grid-cols-2 gap-2 border-b border-border/60 px-5 py-4 last:border-0 md:grid-cols-[60px_1fr_100px_100px_100px_120px]"
            >
              <div
                className="col-span-2 grid size-9 place-items-center rounded-full text-xs font-black md:col-span-1"
                style={{
                  background: i < 3 ? MEDAL[i] : "rgba(255,255,255,0.06)",
                  color: i < 3 ? "#fff" : "#94a3b8",
                }}
              >
                #{i + 1}
              </div>
              <div className="col-span-2 min-w-0 md:col-span-1">
                <p className="truncate text-sm font-bold text-text">{r.city}</p>
                <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                  {r.state}
                </p>
              </div>
              <p className="text-sm text-text-soft md:text-right">{r.estabsCount}</p>
              <p className="text-sm text-text-soft md:text-right">{r.usersCount}</p>
              <p className="text-sm font-bold text-text md:text-right">{r.checkins.toLocaleString("pt-BR")}</p>
              <div className="flex items-center justify-end gap-2">
                {r.presentNow > 0 && (
                  <span className="relative grid place-items-center">
                    <span className="absolute inline-flex size-2 animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative size-2 rounded-full bg-success" />
                  </span>
                )}
                <p className={`text-sm md:text-right ${r.presentNow > 0 ? "font-bold text-success" : "text-text-soft"}`}>
                  {r.presentNow}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
