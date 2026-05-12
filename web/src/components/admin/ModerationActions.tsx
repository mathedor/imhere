"use client";

import { Check, ShieldOff, X } from "lucide-react";
import { useState, useTransition } from "react";
import { resolveReportAction } from "@/lib/actions/moderation-reports";

export function ModerationActions({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<string | null>(null);

  function handle(resolution: "reviewed" | "dismissed" | "actioned") {
    startTransition(async () => {
      await resolveReportAction(reportId, resolution);
      setResolved(resolution);
    });
  }

  if (resolved) {
    return (
      <p className="mt-2 text-center text-xs font-bold text-success">
        ✓ Marcado como {resolved}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handle("actioned")}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
      >
        <ShieldOff className="size-3.5" />
        Banir / agir
      </button>
      <button
        onClick={() => handle("reviewed")}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-success/15 px-3 py-1.5 text-xs font-bold text-success transition-colors hover:bg-success hover:text-white disabled:opacity-50"
      >
        <Check className="size-3.5" />
        Revisado
      </button>
      <button
        onClick={() => handle("dismissed")}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-1.5 text-xs font-bold text-text-soft transition-colors hover:text-text disabled:opacity-50"
      >
        <X className="size-3.5" />
        Dispensar
      </button>
    </div>
  );
}
