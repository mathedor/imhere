import { Building2, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { getEstabConversionFunnel } from "@/lib/db/match-analysis";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

export const dynamic = "force-dynamic";

const STAGE_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#ef2c39"];

export default async function EstabFunnelPage() {
  const ctx = await getMyEstablishmentContext();

  if (!ctx.establishment) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
            Funil de conversão
          </h1>
          <p className="mt-1 text-sm text-text-soft">Aguardando associação</p>
        </header>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Building2 className="size-8" />
          </div>
          <h2 className="text-xl font-black text-text">Sem estabelecimento</h2>
          <p className="text-sm text-text-soft">
            Cadastre seu estabelecimento pra ver o funil.
          </p>
          <Link
            href="/cadastro"
            className="rounded-pill bg-gradient-to-r from-brand-strong to-brand px-6 py-2.5 text-sm font-bold text-white shadow-glow"
          >
            Cadastrar →
          </Link>
        </div>
      </>
    );
  }

  const place = ctx.establishment;
  const stages = await getEstabConversionFunnel(place.id, 30);
  const firstCount = stages[0]?.count ?? 0;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Funil do {place.name}
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Check-in → conversa → aceite → retorno · últimos 30 dias
        </p>
      </header>

      {stages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-12 text-center">
          <Filter className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Sem dados no período</p>
        </div>
      ) : (
        <>
          <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-2">
              {stages.map((s, i) => {
                const color = STAGE_COLORS[i] ?? "#6b6b75";
                const pctOfFirst = firstCount > 0 ? (s.count / firstCount) * 100 : 0;
                const widthPct = Math.max(5, pctOfFirst);
                return (
                  <div key={s.key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className="grid size-6 place-items-center rounded-full text-[0.6rem] font-black text-white"
                          style={{ background: color }}
                        >
                          {i + 1}
                        </span>
                        <span className="font-bold text-text">{s.label}</span>
                      </span>
                      <span className="text-muted">
                        <strong className="text-text">{s.count.toLocaleString("pt-BR")}</strong>
                        {" · "}
                        {pctOfFirst.toFixed(0)}%
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
                          <span className="text-[0.65rem] font-bold text-white">{s.count}</span>
                        )}
                      </div>
                    </div>
                    {i > 0 && (
                      <p className="-mt-1 text-[0.6rem] text-muted">
                        <ChevronRight className="inline size-3" />
                        {s.pctOfPrev}% dos {stages[i - 1].label.toLowerCase()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {stages.slice(1).map((s, i) => {
              const drop = 100 - s.pctOfPrev;
              const dropColor = drop > 60 ? "#ef2c39" : drop > 40 ? "#f59e0b" : "#22c55e";
              return (
                <div key={s.key} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                    Drop {stages[i].label} → {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-black" style={{ color: dropColor }}>
                    -{drop}%
                  </p>
                  <p className="text-[0.65rem] text-text-soft">
                    {stages[i].count - s.count} pessoas não avançaram
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
