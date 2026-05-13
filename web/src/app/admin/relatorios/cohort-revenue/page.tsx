import { getRevenueCohorts } from "@/lib/db/admin-cohorts";

export const dynamic = "force-dynamic";

function brl(cents: number): string {
  if (!cents) return "R$ 0";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function CohortRevenuePage() {
  const cohorts = await getRevenueCohorts(6);
  const maxCols = cohorts.reduce((m, c) => Math.max(m, c.revenueByMonthCents.length), 0);
  const maxRev = cohorts.reduce(
    (m, c) => Math.max(m, ...c.revenueByMonthCents),
    1
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          LTV por safra de signup
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Receita acumulada por mês desde o signup · últimas 6 safras
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
                    Usuários
                  </th>
                  {Array.from({ length: maxCols }, (_, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-center text-[0.65rem] font-bold uppercase tracking-widest text-muted"
                    >
                      M{i}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-[0.65rem] font-bold uppercase tracking-widest text-brand">
                    LTV total
                  </th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.cohortLabel}>
                    <td className="sticky left-0 z-10 whitespace-nowrap rounded-lg bg-bg/40 px-3 py-2 font-bold text-text">
                      {c.cohortLabel}
                    </td>
                    <td className="rounded-lg bg-bg/40 px-3 py-2 font-semibold text-text-soft">
                      {c.userCount.toLocaleString("pt-BR")}
                    </td>
                    {Array.from({ length: maxCols }, (_, i) => {
                      const cents = c.revenueByMonthCents[i];
                      if (cents === undefined) {
                        return <td key={i} className="rounded-lg bg-surface-2/30" />;
                      }
                      const intensity = Math.min(1, cents / maxRev);
                      return (
                        <td
                          key={i}
                          className="rounded-lg text-center font-bold"
                          style={{
                            background: `rgba(34, 197, 94, ${0.08 + intensity * 0.5})`,
                            color: intensity > 0.5 ? "#fff" : undefined,
                          }}
                        >
                          <span className="block px-2 py-2">{brl(cents)}</span>
                        </td>
                      );
                    })}
                    <td className="rounded-lg bg-brand/15 px-3 py-2 text-right font-black text-brand">
                      {brl(c.ltvCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
