import Link from "next/link";
import { Beer, Music, UtensilsCrossed, Mic2, Palmtree, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BarChart } from "@/components/panel/BarChart";
import { getRankingCategorias } from "@/lib/db/admin-rankings";
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

const TYPE_ICON: Record<string, LucideIcon> = {
  bar: Beer,
  restaurant: UtensilsCrossed,
  club: Music,
  show: Mic2,
  lounge: Palmtree,
};

const TYPE_COLOR: Record<string, string> = {
  bar: "#f59e0b",
  restaurant: "#22c55e",
  club: "#a855f7",
  show: "#3b82f6",
  lounge: "#ef2c39",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const rows = await getRankingCategorias(period);
  const chartData = rows.map((r) => ({ label: r.label.slice(0, 12), value: r.checkins }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Ranking por categoria
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Bar, Restaurante, Club, Show, Lounge — quem move mais
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
          <h2 className="mb-4 text-sm font-bold text-text">Check-ins por categoria</h2>
          <BarChart data={chartData} color="#ef2c39" height={200} />
        </section>
      )}

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-text-soft">Nenhuma categoria com atividade no período.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) => {
            const Icon = TYPE_ICON[r.type] ?? Tag;
            const color = TYPE_COLOR[r.type] ?? "#ef2c39";
            return (
              <div
                key={r.type}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="grid size-12 place-items-center rounded-xl"
                    style={{ background: `${color}25`, color }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-pill border border-border bg-bg/40 px-2 py-0.5 text-[0.65rem] font-bold text-muted">
                    #{i + 1}
                  </span>
                </div>
                <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
                  {r.label}
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight text-text">{r.count} estabs</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-widest text-muted">Receita</p>
                    <p className="font-bold text-text">{fmtMoney(r.revenueCents)}</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-widest text-muted">Check-ins</p>
                    <p className="font-bold text-text">{r.checkins.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
