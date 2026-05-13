"use client";

import { Zap } from "lucide-react";
import { useState, useTransition } from "react";
import { buyEstabBoostAction } from "@/lib/actions/sprint4";

const REASONS = [
  { value: "banda", label: "Banda começa agora" },
  { value: "happy_hour", label: "Happy hour" },
  { value: "show_especial", label: "Show especial" },
  { value: "outro", label: "Outro motivo" },
];

const COST = 50;

export function BoostButton({ balance }: { balance: number }) {
  const [reason, setReason] = useState(REASONS[0].value);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const enough = balance >= COST;

  function handle() {
    setFeedback(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("reason", reason);
      const res = await buyEstabBoostAction(fd);
      if (res.ok) {
        setFeedback({ ok: true, msg: "Boost ativado · seu estab aparece no topo por 1 hora 🚀" });
      } else {
        setFeedback({ ok: false, msg: res.error ?? "Falha ao comprar boost" });
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
          <Zap className="size-5" />
        </span>
        <div>
          <p className="text-sm font-black text-text">Comprar boost</p>
          <p className="text-[0.65rem] text-text-soft">
            {COST} créditos · 1 hora no topo da busca
          </p>
        </div>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-widest text-muted">
          Motivo
        </span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg/40 px-3 py-2.5 text-sm text-text focus:border-brand/40 focus:outline-none"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={handle}
        disabled={pending || !enough}
        className="flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition-opacity disabled:opacity-50"
      >
        <Zap className="size-4" />
        {pending ? "Ativando…" : `Comprar boost · ${COST} créditos`}
      </button>

      {!enough && (
        <p className="mt-3 text-center text-xs font-bold text-brand">
          Saldo insuficiente · faltam {COST - balance} créditos
        </p>
      )}

      {feedback && (
        <p
          className={`mt-3 text-center text-xs font-bold ${
            feedback.ok ? "text-success" : "text-brand"
          }`}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
}
