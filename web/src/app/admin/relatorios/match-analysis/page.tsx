import { getAggregateAcceptanceByGender } from "@/lib/db/match-analysis";

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

export default async function AdminMatchAnalysisPage() {
  const rows = await getAggregateAcceptanceByGender();
  const totalReceived = rows.reduce((acc, r) => acc + r.totalReceived, 0);
  const totalAccepted = rows.reduce((acc, r) => acc + r.accepted, 0);
  const overallPct = totalReceived > 0 ? Math.round((totalAccepted / totalReceived) * 100) : 0;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Aceitação por gênero (agregado)
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Quem recebe mais contatos e quem aceita mais · base de toda a plataforma
        </p>
      </header>

      <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Recebidos</p>
          <p className="mt-1 text-2xl font-black text-text">{totalReceived.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Aceitos</p>
          <p className="mt-1 text-2xl font-black text-text">{totalAccepted.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-brand">Taxa geral</p>
          <p className="mt-1 text-2xl font-black text-brand">{overallPct}%</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-soft">Sem dados ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                  <th className="px-3 py-2">Gênero</th>
                  <th className="px-3 py-2 text-right">Recebidos</th>
                  <th className="px-3 py-2 text-right">Aceitos</th>
                  <th className="px-3 py-2 text-right">% aceite</th>
                  <th className="px-3 py-2">Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const color = GENDER_COLOR[r.gender] ?? "#6b6b75";
                  const label = GENDER_LABEL[r.gender] ?? r.gender;
                  return (
                    <tr key={r.gender} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ background: color }}
                          />
                          <span className="font-bold text-text">{label}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-text">
                        {r.totalReceived.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-text-soft">
                        {r.accepted.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-3 text-right font-black" style={{ color }}>
                        {r.acceptedPct}%
                      </td>
                      <td className="px-3 py-3">
                        <div className="h-2 overflow-hidden rounded-pill bg-surface-3">
                          <div
                            className="h-full"
                            style={{
                              width: `${r.acceptedPct}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
