import { Crown, Gift, Sparkles } from "lucide-react";
import type { LoyaltyProgressRow } from "@/lib/db/loyalty";

interface Props {
  programs: LoyaltyProgressRow[];
  estabName: string;
}

export function LoyaltyProgressCard({ programs, estabName }: Props) {
  return (
    <section className="rounded-3xl border border-warn/30 bg-gradient-to-br from-warn/10 via-brand/5 to-warn/10 p-5">
      <header className="mb-4 flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-warn to-brand text-white shadow-glow">
          <Gift className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-text">Programa de fidelidade</h2>
          <p className="text-[0.65rem] text-text-soft">Cada check-in te aproxima de uma recompensa</p>
        </div>
      </header>

      <ul className="flex flex-col gap-3">
        {programs.map((p) => (
          <li
            key={p.programId}
            className={`rounded-2xl border p-3 ${
              p.ready ? "border-warn bg-warn/10 shadow-glow" : "border-border bg-surface"
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="leading-tight">
                <p className="text-sm font-bold text-text">{p.programName}</p>
                <p className="text-[0.65rem] text-text-soft">
                  → <strong className="text-warn">{p.rewardLabel}</strong>
                </p>
              </div>
              {p.ready ? (
                <span className="flex items-center gap-1 rounded-pill bg-gradient-to-r from-warn to-brand px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-white shadow-glow">
                  <Crown className="size-3" />
                  Pronto!
                </span>
              ) : (
                <span className="text-xs font-bold text-text">
                  {p.checkinsDone}/{p.checkinsRequired}
                </span>
              )}
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${p.pct}%`,
                  background: p.ready
                    ? "linear-gradient(90deg, #f59e0b, #ef2c39)"
                    : "linear-gradient(90deg, #3b82f6, #a855f7)",
                }}
              />
            </div>
            {p.ready ? (
              <p className="mt-2 flex items-center gap-1 text-[0.65rem] font-bold text-warn">
                <Sparkles className="size-3" />
                Mostre essa tela no caixa do {estabName} pra resgatar
              </p>
            ) : (
              <p className="mt-1.5 text-[0.6rem] text-text-soft">
                Faltam {p.checkinsRequired - p.checkinsDone} check-in
                {p.checkinsRequired - p.checkinsDone !== 1 ? "s" : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
