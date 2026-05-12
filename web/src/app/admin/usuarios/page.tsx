"use client";

import { motion } from "framer-motion";
import { Edit3, MoreVertical, Search, Trash2, UserPlus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { users, AppUser } from "@/data/users";
import { NAV_ADMIN } from "../page";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Aberto" },
  watching: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Observando" },
  invisible: { bg: "rgba(107,107,117,0.20)", color: "#b8b8c0", label: "Invisível" },
};

const columns: Column<AppUser>[] = [
  {
    key: "name",
    label: "Usuário",
    sortable: true,
    render: (u) => (
      <div className="flex items-center gap-3">
        <div className="relative size-9 overflow-hidden rounded-full">
          <Image src={u.photo} alt={u.name} fill sizes="36px" className="object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-text">{u.name}</span>
          <span className="text-[0.7rem] text-muted">{u.profession}</span>
        </div>
      </div>
    ),
  },
  { key: "age", label: "Idade", sortable: true, align: "center", accessor: (u) => u.age, width: "80px" },
  {
    key: "gender",
    label: "Gênero",
    sortable: true,
    align: "center",
    render: (u) => (
      <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.7rem] font-semibold">
        {u.gender === "male" ? "M" : u.gender === "female" ? "F" : "Outro"}
      </span>
    ),
  },
  { key: "city", label: "Cidade", sortable: true, render: (u) => `${u.city}/${u.state}` },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (u) => {
      const s = STATUS_STYLES[u.status];
      return (
        <span
          className="rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
          style={{ background: s.bg, color: s.color }}
        >
          {s.label}
        </span>
      );
    },
  },
  {
    key: "plan",
    label: "Plano",
    sortable: true,
    accessor: (u) => (parseInt(u.id.length.toString()) % 3 === 0 ? "Premium" : "Free"),
    render: (u) => {
      const plan = parseInt(u.id.length.toString()) % 3 === 0 ? "Premium" : "Free";
      return (
        <span
          className="rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
          style={
            plan === "Premium"
              ? { background: "rgba(239,44,57,0.15)", color: "#ef2c39" }
              : { background: "rgba(107,107,117,0.20)", color: "#b8b8c0" }
          }
        >
          {plan}
        </span>
      );
    },
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

export default function UsuariosPage() {
  const [q, setQ] = useState("");
  const filtered = users.filter(
    (u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.profession.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PanelLayout
      scope="admin"
      title="Usuários"
      subtitle="12.418 cadastrados · 7.842 ativos nos últimos 30 dias"
      nav={NAV_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-pill border border-border bg-surface px-4">
          <Search className="size-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, profissão, e-mail..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <UserPlus className="size-4" />
          Novo usuário
        </motion.button>
      </div>

      <DataTable columns={columns} data={filtered} rowKey={(u) => u.id} pageSize={10} />
    </PanelLayout>
  );
}
