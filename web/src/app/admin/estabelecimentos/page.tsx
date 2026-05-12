"use client";

import { motion } from "framer-motion";
import { Building2, Edit3, MoreVertical, Plus, Search, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { establishments, typeLabel } from "@/data/establishments";
import { NAV_ADMIN } from "../page";

const columns: Column<(typeof establishments)[number]>[] = [
  {
    key: "name",
    label: "Estabelecimento",
    sortable: true,
    render: (e) => (
      <div className="flex items-center gap-3">
        <div className="relative size-9 overflow-hidden rounded-xl">
          <Image src={e.cover} alt={e.name} fill sizes="36px" className="object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-text">{e.name}</span>
          <span className="text-[0.7rem] text-muted">{typeLabel[e.type]}</span>
        </div>
      </div>
    ),
  },
  { key: "city", label: "Cidade", sortable: true, render: (e) => `${e.city}/${e.state}` },
  {
    key: "presentNow",
    label: "Presentes agora",
    sortable: true,
    align: "right",
    accessor: (e) => e.presentNow,
    render: (e) => (
      <span className="flex items-center justify-end gap-1.5 font-bold text-text">
        <span className="size-1.5 rounded-full bg-success live-dot" />
        {e.presentNow}
      </span>
    ),
  },
  {
    key: "rating",
    label: "Rating",
    sortable: true,
    align: "right",
    accessor: (e) => e.rating,
    render: (e) => (
      <span className="inline-flex items-center justify-end gap-1">
        <Star className="size-3 fill-warn text-warn" />
        {e.rating.toFixed(1)}
        <span className="text-muted">({e.reviewCount})</span>
      </span>
    ),
  },
  {
    key: "priceLevel",
    label: "Faixa",
    sortable: true,
    align: "center",
    accessor: (e) => e.priceLevel,
    render: (e) => <span className="text-text">{"$".repeat(e.priceLevel)}</span>,
  },
  {
    key: "openNow",
    label: "Status",
    sortable: true,
    accessor: (e) => (e.openNow ? 1 : 0),
    render: (e) =>
      e.openNow ? (
        <span className="rounded-pill bg-success/15 px-2 py-0.5 text-[0.65rem] font-bold text-success">
          Aberto
        </span>
      ) : (
        <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.65rem] font-bold text-muted">
          Fechado
        </span>
      ),
  },
  {
    key: "actions",
    label: "Ações",
    align: "right",
    render: () => (
      <div className="flex justify-end gap-1">
        <button className="grid size-7 place-items-center rounded-lg text-muted hover:bg-white/[0.04] hover:text-text">
          <Edit3 className="size-3.5" />
        </button>
        <button className="grid size-7 place-items-center rounded-lg text-muted hover:bg-white/[0.04] hover:text-brand">
          <Trash2 className="size-3.5" />
        </button>
        <button className="grid size-7 place-items-center rounded-lg text-muted hover:bg-white/[0.04] hover:text-text">
          <MoreVertical className="size-3.5" />
        </button>
      </div>
    ),
  },
];

export default function EstabelecimentosAdminPage() {
  const [q, setQ] = useState("");
  const filtered = establishments.filter(
    (e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.city.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PanelLayout
      scope="admin"
      title="Estabelecimentos"
      subtitle="480 cadastrados · 312 com check-ins esta semana"
      nav={NAV_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total", value: "480", icon: Building2, color: "#3b82f6" },
          { label: "Ativos pagantes", value: "342", icon: Building2, color: "#22c55e" },
          { label: "Em trial", value: "48", icon: Building2, color: "#f59e0b" },
          { label: "Sem plano", value: "90", icon: Building2, color: "#6b6b75" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4" style={{ color: s.color }} />
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
                  {s.label}
                </span>
              </div>
              <p className="mt-1 text-2xl font-black text-text">{s.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-pill border border-border bg-surface px-4">
          <Search className="size-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar estabelecimento..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <Plus className="size-4" />
          Novo
        </motion.button>
      </div>

      <DataTable columns={columns} data={filtered} rowKey={(e) => e.id} pageSize={10} />
    </PanelLayout>
  );
}
