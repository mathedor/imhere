import { ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { getAcquisitionFunnel, type Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(v?: string): Period {
  if (v === "today" || v === "7d" || v === "30d") return v;
  return "30d";
}

const STAGE_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef2c39"];

export default async function FunilPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const stages = await getAcquisitionFunnel(period);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Funil de aquisição
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Da landing ao premium · onde os usuários caem
        </p>
      </header>

      <div className="mb-5 flex gap-2">
        {(["today", "7d", "30d"] as Period[]).map((p) => (
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

      {stages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-12 text-center">
          <Filter className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Sem dados no período</p>
        </div>
      ) : (
        <>
          {/* Funil visual */}
          <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-2">
              {stages.map((s, i) => {
                const color = STAGE_COLORS[i] ?? "#6b6b75";
                const widthPct = Math.max(5, s.pctOfTotal); // mín 5% pra ser visível
                return (
                  <div key={s.key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-full text-[0.6rem] font-black text-white" style={{ background: color }}>
                          {i + 1}
                        </span>
                        <span className="font-bold text-text">{s.label}</span>
                      </span>
                      <span className="text-muted">
                        <strong className="text-text">{s.count.toLocaleString("pt-BR")}</strong>{" "}
                        · {s.pctOfTotal.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-8 overflow-hidden rounded-xl bg-surface-3">
                      <div
                        className="absolute inset-y-0 left-0 flex items-center justify-end px-3 transition-all"
                        style={{
                          width: `${widthPct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        }}
                      >
                        {widthPct > 15 && (
                          <span className="text-[0.65rem] font-bold text-white">
                            {s.count}
                          </span>
                        )}
                      </div>
                    </div>
                    {i > 0 && (
                      <p className="-mt-1 text-[0.6rem] text-muted">
                        <ChevronRight className="inline size-3" />
                        {s.pctOfPrev.toFixed(0)}% dos {stages[i - 1].label.toLowerCase()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Insights */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stages.slice(1).map((s, i) => {
              const drop = 100 - s.pctOfPrev;
              const dropColor = drop > 60 ? "#ef2c39" : drop > 40 ? "#f59e0b" : "#22c55e";
              return (
                <div key={s.key} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                    Drop {stages[i].label} → {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-black" style={{ color: dropColor }}>
                    -{drop.toFixed(0)}%
                  </p>
                  <p className="text-[0.65rem] text-text-soft">
                    {stages[i].count - s.count} usuários não avançaram
                  </p>
                </div>
              );
            })}
          </section>
        </>
      )}
    </>
  );
}
