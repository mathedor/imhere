"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Coins,
  Download,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { KpiCard } from "@/components/panel/KpiCard";
import type {
  CheckinReport,
  ContactReport,
  GenderReport,
  NewUsersReport,
  OnlineUsersReport,
  Period,
  SearchReport,
} from "@/lib/db/admin-reports";
import { cn } from "@/lib/utils";

const PERIOD_LABEL: Record<Period, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  custom: "Personalizado",
};

const GENDER_META: Array<{ key: "male" | "female" | "other" | "na"; label: string; color: string }> = [
  { key: "female", label: "Mulheres", color: "#ec4899" },
  { key: "male", label: "Homens", color: "#3b82f6" },
  { key: "other", label: "Outros", color: "#a855f7" },
  { key: "na", label: "Não informado", color: "#6b6b75" },
];

interface Props {
  period: Period;
  fromIso?: string;
  toIso?: string;
  checkins: CheckinReport;
  newUsers: NewUsersReport;
  online: OnlineUsersReport;
  searches: SearchReport;
  contacts: ContactReport;
  gender: GenderReport;
}

function fmtNumber(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function RelatoriosClient({
  period,
  fromIso,
  toIso,
  checkins,
  newUsers,
  online,
  searches,
  contacts,
  gender,
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

  const totalRegistered = Object.values(gender.registered).reduce((a, b) => a + b, 0);
  const totalOnline = online.total;

  function exportCsv(filename: string, rows: Array<Record<string, string | number>>) {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")].concat(rows.map((r) => headers.map((h) => r[h]).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Period selector */}
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

      {/* KPIs principais */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={MapPin}
          label="Check-ins"
          value={fmtNumber(checkins.total)}
          delta={{ value: checkins.avgDaily, sign: "up", period: `~${checkins.avgDaily}/dia` }}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={UserPlus}
          label="Novos usuários"
          value={fmtNumber(newUsers.total)}
          color="#3b82f6"
          index={1}
        />
        <KpiCard
          icon={Activity}
          label="Online agora"
          value={fmtNumber(totalOnline)}
          color="#ef2c39"
          index={2}
        />
        <KpiCard
          icon={Heart}
          label="Aceite de contatos"
          value={`${contacts.acceptedPct}%`}
          delta={{ value: contacts.total, sign: "up", period: `${contacts.total} solic.` }}
          color="#a855f7"
          index={3}
        />
      </section>

      {/* Check-ins */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-success" />
              <h2 className="text-sm font-bold text-text">Check-ins por dia</h2>
            </div>
            <p className="text-[0.65rem] text-muted">
              Total {fmtNumber(checkins.total)} · pico de {checkins.peakDay?.value ?? 0} em {checkins.peakDay?.label ?? "—"}
            </p>
          </div>
          <button
            onClick={() => exportCsv(`checkins-${period}.csv`, checkins.series.map((s) => ({ data: s.label, valor: s.value })))}
            className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
          >
            <Download className="size-3" />
            CSV
          </button>
        </header>
        <BarChart data={checkins.series} color="#22c55e" height={220} />
      </section>

      {/* Novos usuários + Buscas lado a lado */}
      <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <header className="mb-4 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-text">Novos usuários</h2>
            </div>
            <span className="rounded-pill bg-brand/15 px-2 py-0.5 text-[0.65rem] font-bold text-brand">
              {fmtNumber(newUsers.total)} no período
            </span>
          </header>
          <BarChart data={newUsers.series} color="#3b82f6" height={180} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <header className="mb-4 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-warn" />
              <h2 className="text-sm font-bold text-text">Buscas feitas</h2>
            </div>
            <span className="rounded-pill bg-warn/15 px-2 py-0.5 text-[0.65rem] font-bold text-warn">
              {fmtNumber(searches.total)} buscas
            </span>
          </header>
          <BarChart data={searches.series} color="#f59e0b" height={180} />
          {searches.topQueries.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                Top termos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {searches.topQueries.slice(0, 6).map((q) => (
                  <span
                    key={q.query}
                    className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-2.5 py-1 text-[0.7rem]"
                  >
                    <span className="text-text">{q.query}</span>
                    <span className="text-muted">·</span>
                    <span className="font-bold text-brand">{q.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tentativas de contato */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-brand" />
            <h2 className="text-sm font-bold text-text">Tentativas de contato</h2>
          </div>
          <span className="text-[0.65rem] text-muted">
            {contacts.acceptedPct}% de aceitação
          </span>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-success/10 px-3 py-2.5">
              <CheckCircle2 className="size-5 text-success" />
              <div className="flex-1 leading-tight">
                <p className="text-[0.65rem] text-text-soft">Aceitas</p>
                <p className="text-2xl font-black text-success">{fmtNumber(contacts.accepted)}</p>
              </div>
              <span className="text-xs font-bold text-success">
                {contacts.total > 0 ? Math.round((contacts.accepted / contacts.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-brand/10 px-3 py-2.5">
              <XCircle className="size-5 text-brand" />
              <div className="flex-1 leading-tight">
                <p className="text-[0.65rem] text-text-soft">Recusadas</p>
                <p className="text-2xl font-black text-brand">{fmtNumber(contacts.rejected)}</p>
              </div>
              <span className="text-xs font-bold text-brand">
                {contacts.total > 0 ? Math.round((contacts.rejected / contacts.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-warn/10 px-3 py-2.5">
              <TrendingUp className="size-5 text-warn" />
              <div className="flex-1 leading-tight">
                <p className="text-[0.65rem] text-text-soft">Pendentes</p>
                <p className="text-2xl font-black text-warn">{fmtNumber(contacts.pending)}</p>
              </div>
              <span className="text-xs font-bold text-warn">
                {contacts.total > 0 ? Math.round((contacts.pending / contacts.total) * 100) : 0}%
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              Por dia — empilhado (aceitas / recusadas / pendentes)
            </p>
            <div className="flex h-44 items-end gap-1">
              {contacts.series.map((d) => {
                const tot = d.accepted + d.rejected + d.pending;
                const max = Math.max(...contacts.series.map((s) => s.accepted + s.rejected + s.pending), 1);
                const h = (tot / max) * 100;
                return (
                  <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
                    <div
                      className="relative flex w-full flex-col-reverse overflow-hidden rounded-t"
                      style={{ height: `${h}%`, minHeight: tot > 0 ? "4px" : "0px" }}
                    >
                      {d.accepted > 0 && (
                        <div className="w-full bg-success" style={{ flex: d.accepted }} />
                      )}
                      {d.rejected > 0 && (
                        <div className="w-full bg-brand" style={{ flex: d.rejected }} />
                      )}
                      {d.pending > 0 && (
                        <div className="w-full bg-warn" style={{ flex: d.pending }} />
                      )}
                    </div>
                    <span className="hidden text-[0.55rem] text-muted md:inline">{d.date}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 text-[0.65rem]">
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
          </div>
        </div>
      </section>

      {/* Distribuição por gênero */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center gap-2">
          <Users className="size-4 text-brand" />
          <h2 className="text-sm font-bold text-text">Distribuição por gênero</h2>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              Cadastros · {fmtNumber(totalRegistered)} total
            </p>
            <GenderBars data={gender.registered} total={totalRegistered} />
          </div>
          <div>
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              Online agora · {fmtNumber(totalOnline)}
            </p>
            <GenderBars data={gender.online} total={totalOnline} />
          </div>
        </div>
      </section>

      {/* Online agora — cidades */}
      {online.byCity.length > 0 && (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <header className="mb-4 flex items-center gap-2">
            <Activity className="size-4 text-brand live-dot" />
            <h2 className="text-sm font-bold text-text">Top cidades agora</h2>
          </header>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {online.byCity.map((c, i) => {
              const pct = totalOnline > 0 ? (c.count / totalOnline) * 100 : 0;
              return (
                <motion.div
                  key={c.city}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5"
                >
                  <span className="text-[0.7rem] font-black text-muted">#{i + 1}</span>
                  <span className="flex-1 truncate text-sm font-bold text-text">{c.city}</span>
                  <span className="text-sm font-black text-brand">{c.count}</span>
                  <span className="w-12 text-right text-[0.65rem] text-muted">{pct.toFixed(0)}%</span>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function GenderBars({
  data,
  total,
}: {
  data: { male: number; female: number; other: number; na: number };
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {GENDER_META.map((g) => {
        const value = data[g.key];
        const pct = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={g.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-text-soft">{g.label}</span>
              <span className="font-bold text-text">
                {value.toLocaleString("pt-BR")}{" "}
                <span className="text-muted">· {pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${g.color}, ${g.color}cc)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
