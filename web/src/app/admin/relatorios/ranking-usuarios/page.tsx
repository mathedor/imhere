import Link from "next/link";
import { BarChart } from "@/components/panel/BarChart";
import { getRankingUsuarios } from "@/lib/db/admin-rankings";
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
  const rows = await getRankingUsuarios(period);
  const chartData = rows.slice(0, 10).map((r) => ({ label: r.name.split(" ")[0].slice(0, 10), value: r.checkins }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Ranking de usuários
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Quem mais usa: check-ins, contatos, créditos e mensagens
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

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-text-soft">Nenhum usuário ativo no período.</p>
        </section>
      ) : (
        <>
          {chartData.length > 0 && (
            <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-sm font-bold text-text">Top 10 por check-ins</h2>
              <BarChart data={chartData} color="#22c55e" height={220} />
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface">
            <div className="hidden grid-cols-[60px_1fr_90px_90px_90px_90px_90px] gap-3 border-b border-border px-5 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted md:grid">
              <span>#</span>
              <span>Usuário</span>
              <span className="text-right">Check-ins</span>
              <span className="text-right">Enviados</span>
              <span className="text-right">Aceitos</span>
              <span className="text-right">Créditos</span>
              <span className="text-right">Msgs</span>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="grid grid-cols-2 gap-2 border-b border-border/60 px-5 py-4 last:border-0 md:grid-cols-[60px_1fr_90px_90px_90px_90px_90px]"
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
                  <p className="truncate text-sm font-bold text-text">{r.name}</p>
                  {(r.city || r.state) && (
                    <p className="mt-0.5 text-[0.65rem] text-text-soft">
                      {r.city ?? "—"}
                      {r.state ? `/${r.state}` : ""}
                    </p>
                  )}
                </div>
                <p className="text-sm font-bold text-text md:text-right">{r.checkins}</p>
                <p className="text-sm text-text-soft md:text-right">{r.contactsSent}</p>
                <p className="text-sm text-success md:text-right">{r.contactsAccepted}</p>
                <p className="text-sm text-text-soft md:text-right">{r.creditsSpent}</p>
                <p className="text-sm text-text-soft md:text-right">{r.messagesCount}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
