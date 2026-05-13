import { getRetentionCohorts } from "@/lib/db/admin-cohorts";

export const dynamic = "force-dynamic";

function colorForPct(pct: number): string {
  // Blue (0%) → red (100%)
  if (pct <= 0) return "rgba(59, 130, 246, 0.08)";
  const t = Math.min(1, pct / 100);
  // Interpolate blue #3b82f6 → red #ef2c39
  const r = Math.round(59 + (239 - 59) * t);
  const g = Math.round(130 + (44 - 130) * t);
  const b = Math.round(246 + (57 - 246) * t);
  return `rgba(${r}, ${g}, ${b}, ${0.18 + t * 0.6})`;
}

export default async function CohortsPage() {
  const cohorts = await getRetentionCohorts(8);
  const maxCols = cohorts.reduce((m, c) => Math.max(m, c.retentionByWeek.length), 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Cohort de retenção
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          % de usuários que voltaram em cada semana após o cadastro · 8 semanas
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5">
        {cohorts.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-soft">Sem dados ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-surface px-3 py-2 text-left text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                    Safra
                  </th>
                  <th className="px-3 py-2 text-left text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                    Signups
                  </th>
                  {Array.from({ length: maxCols }, (_, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-center text-[0.65rem] font-bold uppercase tracking-widest text-muted"
                    >
                      S{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.cohortLabel}>
                    <td className="sticky left-0 z-10 whitespace-nowrap rounded-lg bg-bg/40 px-3 py-2 font-bold text-text">
                      {c.cohortLabel}
                    </td>
                    <td className="rounded-lg bg-bg/40 px-3 py-2 font-semibold text-text-soft">
                      {c.signupCount.toLocaleString("pt-BR")}
                    </td>
                    {Array.from({ length: maxCols }, (_, i) => {
                      const pct = c.retentionByWeek[i];
                      if (pct === undefined) {
                        return <td key={i} className="rounded-lg bg-surface-2/30" />;
                      }
                      return (
                        <td
                          key={i}
                          className="rounded-lg text-center font-bold text-text"
                          style={{
                            background: colorForPct(pct),
                            color: pct > 50 ? "#fff" : undefined,
                          }}
                        >
                          <span className="block px-2 py-2">{pct}%</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-3 text-[0.65rem] text-muted">
        Quanto mais vermelho, maior a retenção · cinza = sem dados
      </p>
    </>
  );
}
