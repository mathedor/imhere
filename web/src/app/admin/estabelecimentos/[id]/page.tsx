"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  Edit3,
  Eye,
  Flame,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Star,
  TrendingUp,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { checkinsByDay } from "@/data/analytics";
import { establishments, momentoByEstablishment, typeLabel } from "@/data/establishments";
import { presentByEstablishment, users, AppUser } from "@/data/users";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

interface CheckinLog {
  id: string;
  userId: string;
  arrivedAt: string;
  leftAt: string | null;
  durationMin: number;
  dateIso: string;
}

function buildCheckinLog(estabId: string): CheckinLog[] {
  const ids = presentByEstablishment[estabId] ?? [];
  // Mock histórico nos últimos 30 dias
  const out: CheckinLog[] = [];
  ids.forEach((uid, i) => {
    for (let d = 0; d < 8; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d - (i % 5));
      out.push({
        id: `${uid}-${d}`,
        userId: uid,
        arrivedAt: `${21 + (d % 3)}:${String(10 + d * 5).slice(0, 2)}`,
        leftAt: d > 0 ? `${23 + (d % 2)}:${String(20 + d * 3).slice(0, 2)}` : null,
        durationMin: 60 + (d * 12) % 180,
        dateIso: date.toISOString().slice(0, 10),
      });
    }
  });
  return out.sort((a, b) => (b.dateIso + b.arrivedAt).localeCompare(a.dateIso + a.arrivedAt));
}

interface Row {
  id: string;
  user: AppUser;
  arrivedAt: string;
  leftAt: string | null;
  durationMin: number;
  dateIso: string;
}

const columns: Column<Row>[] = [
  {
    key: "user",
    label: "Usuário",
    sortable: true,
    accessor: (r) => r.user.name,
    render: (r) => (
      <Link href={`/admin/usuarios/${r.user.id}`} className="flex items-center gap-3 hover:opacity-80">
        <div className="relative size-9 overflow-hidden rounded-full">
          <Image src={r.user.photo} alt={r.user.name} fill sizes="36px" className="object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-text">{r.user.name}</span>
          <span className="text-[0.7rem] text-muted">
            {r.user.age} · {r.user.profession}
          </span>
        </div>
      </Link>
    ),
  },
  {
    key: "gender",
    label: "Gênero",
    sortable: true,
    align: "center",
    accessor: (r) => r.user.gender,
    render: (r) => (
      <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.7rem] font-semibold">
        {r.user.gender === "male" ? "M" : r.user.gender === "female" ? "F" : "Outro"}
      </span>
    ),
  },
  { key: "dateIso", label: "Data", sortable: true, render: (r) => r.dateIso.split("-").reverse().join("/") },
  { key: "arrivedAt", label: "Chegou", sortable: true, align: "center" },
  {
    key: "leftAt",
    label: "Saiu",
    sortable: true,
    align: "center",
    render: (r) => r.leftAt ?? <span className="text-success font-bold">No local</span>,
  },
  {
    key: "durationMin",
    label: "Duração",
    sortable: true,
    align: "right",
    accessor: (r) => r.durationMin,
    render: (r) => (
      <span className="font-bold text-text">
        {Math.floor(r.durationMin / 60)}h {r.durationMin % 60}m
      </span>
    ),
  },
];

function rangeToDays(r: string): number {
  return { today: 1, "7d": 7, "30d": 30, "90d": 90, year: 365 }[r] ?? 30;
}

export default function AdminEstabelecimentoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const place = establishments.find((e) => e.id === id);
  if (!place) notFound();

  const [range, setRange] = useState<"today" | "7d" | "30d" | "90d" | "year">("30d");
  const [search, setSearch] = useState("");

  const allLogs = useMemo(() => buildCheckinLog(place.id), [place.id]);
  const days = rangeToDays(range);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const rows: Row[] = allLogs
    .filter((l) => l.dateIso >= cutoffIso)
    .map((l) => {
      const user = users.find((u) => u.id === l.userId);
      if (!user) return null;
      return { ...l, user };
    })
    .filter((r): r is Row => r !== null)
    .filter((r) => !search || r.user.name.toLowerCase().includes(search.toLowerCase()));

  const moments = momentoByEstablishment[place.id] ?? [];
  const totalGender = rows.reduce(
    (acc, r) => {
      if (r.user.gender === "male") acc.m++;
      else if (r.user.gender === "female") acc.f++;
      else acc.o++;
      return acc;
    },
    { m: 0, f: 0, o: 0 }
  );

  return (
    <PanelLayout
      scope="admin"
      title={`Estabelecimento · ${place.name}`}
      subtitle={`${place.address} · ${place.city}/${place.state}`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <Link
        href="/admin/estabelecimentos"
        className="mb-4 inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ArrowLeft className="size-3.5" />
        Voltar à lista
      </Link>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image src={place.cover} alt={place.name} fill sizes="340px" className="object-cover" />
              {moments.length > 0 && (
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-pill bg-brand px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-glow">
                  <span className="size-1.5 rounded-full bg-white live-dot" />
                  {moments.length} no momento
                </span>
              )}
            </div>
            <div className="p-5">
              <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                {typeLabel[place.type]}
              </span>
              <h2 className="mt-2 text-xl font-black text-text">{place.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-text-soft">
                <Star className="size-3.5 fill-warn text-warn" />
                {place.rating.toFixed(1)} ({place.reviewCount} avaliações)
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 py-2 text-xs font-bold text-text hover:border-brand/40">
                  <Edit3 className="size-3.5" />
                  Editar
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-brand hover:border-brand">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Contato</h3>
            <ul className="flex flex-col gap-3">
              <DataRow icon={MapPin} label="Endereço" value={place.address} />
              <DataRow icon={Phone} label="WhatsApp" value="(11) 99999-1234" />
              {place.instagram && <DataRow icon={Instagram} label="Instagram" value={place.instagram} />}
              <DataRow icon={Building2} label="Capacidade" value="350 pessoas" />
              <DataRow icon={Crown} label="Plano" value="Premium Casa+" />
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
              Demografia no período
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Homens" value={String(totalGender.m)} color="#3b82f6" />
              <Stat label="Mulheres" value={String(totalGender.f)} color="#ec4899" />
              <Stat label="Outros" value={String(totalGender.o)} color="#a855f7" />
            </div>
          </div>
        </aside>

        <main className="flex flex-col gap-4">
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard icon={UserCheck} label="Check-ins" value={String(rows.length)} color="#22c55e" index={0} />
            <KpiCard icon={Users} label="Presentes agora" value={String(place.presentNow)} color="#3b82f6" index={1} />
            <KpiCard icon={Flame} label="Pico do mês" value="412" delta={{ value: 18, sign: "up" }} color="#ef2c39" index={2} />
            <KpiCard icon={TrendingUp} label="Crescimento" value="+24%" color="#a855f7" index={3} />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-sm font-bold text-text">Check-ins diários</h2>
              <DateRangeFilter value={range} onChange={(v) => setRange(v)} />
            </div>
            <BarChart data={checkinsByDay.slice(-days)} color="#3b82f6" height={200} />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">Usuários que fizeram check-in</h2>
                <p className="text-xs text-muted">
                  {rows.length} check-ins {range === "today" ? "hoje" : `nos últimos ${days} dias`} · clique pra ver o perfil
                </p>
              </div>
              <div className="flex h-10 w-full items-center gap-2 rounded-pill border border-border bg-surface-2 px-3 sm:w-72">
                <Search className="size-4 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nome..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </div>
            </div>

            <DataTable columns={columns} data={rows} rowKey={(r) => r.id} pageSize={10} emptyText="Sem check-ins neste período" />
          </section>
        </main>
      </section>
    </PanelLayout>
  );
}

function DataRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted" />
      <span className="text-muted">{label}:</span>
      <span className="ml-auto truncate text-right text-text">{value}</span>
    </li>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-center">
      <p className="text-xl font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}
