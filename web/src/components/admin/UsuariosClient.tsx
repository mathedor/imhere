"use client";

import { motion } from "framer-motion";
import { Edit3, Eye, Search, Trash2, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";

interface UserRow {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  profession?: string;
  status?: string;
  role?: string;
  photo?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Aberto" },
  watching: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Observando" },
  invisible: { bg: "rgba(107,107,117,0.20)", color: "#b8b8c0", label: "Invisível" },
};

const ROLE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  user: { bg: "rgba(107,107,117,0.20)", color: "#b8b8c0", label: "Usuário" },
  establishment: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Estab" },
  sales: { bg: "rgba(168,85,247,0.15)", color: "#a855f7", label: "Comercial" },
  admin: { bg: "rgba(239,44,57,0.15)", color: "#ef2c39", label: "Admin" },
};

const columns: Column<UserRow>[] = [
  {
    key: "name",
    label: "Usuário",
    sortable: true,
    render: (u) => (
      <div className="flex items-center gap-3">
        <div className="relative size-9 overflow-hidden rounded-full bg-surface-2">
          {u.photo ? (
            <Image src={u.photo} alt={u.name} fill sizes="36px" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs font-bold text-muted">
              {u.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-text">{u.name}</span>
          <span className="text-[0.7rem] text-muted">{u.email}</span>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Papel",
    sortable: true,
    render: (u) => {
      const s = ROLE_STYLES[u.role ?? "user"] ?? ROLE_STYLES.user;
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
  { key: "city", label: "Cidade", sortable: true, render: (u) => u.city ? `${u.city}/${u.state}` : "—" },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (u) => {
      const s = STATUS_STYLES[u.status ?? "open"] ?? STATUS_STYLES.open;
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
    key: "actions",
    label: "Ações",
    align: "right",
    render: (u) => (
      <div className="flex justify-end gap-1.5">
        <Link
          href={`/admin/usuarios/${u.id}`}
          className="flex items-center gap-1 rounded-lg bg-brand/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Eye className="size-3" />
          360
        </Link>
        <Link
          href={`/admin/usuarios/${u.id}/editar`}
          className="grid size-7 place-items-center rounded-lg border border-border text-text-soft hover:border-brand/40 hover:text-text"
        >
          <Edit3 className="size-3.5" />
        </Link>
        <button className="grid size-7 place-items-center rounded-lg border border-border text-text-soft hover:border-brand/40 hover:text-brand">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    ),
  },
];

export function UsuariosClient({ users, total }: { users: UserRow[]; total: number }) {
  const [q, setQ] = useState("");
  const filtered = users.filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      (u.profession ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-pill border border-border bg-surface px-4">
          <Search className="size-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Buscar entre ${total} usuários...`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <Link
          href="/admin/usuarios/novo"
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <UserPlus className="size-4" />
          Novo usuário
        </Link>
      </div>

      <DataTable columns={columns} data={filtered} rowKey={(u) => u.id} pageSize={10} />

      {users.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <p className="text-sm font-bold text-text">Ainda sem usuários cadastrados</p>
          <p className="mt-1 text-xs text-text-soft">Os usuários aparecerão aqui assim que se registrarem.</p>
        </motion.div>
      )}
    </>
  );
}
