"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { resolveAlertAction } from "@/lib/actions/sprint4";
import type { AdminAlert } from "@/lib/db/match-analysis";

const SEVERITY_STYLES: Record<AdminAlert["severity"], { bg: string; text: string; ring: string; label: string }> = {
  low: { bg: "bg-surface-2", text: "text-text-soft", ring: "ring-border", label: "Leve" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-500", ring: "ring-amber-500/30", label: "Médio" },
  high: { bg: "bg-orange-500/15", text: "text-orange-500", ring: "ring-orange-500/40", label: "Alto" },
  critical: { bg: "bg-brand/15", text: "text-brand", ring: "ring-brand/50", label: "Crítico" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function AdminAlertsClient({ alerts }: { alerts: AdminAlert[] }) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveAlertAction(id);
      setResolved((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    });
  }

  const visible = alerts.filter((a) => !resolved.has(a.id));

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-16 text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-success/15 text-success">
          <Check className="size-6" />
        </div>
        <p className="text-sm font-bold text-text">Tudo tranquilo</p>
        <p className="mt-1 text-xs text-text-soft">Nenhum alerta pendente no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((a) => {
        const style = SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.medium;
        return (
          <article
            key={a.id}
            className={`rounded-2xl border border-border bg-surface p-5 ring-1 ${style.ring}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${style.bg} ${style.text}`}>
                  <AlertTriangle className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-widest ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                      {a.kind}
                    </span>
                    <span className="text-[0.65rem] text-muted">· {timeAgo(a.createdAt)}</span>
                  </div>
                  <h3 className="text-sm font-black text-text">{a.title}</h3>
                  {a.body && <p className="mt-1 text-xs text-text-soft">{a.body}</p>}
                  {a.entityKind && (
                    <p className="mt-2 text-[0.65rem] text-muted">
                      <strong className="text-text-soft">Entidade:</strong> {a.entityKind}
                      {a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ""}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleResolve(a.id)}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-pill border border-border bg-bg/40 px-3 py-1.5 text-xs font-bold text-text-soft transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-50"
              >
                <Check className="size-3.5" />
                Resolver
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
