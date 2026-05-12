import type { HeatmapCell } from "@/lib/db/admin-indices";
import { DAY_LABELS } from "@/lib/db/admin-indices";

interface Props {
  cells: HeatmapCell[];
  /** Cor base hex pra interpolar (default vermelho da brand) */
  color?: string;
  /** Mostra labels de hora (top axis). Default true. */
  showHourLabels?: boolean;
}

function rgbaFromHex(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Heatmap({ cells, color = "#ef2c39", showHourLabels = true }: Props) {
  const max = Math.max(...cells.map((c) => c.count), 1);

  // Grid 7 dias × 24 horas
  // cells: array com 168 entradas, indexado por day*24 + hour
  const grid: HeatmapCell[][] = Array.from({ length: 7 }, () => []);
  for (const c of cells) {
    if (grid[c.day]) grid[c.day][c.hour] = c;
  }

  // Total por linha (dia) e por coluna (hora)
  const dayTotals = grid.map((row) => row.reduce((a, c) => a + (c?.count ?? 0), 0));
  const hourTotals = Array.from({ length: 24 }, (_, h) => cells.filter((c) => c.hour === h).reduce((a, c) => a + c.count, 0));

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header com horas */}
        {showHourLabels && (
          <div className="mb-1 flex items-center gap-[2px] pl-12">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="flex-1 min-w-[16px] text-center text-[0.55rem] text-muted"
                style={{ visibility: h % 3 === 0 ? "visible" : "hidden" }}
              >
                {String(h).padStart(2, "0")}h
              </div>
            ))}
            <div className="w-12 text-right text-[0.55rem] font-bold text-muted">total</div>
          </div>
        )}

        {/* Linhas (dias) */}
        {grid.map((row, dayIdx) => (
          <div key={dayIdx} className="mb-[2px] flex items-center gap-[2px]">
            <div className="w-12 shrink-0 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              {DAY_LABELS[dayIdx]}
            </div>
            {row.map((cell, hourIdx) => {
              const intensity = cell?.count ? Math.max(0.1, cell.count / max) : 0;
              const bg = intensity > 0 ? rgbaFromHex(color, intensity) : "rgba(255,255,255,0.03)";
              return (
                <div
                  key={hourIdx}
                  title={`${DAY_LABELS[dayIdx]} ${String(hourIdx).padStart(2, "0")}h · ${cell?.count ?? 0} check-ins`}
                  className="flex-1 min-w-[16px] aspect-square rounded-sm border border-border/40 transition-all hover:scale-110 hover:z-10 hover:border-white/60"
                  style={{ background: bg }}
                />
              );
            })}
            <div className="w-12 text-right text-[0.65rem] font-bold text-text">
              {dayTotals[dayIdx]}
            </div>
          </div>
        ))}

        {/* Total por hora */}
        <div className="mt-1 flex items-center gap-[2px] pl-12">
          {hourTotals.map((t, h) => (
            <div
              key={h}
              className="flex-1 min-w-[16px] text-center text-[0.55rem] font-bold text-text-soft"
              style={{ visibility: h % 3 === 0 ? "visible" : "hidden" }}
            >
              {t}
            </div>
          ))}
          <div className="w-12 text-right text-[0.55rem] font-bold text-brand">
            {cells.reduce((a, c) => a + c.count, 0)}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[0.65rem] text-muted">Menos</span>
          {[0.1, 0.25, 0.5, 0.75, 1].map((i) => (
            <div
              key={i}
              className="size-3 rounded-sm border border-border/40"
              style={{ background: rgbaFromHex(color, i) }}
            />
          ))}
          <span className="text-[0.65rem] text-muted">Mais</span>
          <span className="ml-auto text-[0.65rem] text-text-soft">
            Máx: <strong className="text-text">{max}</strong> check-ins/hora
          </span>
        </div>
      </div>
    </div>
  );
}
