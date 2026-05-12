"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
        <AlertTriangle className="size-8" />
      </div>
      <h2 className="text-2xl font-black text-text">Algo quebrou no painel admin</h2>
      <p className="max-w-sm text-sm text-text-soft">
        {error.message || "Erro inesperado ao carregar o dashboard."}
      </p>
      {error.digest && (
        <p className="rounded-pill bg-surface-2 px-3 py-1 text-[0.65rem] font-mono text-muted">
          ref: {error.digest}
        </p>
      )}
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong to-brand px-5 py-3 text-sm font-bold text-white shadow-glow"
      >
        <RefreshCw className="size-4" />
        Tentar de novo
      </button>
    </div>
  );
}
