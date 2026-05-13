"use client";

import { Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import { reviewVerificationAction } from "@/lib/actions/verifications";

const REJECTION_REASONS = [
  "Selfie embaçada · envie nova",
  "Pessoa diferente do perfil",
  "Rosto não está visível",
  "Documento ilegível",
  "Outro · descreva",
];

export function VerificationReviewClient({ verificationId }: { verificationId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [customReason, setCustomReason] = useState("");

  function approve() {
    startTransition(async () => {
      await reviewVerificationAction(verificationId, "approved");
      setDone("approved");
    });
  }

  function reject(reason: string) {
    startTransition(async () => {
      await reviewVerificationAction(verificationId, "rejected", reason);
      setDone("rejected");
    });
  }

  if (done) {
    return (
      <p
        className={`text-center text-xs font-bold ${
          done === "approved" ? "text-success" : "text-brand"
        }`}
      >
        ✓ {done === "approved" ? "Aprovado" : "Recusado"}
      </p>
    );
  }

  if (showReasons) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
          Motivo da recusa
        </p>
        {REJECTION_REASONS.slice(0, 4).map((r) => (
          <button
            key={r}
            onClick={() => reject(r)}
            disabled={pending}
            className="rounded-lg bg-surface px-3 py-2 text-left text-xs text-text hover:bg-brand hover:text-white disabled:opacity-50"
          >
            {r}
          </button>
        ))}
        <input
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Motivo personalizado..."
          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-brand/60"
        />
        <button
          onClick={() => reject(customReason || "Outro motivo")}
          disabled={pending || !customReason}
          className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Recusar com motivo
        </button>
        <button
          onClick={() => setShowReasons(false)}
          className="text-[0.65rem] text-muted hover:text-text"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={approve}
        disabled={pending}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success/15 px-3 py-2 text-xs font-bold text-success hover:bg-success hover:text-white disabled:opacity-50"
      >
        <Check className="size-3.5" />
        Aprovar
      </button>
      <button
        onClick={() => setShowReasons(true)}
        disabled={pending}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand/15 px-3 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-white disabled:opacity-50"
      >
        <X className="size-3.5" />
        Recusar
      </button>
    </div>
  );
}
