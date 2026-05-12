"use client";

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    console.error("[admin error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
        <AlertTriangle className="size-8" />
      </div>
      <h2 className="text-2xl font-black text-text">Algo quebrou no painel admin</h2>
      <p className="max-w-md text-sm text-text-soft">
        {error.message || "Erro inesperado ao carregar o dashboard."}
      </p>
      {error.digest && (
        <p className="rounded-pill bg-surface-2 px-3 py-1 text-[0.65rem] font-mono text-muted">
          digest: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong to-brand px-5 py-3 text-sm font-bold text-white shadow-glow"
        >
          <RefreshCw className="size-4" />
          Tentar de novo
        </button>
        <Link
          href="/admin/usuarios"
          className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-text hover:border-brand/40"
        >
          <ArrowLeft className="size-4" />
          Usuários
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-text hover:border-brand/40"
        >
          <Home className="size-4" />
          Voltar pra home
        </Link>
      </div>

      {error.stack && (
        <details
          className="mt-4 w-full max-w-xl rounded-2xl border border-border bg-surface/40 p-3 text-left"
          open={showStack}
          onToggle={(e) => setShowStack((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer text-xs font-bold text-muted">
            Stack trace (debug)
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto text-[0.65rem] text-text-soft">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
