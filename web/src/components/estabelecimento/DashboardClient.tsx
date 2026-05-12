"use client";

import {
  ArrowRight,
  Camera,
  Crown,
  Gift,
  Instagram,
  MessageCircle,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarChart } from "@/components/panel/BarChart";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { KpiCard } from "@/components/panel/KpiCard";
import { checkinsByDay } from "@/data/analytics";

interface Props {
  presentNow: number;
  presentByGender: { male: number; female: number; other: number };
  checkinsToday: number;
  momentsActive: number;
  rating: number;
  instagram?: string;
}

export function EstablishmentDashboardClient({
  presentNow,
  presentByGender,
  checkinsToday,
  momentsActive,
  rating,
  instagram,
}: Props) {
  const [range, setRange] = useState("30d");

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">Visão geral</span>
        <DateRangeFilter value={range as "30d"} onChange={(v) => setRange(v)} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={UserCheck}
          label="Check-ins hoje"
          value={String(checkinsToday)}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={Users}
          label="Presentes agora"
          value={String(presentNow)}
          color="#3b82f6"
          index={1}
        />
        <KpiCard
          icon={Camera}
          label="No Momento ativos"
          value={String(momentsActive)}
          color="#a855f7"
          index={2}
        />
        <KpiCard
          icon={Star}
          label="Avaliação"
          value={rating.toFixed(1)}
          color="#f59e0b"
          index={3}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/estabelecimento/momento"
          icon={Camera}
          title="Postar No Momento"
          desc={`${momentsActive} story${momentsActive !== 1 ? "s" : ""} ativo${momentsActive !== 1 ? "s" : ""}`}
          color="#ef2c39"
          accent
        />
        <QuickAction
          href="/estabelecimento/pessoas"
          icon={Users}
          title="Ver presentes agora"
          desc={`${presentNow} pessoas no local`}
          color="#3b82f6"
        />
        <QuickAction
          href="/estabelecimento/cortesias"
          icon={Gift}
          title="Enviar cortesia"
          desc="Drink, desconto, convite"
          color="#a855f7"
        />
        <QuickAction
          href="/estabelecimento/premium-casa"
          icon={Crown}
          title="Premium da Casa"
          desc="Libere chat grátis aqui"
          color="#f59e0b"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Check-ins por dia</h2>
              <p className="text-[0.7rem] text-muted">Últimos 30 dias</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-bold text-success">
              <TrendingUp className="size-3" />
              Histórico
            </div>
          </div>
          <BarChart data={checkinsByDay} color="#3b82f6" height={220} />
        </div>

        <div className="flex flex-col gap-4">
          {instagram && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-bold text-text">Conexões sociais</h2>
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-3 transition-colors hover:border-brand/40"
              >
                <div
                  className="grid size-10 place-items-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
                >
                  <Instagram className="size-5" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-xs font-bold text-text">{instagram}</p>
                  <p className="text-[0.65rem] text-muted">Aparece no app dos clientes</p>
                </div>
                <ArrowRight className="size-4 text-muted" />
              </a>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-text">Distribuição por gênero</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              <GenderRow label="Mulheres" value={presentByGender.female} total={presentNow} color="#ec4899" />
              <GenderRow label="Homens" value={presentByGender.male} total={presentNow} color="#3b82f6" />
              <GenderRow label="Outros" value={presentByGender.other} total={presentNow} color="#a855f7" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Mensagens recentes</h2>
          <Link href="/estabelecimento/cortesias" className="text-xs font-bold text-brand hover:underline">
            Ver todas →
          </Link>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            { who: "Mariana C.", msg: "Pode ser uma mesa pra 3?", time: "22:14" },
            { who: "Lucas A.", msg: "Aceito a cortesia, vou pegar!", time: "22:08" },
            { who: "Beatriz L.", msg: "Tem fila no momento?", time: "21:58" },
          ].map((m) => (
            <li key={m.who} className="flex items-start gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                <MessageCircle className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text">{m.who}</span>
                  <span className="text-[0.65rem] text-muted">{m.time}</span>
                </div>
                <p className="truncate text-xs text-text-soft">{m.msg}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  desc,
  color,
  accent,
}: {
  href: string;
  icon: typeof Camera;
  title: string;
  desc: string;
  color: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border bg-surface p-4 transition-all hover:-translate-y-0.5 ${
        accent ? "border-brand/40 shadow-glow" : "border-border hover:border-brand/40"
      }`}
    >
      <div className="mb-3 grid size-10 place-items-center rounded-xl" style={{ background: `${color}25`, color }}>
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-extrabold text-text">{title}</p>
      <p className="mt-0.5 text-[0.7rem] text-text-soft">{desc}</p>
      <ArrowRight className="absolute right-4 top-4 size-4 text-muted transition-transform group-hover:translate-x-1" />
      <span
        className="pointer-events-none absolute -right-12 -bottom-12 size-32 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
    </Link>
  );
}

function GenderRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-soft">{label}</span>
        <span className="font-bold text-text">
          {value} <span className="text-muted">· {pct.toFixed(0)}%</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  );
}
