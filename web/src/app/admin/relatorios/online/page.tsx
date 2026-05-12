import { Activity, Users, MapPin } from "lucide-react";
import { KpiCard } from "@/components/panel/KpiCard";
import { getOnlineUsersReport } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

const GENDER_META: Array<{ key: "female" | "male" | "other" | "na"; label: string; color: string }> = [
  { key: "female", label: "Mulheres", color: "#ec4899" },
  { key: "male", label: "Homens", color: "#3b82f6" },
  { key: "other", label: "Outros", color: "#a855f7" },
  { key: "na", label: "Não informado", color: "#6b6b75" },
];

function fmtNumber(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

export default async function OnlineReportPage() {
  let data;
  try {
    data = await getOnlineUsersReport();
  } catch (err) {
    console.error("[admin/relatorios/online] erro:", err);
    data = { total: 0, byGender: { male: 0, female: 0, other: 0, na: 0 }, byCity: [] };
  }

  const total = data.total;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Usuários online agora
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Snapshot em tempo real · check-ins ativos no momento
        </p>
      </header>

      {/* KPI principal */}
      <section className="mb-6">
        <KpiCard
          icon={Activity}
          label="Total online agora"
          value={fmtNumber(total)}
          color="#ef2c39"
          index={0}
        />
      </section>

      {/* Breakdown por gênero */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center gap-2">
          <Users className="size-4 text-brand" />
          <h2 className="text-sm font-bold text-text">Distribuição por gênero</h2>
        </header>
        <div className="flex flex-col gap-3">
          {GENDER_META.map((g) => {
            const value = data.byGender[g.key];
            const pct = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={g.key} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-text-soft">{g.label}</span>
                  <span className="font-bold text-text">
                    {value.toLocaleString("pt-BR")}{" "}
                    <span className="text-muted">· {pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${g.color}, ${g.color}cc)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top cidades */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <header className="mb-4 flex items-center gap-2">
          <MapPin className="size-4 text-brand" />
          <h2 className="text-sm font-bold text-text">Top cidades agora</h2>
        </header>
        {data.byCity.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-soft">
            Nenhuma cidade com presença ativa no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {data.byCity.map((c, i) => {
              const pct = total > 0 ? (c.count / total) * 100 : 0;
              return (
                <div
                  key={c.city}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5"
                >
                  <span className="text-[0.7rem] font-black text-muted">#{i + 1}</span>
                  <span className="flex-1 truncate text-sm font-bold text-text">{c.city}</span>
                  <span className="text-sm font-black text-brand">{c.count}</span>
                  <span className="w-12 text-right text-[0.65rem] text-muted">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
