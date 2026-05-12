"use client";

import { Download, FileBarChart, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { Select } from "@/components/Field";
import type { DailyPoint } from "@/lib/db/admin-dashboard";

interface Props {
  revenue: DailyPoint[];
  users: DailyPoint[];
  interactions: DailyPoint[];
  checkins: DailyPoint[];
}

type ReportKey = "revenue" | "users" | "interactions" | "checkins";

interface ReportMeta {
  key: ReportKey;
  label: string;
  color: string;
  data: DailyPoint[];
  fmt: (v: number) => string;
}

function fmtReais(v: number) {
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

function fmtNumber(v: number) {
  return v.toLocaleString("pt-BR");
}

function downloadCsv(filename: string, data: DailyPoint[]) {
  const header = "data,valor\n";
  const body = data.map((d) => `${d.label},${d.value}`).join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RelatoriosClient({ revenue, users, interactions, checkins }: Props) {
  const [range, setRange] = useState("30d");
  const [selected, setSelected] = useState<ReportKey>("revenue");
  const [city, setCity] = useState("all");

  const reports: ReportMeta[] = useMemo(
    () => [
      { key: "revenue", label: "Receita", color: "#22c55e", data: revenue, fmt: fmtReais },
      { key: "users", label: "Novos usuários", color: "#3b82f6", data: users, fmt: fmtNumber },
      { key: "interactions", label: "Interações", color: "#ef2c39", data: interactions, fmt: fmtNumber },
      { key: "checkins", label: "Check-ins", color: "#a855f7", data: checkins, fmt: fmtNumber },
    ],
    [revenue, users, interactions, checkins]
  );

  const report = reports.find((r) => r.key === selected)!;
  const total = report.data.reduce((a, p) => a + p.value, 0);
  const avg = report.data.length > 0 ? total / report.data.length : 0;
  const maxVal = report.data.length > 0 ? Math.max(...report.data.map((d) => d.value)) : 0;
  const minVal = report.data.length > 0 ? Math.min(...report.data.map((d) => d.value)) : 0;

  return (
    <>
      <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {reports.map((r) => (
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
          <button
            type="button"
            onClick={() => downloadCsv(`${report.key}-30d.csv`, report.data)}
            className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text hover:border-brand/40"
          >
            <FileSpreadsheet className="size-3.5" />
            CSV
          </button>
          <button className="flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text hover:border-brand/40">
            <FileText className="size-3.5" />
            PDF
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(`${report.key}-30d.csv`, report.data)}
            className="flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-2 text-xs font-bold text-white shadow-glow"
          >
            <Download className="size-3.5" />
            Baixar
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">{report.label}</h2>
            <p className="text-xs text-muted">
              Período: últimos 30 dias · Cidade: {city === "all" ? "Todas" : city.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Total</p>
            <p className="text-2xl font-black text-text">{report.fmt(total)}</p>
          </div>
        </div>
        <BarChart data={report.data} color={report.color} formatValue={report.fmt} height={240} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Média diária", value: report.fmt(Math.round(avg)) },
          { label: "Maior dia", value: report.fmt(maxVal) },
          { label: "Menor dia", value: report.fmt(minVal) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-black text-text">{s.value}</p>
          </div>
        ))}
      </section>
    </>
  );
}
