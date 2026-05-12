import Link from "next/link";
import { CheckCircle2, XCircle, TrendingUp, Calendar, MessageCircle } from "lucide-react";
import { getContactReport, type Period } from "@/lib/db/admin-reports";

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

export default async function ContactsReportPage({
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
    data = await getContactReport(period, { fromIso, toIso });
  } catch (err) {
    console.error("[admin/relatorios/contatos] erro:", err);
    data = { total: 0, accepted: 0, rejected: 0, pending: 0, acceptedPct: 0, series: [] };
  }

  const total = data.total;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const maxDay = Math.max(
    ...data.series.map((d) => d.accepted + d.rejected + d.pending),
    1
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Tentativas de contato
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Solicitações enviadas · taxa de aceitação e evolução diária
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

      {/* Cards por status */}
      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-success/10 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-6 text-success" />
            <div className="flex-1 leading-tight">
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-text-soft">
                Aceitas
              </p>
              <p className="text-3xl font-black text-success">{fmtNumber(data.accepted)}</p>
            </div>
            <span className="text-xs font-bold text-success">{pct(data.accepted)}%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-brand/10 p-5">
          <div className="flex items-center gap-3">
            <XCircle className="size-6 text-brand" />
            <div className="flex-1 leading-tight">
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-text-soft">
                Recusadas
              </p>
              <p className="text-3xl font-black text-brand">{fmtNumber(data.rejected)}</p>
            </div>
            <span className="text-xs font-bold text-brand">{pct(data.rejected)}%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-warn/10 p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-6 text-warn" />
            <div className="flex-1 leading-tight">
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-text-soft">
                Pendentes
              </p>
              <p className="text-3xl font-black text-warn">{fmtNumber(data.pending)}</p>
            </div>
            <span className="text-xs font-bold text-warn">{pct(data.pending)}%</span>
          </div>
        </div>
      </section>

      {/* Taxa de aceitação */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-brand" />
            <h2 className="text-sm font-bold text-text">Taxa de aceitação</h2>
          </div>
          <span className="text-xs font-bold text-success">{data.acceptedPct}% aceitação</span>
        </header>
        <div className="h-3 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-success to-success/70 transition-all"
            style={{ width: `${data.acceptedPct}%` }}
          />
        </div>
        <p className="mt-2 text-[0.65rem] text-text-soft">
          Calculada sobre {fmtNumber(data.accepted + data.rejected)} solicitações respondidas
          (aceitas + recusadas)
        </p>
      </section>

      {/* Series como barras horizontais por dia */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Por dia — empilhado</h2>
          <div className="flex items-center gap-3 text-[0.65rem]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-success" /> Aceitas
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-brand" /> Recusadas
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-warn" /> Pendentes
            </span>
          </div>
        </header>
        {data.series.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-soft">
            Nenhuma tentativa de contato no período.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.series.map((d) => {
              const tot = d.accepted + d.rejected + d.pending;
              const widthPct = (tot / maxDay) * 100;
              return (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-[0.65rem] font-bold text-muted">
                    {d.date}
                  </span>
                  <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-surface-3">
                    <div
                      className="flex h-full"
                      style={{ width: `${widthPct}%`, minWidth: tot > 0 ? "4px" : 0 }}
                    >
                      {d.accepted > 0 && (
                        <div className="h-full bg-success" style={{ flex: d.accepted }} />
                      )}
                      {d.rejected > 0 && (
                        <div className="h-full bg-brand" style={{ flex: d.rejected }} />
                      )}
                      {d.pending > 0 && (
                        <div className="h-full bg-warn" style={{ flex: d.pending }} />
                      )}
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-[0.65rem] font-bold text-text">
                    {tot}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
