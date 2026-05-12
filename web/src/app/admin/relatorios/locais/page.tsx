import Link from "next/link";
import { Building2, Users, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getLocalsByEstabs,
  getLocalsByUsers,
  getLocalsByCheckins,
  type LocalRow,
} from "@/lib/db/admin-indices";
import type { Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(v?: string): Period {
  if (v === "today" || v === "7d" || v === "30d") return v;
  return "30d";
}

function CitySection({
  title,
  subtitle,
  icon: Icon,
  color,
  rows,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  rows: LocalRow[];
}) {
  const total = rows.reduce((a, r) => a + r.count, 0) || 1;
  const top = rows.slice(0, 10);
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="grid size-10 place-items-center rounded-xl"
          style={{ background: `${color}25`, color }}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">{title}</h2>
          <p className="text-[0.65rem] text-text-soft">{subtitle}</p>
        </div>
      </div>
      {top.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-soft">Sem dados.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {top.map((r, i) => {
            const pct = (r.count / total) * 100;
            return (
              <li key={`${r.city}|${r.state}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text">
                    #{i + 1} {r.city}
                    <span className="ml-1 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                      {r.state}
                    </span>
                  </span>
                  <span className="font-bold text-text">
                    {r.count.toLocaleString("pt-BR")}{" "}
                    <span className="text-[0.65rem] text-text-soft">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg/40">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);

  const [byEstabs, byUsers, byCheckins] = await Promise.all([
    getLocalsByEstabs(),
    getLocalsByUsers(),
    getLocalsByCheckins(period),
  ]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Locais agregados</h1>
        <p className="mt-1 text-sm text-text-soft">
          Cidades com mais estabelecimentos, usuários e check-ins
        </p>
      </header>

      <div className="mb-5 flex items-center gap-2">
        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
          Período (check-ins):
        </span>
        {(["today", "7d", "30d"] as const).map((p) => (
          <Link
            key={p}
            href={p === "30d" ? "?" : `?period=${p}`}
            className={`rounded-pill px-3 py-1.5 text-xs font-bold ${
              period === p
                ? "bg-gradient-to-r from-brand-strong to-brand text-white shadow-glow"
                : "border border-border bg-surface text-text-soft hover:text-text"
            }`}
          >
            {p === "today" ? "Hoje" : p === "7d" ? "7 dias" : "30 dias"}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CitySection
          title="Mais estabelecimentos"
          subtitle="Distribuição da base cadastrada"
          icon={Building2}
          color="#3b82f6"
          rows={byEstabs}
        />
        <CitySection
          title="Mais usuários"
          subtitle="Onde está nossa base ativa"
          icon={Users}
          color="#a855f7"
          rows={byUsers}
        />
        <CitySection
          title="Mais check-ins"
          subtitle="Onde a galera tá indo no período"
          icon={MapPin}
          color="#22c55e"
          rows={byCheckins}
        />
      </div>
    </>
  );
}
