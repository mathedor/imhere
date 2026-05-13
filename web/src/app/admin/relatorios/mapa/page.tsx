import { MapPin, Users } from "lucide-react";
import { MapView } from "@/components/admin/MapView";
import { getMapData } from "@/lib/db/match-analysis";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const { markers, heat } = await getMapData();
  const top5 = [...heat]
    .sort((a, b) => b.userCount + b.estabCount * 10 - (a.userCount + a.estabCount * 10))
    .slice(0, 5);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Mapa de calor</h1>
        <p className="mt-1 text-sm text-text-soft">
          Estabs + densidade de usuários por cidade · vermelho indica momento ativo
        </p>
      </header>

      <section className="mb-6">
        <MapView markers={markers} heat={heat} />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold text-text">Top 5 cidades em volume</h2>
        {top5.length === 0 ? (
          <p className="py-6 text-center text-xs text-text-soft">Sem dados ainda</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {top5.map((c, i) => (
              <div
                key={`${c.city}-${c.state}`}
                className="rounded-xl border border-border/60 bg-bg/30 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="grid size-7 place-items-center rounded-full text-[0.65rem] font-black text-white"
                    style={{ background: ["#ef2c39", "#f59e0b", "#a855f7", "#3b82f6", "#22c55e"][i] }}
                  >
                    #{i + 1}
                  </span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-muted">
                    {c.state}
                  </span>
                </div>
                <p className="text-base font-black text-text">{c.city}</p>
                <div className="mt-2 flex items-center gap-3 text-[0.65rem] text-text-soft">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {c.userCount.toLocaleString("pt-BR")} usuários
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {c.estabCount} estabs
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
