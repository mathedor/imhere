import { ArrowLeft, CheckCircle2, Clock, Heart, XCircle } from "lucide-react";
import Link from "next/link";
import { getMyMatchStats } from "@/lib/db/match-analysis";

export const dynamic = "force-dynamic";

const GENDER_LABEL: Record<string, string> = {
  male: "Masculino",
  female: "Feminino",
  other: "Outro",
  na: "Não informado",
};

const GENDER_COLOR: Record<string, string> = {
  male: "#3b82f6",
  female: "#ef2c39",
  other: "#a855f7",
  na: "#6b6b75",
};

export default async function MyMatchAnalysisPage() {
  const stats = await getMyMatchStats();
  const acceptedTotal = stats.accepted || 1;
  const byGender = Object.entries(stats.acceptedByGender).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-5">
      <header className="mb-6">
        <Link
          href="/app/perfil"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-text-soft transition-colors hover:text-text"
        >
          <ArrowLeft className="size-3.5" />
          Voltar ao perfil
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Análise do seu match
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Como anda sua taxa de aceite · só você vê esse painel
        </p>
      </header>

      {/* Hero card */}
      <section className="mb-5 overflow-hidden rounded-2xl border border-brand/40 bg-gradient-to-br from-brand/20 via-surface to-surface p-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-brand">
          Seu aceite
        </p>
        <p className="mt-2 text-6xl font-black text-brand md:text-7xl">
          {stats.acceptedPct}%
        </p>
        <p className="mt-2 text-sm text-text-soft">
          {stats.accepted} aceites em {stats.accepted + stats.rejected} respostas
        </p>
        {stats.ranking && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-1 text-[0.65rem] font-bold text-text">
            Top {stats.ranking.percentile}% · #{stats.ranking.position} de{" "}
            {stats.ranking.total.toLocaleString("pt-BR")}
          </p>
        )}
      </section>

      {/* Breakdown */}
      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card icon={<Heart className="size-4" />} label="Enviados" value={stats.sent} color="#6b6b75" />
        <Card
          icon={<CheckCircle2 className="size-4" />}
          label="Aceitos"
          value={stats.accepted}
          color="#22c55e"
        />
        <Card
          icon={<XCircle className="size-4" />}
          label="Recusados"
          value={stats.rejected}
          color="#ef2c39"
        />
        <Card
          icon={<Clock className="size-4" />}
          label="Pendentes"
          value={stats.pending}
          color="#f59e0b"
        />
      </section>

      {/* Aceites por gênero */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold text-text">Aceites por gênero</h2>
        {stats.accepted === 0 ? (
          <p className="py-6 text-center text-xs text-text-soft">
            Ainda sem aceites · continue mandando match
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {byGender.map(([g, n]) => {
              if (n === 0) return null;
              const color = GENDER_COLOR[g] ?? "#6b6b75";
              const label = GENDER_LABEL[g] ?? g;
              const pct = Math.round((n / acceptedTotal) * 100);
              return (
                <div key={g} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: color }} />
                      <span className="font-bold text-text">{label}</span>
                    </span>
                    <span className="text-text-soft">
                      <strong className="text-text">{n}</strong> · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-pill bg-surface-3">
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <span
        className="grid size-7 place-items-center rounded-xl"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </span>
      <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-text">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}
