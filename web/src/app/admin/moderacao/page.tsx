"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Eye, Shield, ShieldOff, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";

interface ModLog {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  type: "blocked" | "warning";
  matched: string;
  body: string;
  conversationId: string;
  createdAt: string;
}

const LOGS: ModLog[] = [
  { id: "ml1", userId: "u-mari", userName: "Mariana Costa", userPhoto: "https://i.pravatar.cc/100?img=47", type: "blocked", matched: "merda", body: "Que merda esse drink, refazer", conversationId: "conv-mari", createdAt: "Hoje · 22:14" },
  { id: "ml2", userId: "u-lucas", userName: "Lucas Andrade", userPhoto: "https://i.pravatar.cc/100?img=12", type: "warning", matched: "droga", body: "Tem alguma droga nesse drink?", conversationId: "conv-lucas", createdAt: "Ontem · 21:08" },
  { id: "ml3", userId: "u-rafa", userName: "Rafael Mendes", userPhoto: "https://i.pravatar.cc/100?img=33", type: "blocked", matched: "idiota", body: "Que cara idiota, tava reclamando", conversationId: "conv-rafa", createdAt: "2026-05-10" },
];

const columns: Column<ModLog>[] = [
  {
    key: "user",
    label: "Usuário",
    sortable: true,
    accessor: (r) => r.userName,
    render: (r) => (
      <Link href={`/admin/usuarios/${r.userId}`} className="flex items-center gap-3 hover:opacity-80">
        <div className="relative size-9 overflow-hidden rounded-full">
          <Image src={r.userPhoto} alt={r.userName} fill sizes="36px" className="object-cover" />
        </div>
        <span className="font-bold text-text">{r.userName}</span>
      </Link>
    ),
  },
  {
    key: "type",
    label: "Tipo",
    sortable: true,
    render: (r) =>
      r.type === "blocked" ? (
        <span className="flex items-center gap-1 rounded-pill bg-brand/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-brand">
          <X className="size-3" />
          Bloqueada
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded-pill bg-warn/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-warn">
          <AlertTriangle className="size-3" />
          Aviso
        </span>
      ),
  },
  { key: "matched", label: "Termo", sortable: true, render: (r) => <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.7rem] text-brand">{r.matched}</code> },
  { key: "body", label: "Conteúdo", render: (r) => <span className="text-xs text-text-soft line-clamp-1">{r.body}</span> },
  { key: "createdAt", label: "Quando", sortable: true },
  {
    key: "actions",
    label: "Ações",
    align: "right",
    render: (r) => (
      <Link
        href={`/admin/usuarios/${r.userId}`}
        className="inline-flex items-center gap-1 rounded-lg bg-brand/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-brand hover:bg-brand hover:text-white"
      >
        <Eye className="size-3" />
        Ver
      </Link>
    ),
  },
];

export default function ModeracaoPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Moderação</h1>
        <p className="mt-1 text-sm text-text-soft">Mensagens bloqueadas, avisos e reincidências</p>
      </header>
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={ShieldOff} label="Bloqueios 30d" value="312" delta={{ value: 12, sign: "down" }} color="#ef2c39" index={0} />
        <KpiCard icon={AlertTriangle} label="Avisos 30d" value="48" color="#f59e0b" index={1} />
        <KpiCard icon={Shield} label="Banimentos" value="3" color="#a855f7" index={2} />
        <KpiCard icon={Shield} label="Taxa de re-incidência" value="14%" color="#3b82f6" index={3} />
      </section>

      <div className="mb-5 flex items-center justify-end">
        <DateRangeFilter />
      </div>

      <DataTable columns={columns} data={LOGS} rowKey={(r) => r.id} pageSize={10} />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 rounded-2xl border border-border bg-surface p-5"
      >
        <h2 className="mb-3 text-sm font-bold text-text">Configurar filtro de moderação</h2>
        <p className="text-xs text-text-soft">
          Lista de termos bloqueados em <code className="rounded bg-surface-2 px-1.5 py-0.5">lib/moderation.ts</code>.
          Regex agrupado por categoria (ofensa direta, sensíveis, etc).
        </p>
        <Link
          href="https://github.com/mathedor/imhere/blob/main/web/src/lib/moderation.ts"
          target="_blank"
          className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white"
        >
          Editar no GitHub →
        </Link>
      </motion.section>
    </>
  );
}
