import Link from "next/link";
import { Heatmap } from "@/components/admin/Heatmap";
import { getHeatmapCheckins, DAY_LABELS } from "@/lib/db/admin-indices";
import type { Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(v?: string): Period {
  if (v === "today" || v === "7d" || v === "30d") return v;
  return "30d";
}

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}h`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const cells = await getHeatmapCheckins(period);

  const top3 = [...cells].sort((a, b) => b.count - a.count).slice(0, 3).filter((c) => c.count > 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Mapa de calor</h1>
        <p className="mt-1 text-sm text-text-soft">Dia da semana × hora do dia</p>
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

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <Heatmap cells={cells} color="#ef2c39" />
      </section>

      {top3.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Top 3 horários mais movimentados</h2>
          <ol className="flex flex-col gap-3">
            {top3.map((c, i) => (
              <li
                key={`${c.day}-${c.hour}`}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-bg/30 px-4 py-3"
              >
                <span
                  className="grid size-9 place-items-center rounded-full text-xs font-black text-white"
                  style={{ background: ["#f59e0b", "#94a3b8", "#b45309"][i] }}
                >
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text">
                    {DAY_LABELS[c.day]} · {hourLabel(c.hour)}
                  </p>
                  <p className="text-[0.65rem] text-text-soft">{c.count} check-ins no horário</p>
                </div>
                <span className="text-2xl font-black text-brand">{c.count}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
