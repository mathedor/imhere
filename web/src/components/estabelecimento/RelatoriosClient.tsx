"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  Calendar,
  Download,
  MapPin,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { KpiCard } from "@/components/panel/KpiCard";
import type { CheckinReport, CompetitorRow, Period } from "@/lib/db/admin-reports";
import { cn } from "@/lib/utils";

const PERIOD_LABEL: Record<Period, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  custom: "Personalizado",
};

interface Props {
  period: Period;
  fromIso?: string;
  toIso?: string;
  checkins: CheckinReport;
  competitors: CompetitorRow[];
  estabName: string;
  presentNow: number;
  checkinsToday: number;
}

function fmtNumber(v: number) {
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().slice(0, 10);
}

export function EstabRelatoriosClient({
  period,
  fromIso,
  toIso,
  checkins,
  competitors,
  estabName,
  presentNow,
  checkinsToday,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [customFrom, setCustomFrom] = useState(fromIso ?? daysAgoIso(14));
  const [customTo, setCustomTo] = useState(toIso ?? todayIso());

  function setPeriod(p: Period, opts?: { from?: string; to?: string }) {
    const next = new URLSearchParams(params.toString());
    if (p === "30d") next.delete("period");
    else next.set("period", p);
    if (p === "custom") {
      if (opts?.from) next.set("from", opts.from);
      if (opts?.to) next.set("to", opts.to);
    } else {
      next.delete("from");
      next.delete("to");
    }
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const competitorMax = Math.max(
    ...competitors.map((c) => c.checkinsToday),
    checkinsToday,
    1
  );

  function exportCsv() {
    const rows = checkins.series.map((s) => ({ data: s.label, valor: s.value }));
    const csv = "data,valor\n" + rows.map((r) => `${r.data},${r.valor}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkins-${estabName}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Period */}
      <section className="mb-5 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-brand" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted">Período</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["today", "7d", "30d", "custom"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p, p === "custom" ? { from: customFrom, to: customTo } : undefined)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-xs font-bold transition-colors",
                period === p
                  ? "bg-gradient-to-r from-brand-strong to-brand text-white shadow-glow"
                  : "border border-border bg-surface-2 text-text-soft hover:text-text"
              )}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              De
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface-2 px-2 text-sm text-text focus:border-brand/60 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              Até
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={todayIso()}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface-2 px-2 text-sm text-text focus:border-brand/60 outline-none"
              />
            </label>
            <button
              onClick={() => setPeriod("custom", { from: customFrom, to: customTo })}
              className="rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 py-2 text-xs font-bold text-white shadow-glow"
            >
              Aplicar
            </button>
          </div>
        )}
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={MapPin}
          label="Check-ins no período"
          value={fmtNumber(checkins.total)}
          delta={{ value: checkins.avgDaily, sign: "up", period: `~${checkins.avgDaily}/dia` }}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={TrendingUp}
          label="Pico do período"
          value={String(checkins.peakDay?.value ?? 0)}
          delta={checkins.peakDay ? { value: 0, sign: "up", period: `em ${checkins.peakDay.label}` } : undefined}
          color="#f59e0b"
          index={1}
        />
        <KpiCard
          icon={Users}
          label="Presentes agora"
          value={String(presentNow)}
          color="#3b82f6"
          index={2}
        />
        <KpiCard
          icon={Activity}
          label="Check-ins hoje"
          value={String(checkinsToday)}
          color="#ef2c39"
          index={3}
        />
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-success" />
            <h2 className="text-sm font-bold text-text">Check-ins por dia</h2>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
          >
            <Download className="size-3" />
            CSV
          </button>
        </header>
        <BarChart data={checkins.series} color="#22c55e" height={220} />
      </section>

      {/* Comparativo com concorrência */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center gap-2">
          <Building2 className="size-4 text-brand" />
          <div>
            <h2 className="text-sm font-bold text-text">Comparativo com concorrência</h2>
            <p className="text-[0.65rem] text-muted">
              Estabelecimentos num raio de 10km · ordenados por movimento agora
            </p>
          </div>
        </header>

        {competitors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 py-10 text-center">
            <Building2 className="mx-auto size-8 text-muted" />
            <p className="mt-2 text-sm font-bold text-text">Sem concorrentes mapeados ainda</p>
            <p className="mt-1 text-xs text-text-soft">
              Quando outros estabs próximos forem cadastrados, aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Linha do próprio estab pra referência */}
            <div className="flex items-center gap-3 rounded-2xl border border-brand bg-brand/10 px-4 py-3 shadow-glow">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Star className="size-4 fill-white" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-black text-text">{estabName} · você</p>
                <p className="text-[0.65rem] text-text-soft">
                  {presentNow} presentes agora
                </p>
              </div>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[0.6rem] uppercase tracking-widest text-muted">Hoje</span>
                <span className="text-lg font-black text-brand">{checkinsToday}</span>
              </div>
              <div className="w-32 hidden sm:block">
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-strong to-brand"
                    style={{ width: `${(checkinsToday / competitorMax) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {competitors.map((c, i) => {
              const youAhead = checkinsToday > c.checkinsToday;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-black text-muted">
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-text">{c.name}</p>
                      <span className="rounded-pill bg-surface px-1.5 py-0.5 text-[0.55rem] font-bold text-muted">
                        {c.distanceKm}km
                      </span>
                    </div>
                    <p className="flex items-center gap-2 text-[0.65rem] text-text-soft">
                      <span>{c.city}</span>
                      <span className="text-muted">·</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="size-2.5 fill-warn text-warn" />
                        {c.rating.toFixed(1)}
                      </span>
                      <span className="text-muted">·</span>
                      <span>{c.presentNow} agora</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-[0.6rem] uppercase tracking-widest text-muted">Hoje</span>
                    <span className="flex items-center gap-1 text-base font-black text-text">
                      {c.checkinsToday}
                      {youAhead ? (
                        <TrendingDown className="size-3 text-success" />
                      ) : (
                        <TrendingUp className="size-3 text-brand" />
                      )}
                    </span>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-muted to-text-soft"
                        style={{ width: `${(c.checkinsToday / competitorMax) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <p className="mt-2 text-center text-[0.65rem] text-muted">
              {competitors.filter((c) => checkinsToday > c.checkinsToday).length} de{" "}
              {competitors.length} concorrentes superados hoje
            </p>
          </div>
        )}
      </section>
    </>
  );
}
