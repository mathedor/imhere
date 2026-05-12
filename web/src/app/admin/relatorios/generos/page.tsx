import { Users } from "lucide-react";
import { getGenderReport } from "@/lib/db/admin-reports";

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

function GenderBars({
  data,
  total,
}: {
  data: { male: number; female: number; other: number; na: number };
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      {GENDER_META.map((g) => {
        const value = data[g.key];
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
  );
}

export default async function GenderReportPage() {
  let data;
  try {
    data = await getGenderReport();
  } catch (err) {
    console.error("[admin/relatorios/generos] erro:", err);
    data = {
      registered: { male: 0, female: 0, other: 0, na: 0 },
      online: { male: 0, female: 0, other: 0, na: 0 },
    };
  }

  const totalRegistered = Object.values(data.registered).reduce((a, b) => a + b, 0);
  const totalOnline = Object.values(data.online).reduce((a, b) => a + b, 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Distribuição por gênero
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Cadastros totais e usuários online agora — comparativo lado a lado
        </p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <header className="mb-4 flex items-center gap-2">
            <Users className="size-4 text-brand" />
            <h2 className="text-sm font-bold text-text">Cadastros</h2>
          </header>
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
            {fmtNumber(totalRegistered)} total
          </p>
          <GenderBars data={data.registered} total={totalRegistered} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <header className="mb-4 flex items-center gap-2">
            <Users className="size-4 text-brand" />
            <h2 className="text-sm font-bold text-text">Online agora</h2>
          </header>
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
            {fmtNumber(totalOnline)} online
          </p>
          <GenderBars data={data.online} total={totalOnline} />
        </div>
      </section>
    </>
  );
}
