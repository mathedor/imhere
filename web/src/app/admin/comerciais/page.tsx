"use client";

import { motion } from "framer-motion";
import { Mail, Plus, Trophy } from "lucide-react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { salesAgents } from "@/data/analytics";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

type Row = (typeof salesAgents)[number];

const columns: Column<Row>[] = [
  {
    key: "name",
    label: "Comercial",
    sortable: true,
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-strong to-brand text-xs font-bold text-white">
          {r.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-text">{r.name}</span>
          <span className="flex items-center gap-1 text-[0.7rem] text-muted">
            <Mail className="size-2.5" />
            {r.email}
          </span>
        </div>
      </div>
    ),
  },
  { key: "establishments", label: "Estabelecimentos", sortable: true, align: "right", accessor: (r) => r.establishments },
  {
    key: "mrr",
    label: "MRR sob gestão",
    sortable: true,
    align: "right",
    accessor: (r) => r.mrr,
    render: (r) => <span className="font-bold text-text">R$ {r.mrr.toLocaleString("pt-BR")}</span>,
  },
  {
    key: "commission",
    label: "Comissão mensal",
    sortable: true,
    align: "right",
    accessor: (r) => r.commission,
    render: (r) => <span className="text-success">R$ {r.commission.toLocaleString("pt-BR")}</span>,
  },
];

export default function ComerciaisPage() {
  return (
    <PanelLayout
      scope="admin"
      title="Comerciais"
      subtitle="Equipe de vendas que cadastra e gerencia estabelecimentos"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">
          {salesAgents.length} comerciais ativos
        </span>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <Plus className="size-4" />
          Novo comercial
        </motion.button>
      </div>

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="size-4 text-warn" />
          <h2 className="text-sm font-bold text-text">Ranking do mês</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[...salesAgents]
            .sort((a, b) => b.mrr - a.mrr)
            .slice(0, 3)
            .map((sa, i) => {
              const colors = ["#f59e0b", "#94a3b8", "#b45309"];
              return (
                <div
                  key={sa.id}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 p-3"
                  style={{ border: `1px solid ${colors[i]}30` }}
                >
                  <div
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black"
                    style={{ background: `${colors[i]}25`, color: colors[i] }}
                  >
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-bold text-text">{sa.name}</p>
                    <p className="text-[0.7rem] text-muted">{sa.establishments} estabelecimentos</p>
                  </div>
                  <span className="text-sm font-black text-text">R$ {(sa.mrr / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
        </div>
      </section>

      <DataTable columns={columns} data={salesAgents} rowKey={(r) => r.id} pageSize={10} />
    </PanelLayout>
  );
}
