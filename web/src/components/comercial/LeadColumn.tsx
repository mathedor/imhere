"use client";

import { ArrowLeft, ArrowRight, Phone, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { deleteLeadAction, updateLeadStageAction } from "@/lib/actions/leads";
import type { Lead } from "@/lib/db/leads";
import { STAGE_COLOR, STAGE_LABEL, STAGE_ORDER, type LeadStage } from "@/lib/db/leads-meta";
import { cn } from "@/lib/utils";

interface Props {
  stage: LeadStage;
  leads: Lead[];
  compact?: boolean;
}

function fmtMoney(cents: number): string {
  if (cents <= 0) return "—";
  if (cents >= 100_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(0)}`;
}

function nextStage(s: LeadStage): LeadStage | null {
  const i = STAGE_ORDER.indexOf(s);
  if (i < 0 || i >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[i + 1];
}

function prevStage(s: LeadStage): LeadStage | null {
  const i = STAGE_ORDER.indexOf(s);
  if (i <= 0) return null;
  return STAGE_ORDER[i - 1];
}

export function LeadColumn({ stage, leads, compact = false }: Props) {
  const color = STAGE_COLOR[stage];
  const totalForecast = leads.reduce(
    (a, l) => a + Math.round((l.expected_mrr_cents * (l.probability_pct ?? 0)) / 100),
    0
  );
  const isClosedLost = stage === "closed_lost";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-surface p-3",
        compact ? "border-border" : "border-border"
      )}
      style={!compact ? { borderTop: `3px solid ${color}` } : undefined}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: color }} />
          <h3 className="text-xs font-black uppercase tracking-widest text-text">
            {STAGE_LABEL[stage]}
          </h3>
        </div>
        <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.65rem] font-bold text-text-soft">
          {leads.length}
        </span>
      </header>

      {!compact && !isClosedLost && (
        <p className="text-[0.65rem] text-muted">
          Forecast: <span className="font-bold text-text">{fmtMoney(totalForecast)}</span>
        </p>
      )}

      {leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/40 py-6 text-center text-[0.7rem] text-muted">
          Sem leads aqui
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {leads.map((l) => {
            const next = nextStage(l.stage);
            const prev = prevStage(l.stage);
            return (
              <motion.li
                key={l.id}
                layout
                className="rounded-xl border border-border bg-surface-2 p-3"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-text leading-tight">{l.name}</p>
                  <span className="shrink-0 text-[0.65rem] font-black text-brand">
                    {fmtMoney(l.expected_mrr_cents)}
                  </span>
                </div>
                {(l.contact_name || l.city) && (
                  <p className="text-[0.65rem] text-text-soft">
                    {l.contact_name}
                    {l.city ? ` · ${l.city}${l.state ? "/" + l.state : ""}` : ""}
                  </p>
                )}
                {l.contact_phone && (
                  <p className="mt-0.5 flex items-center gap-1 text-[0.65rem] text-muted">
                    <Phone className="size-2.5" />
                    {l.contact_phone}
                  </p>
                )}
                {l.notes && (
                  <p className="mt-1.5 line-clamp-2 rounded-md bg-surface px-2 py-1 text-[0.65rem] text-text-soft">
                    {l.notes}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-1">
                  {prev && (
                    <form action={updateLeadStageAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="stage" value={prev} />
                      <button
                        type="submit"
                        className="grid size-6 place-items-center rounded-lg text-muted hover:bg-surface hover:text-text"
                        title={`Voltar pra ${STAGE_LABEL[prev]}`}
                      >
                        <ArrowLeft className="size-3" />
                      </button>
                    </form>
                  )}
                  {next && (
                    <form action={updateLeadStageAction} className="flex-1">
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="stage" value={next} />
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-1 rounded-pill bg-brand/15 px-2 py-1 text-[0.65rem] font-bold text-brand transition-colors hover:bg-brand/25"
                      >
                        Avançar pra {STAGE_LABEL[next]}
                        <ArrowRight className="size-3" />
                      </button>
                    </form>
                  )}
                  {stage !== "closed_lost" && (
                    <form action={updateLeadStageAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="stage" value="closed_lost" />
                      <button
                        type="submit"
                        className="grid size-6 place-items-center rounded-lg text-muted hover:bg-surface hover:text-brand"
                        title="Marcar como perdido"
                      >
                        <X className="size-3" />
                      </button>
                    </form>
                  )}
                  <form action={deleteLeadAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <button
                      type="submit"
                      className="grid size-6 place-items-center rounded-lg text-muted hover:bg-surface hover:text-brand"
                      title="Apagar lead"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </form>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
