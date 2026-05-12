"use client";

import { Download, FileBarChart, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { Select } from "@/components/Field";
import {
  checkinsByDay,
  interactionsByDay,
  revenueByDay,
  usersByDay,
} from "@/data/analytics";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

const REPORTS = [
  { key: "revenue", label: "Receita", color: "#22c55e", data: revenueByDay, fmt: (v: number) => `R$ ${v.toLocaleString("pt-BR")}` },
  { key: "users", label: "Novos usuários", color: "#3b82f6", data: usersByDay, fmt: (v: number) => v.toString() },
  { key: "interactions", label: "Interações", color: "#ef2c39", data: interactionsByDay, fmt: (v: number) => v.toString() },
  { key: "checkins", label: "Check-ins", color: "#a855f7", data: checkinsByDay, fmt: (v: number) => v.toString() },
];

export default function RelatoriosPage() {
  const [range, setRange] = useState("30d");
  const [selected, setSelected] = useState("revenue");
  const [city, setCity] = useState("all");

  const report = REPORTS.find((r) => r.key === selected)!;

  return (
    <PanelLayout
      scope="admin"
      title="Relatórios"
      subtitle="Gere relatórios filtrados e exporte para análise externa"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setSelected(r.key)}
            className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
              selected === r.key
                ? "border-brand bg-brand/5 shadow-glow"
                : "border-border bg-surface hover:border-brand/40"
            }`}
          >
            <div
              className="grid size-9 place-items-center rounded-xl"
              style={{ background: `${r.color}25`, color: r.color }}
            >
              <FileBarChart className="size-4" />
            </div>
            <p className="mt-2 text-sm font-bold text-text">{r.label}</p>
            <p className="text-[0.65rem] text-muted">Visualizar relatório</p>
          </button>
        ))}
      </section>

      <section className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
        <Filter className="size-4 text-brand" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted">Filtros</span>
        <DateRangeFilter value={range as "30d"} onChange={(v) => setRange(v)} />
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">Todas as cidades</option>
          <option value="sp">São Paulo</option>
          <option value="rj">Rio de Janeiro</option>
          <option value="flo">Florianópolis</option>
        </Select>
        <Select defaultValue="all">
          <option value="all">Todos os planos</option>
          <option value="free">Free</option>
          <option value="basic">Básico</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text hover:border-brand/40">
            <FileSpreadsheet className="size-3.5" />
            CSV
          </button>
          <button className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text hover:border-brand/40">
            <FileText className="size-3.5" />
            PDF
          </button>
          <button className="flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-2 text-xs font-bold text-white shadow-glow">
            <Download className="size-3.5" />
            Baixar
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">{report.label}</h2>
            <p className="text-xs text-muted">Período: últimos 30 dias · Cidade: {city === "all" ? "Todas" : city.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Total</p>
            <p className="text-2xl font-black text-text">
              {report.fmt(report.data.reduce((a, p) => a + p.value, 0))}
            </p>
          </div>
        </div>
        <BarChart data={report.data} color={report.color} formatValue={report.fmt} height={240} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Média diária", value: report.fmt(Math.round(report.data.reduce((a, p) => a + p.value, 0) / report.data.length)) },
          { label: "Maior dia", value: report.fmt(Math.max(...report.data.map((d) => d.value))) },
          { label: "Menor dia", value: report.fmt(Math.min(...report.data.map((d) => d.value))) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-black text-text">{s.value}</p>
          </div>
        ))}
      </section>
    </PanelLayout>
  );
}
