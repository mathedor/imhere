"use client";

import { Send, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { submitNpsAction } from "@/lib/actions/sprint4";

const STORAGE_KEY = "imhere:nps:lastSeen";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface Props {
  conversationId?: string | null;
  /** Atraso em ms antes de aparecer (default 8s) */
  delayMs?: number;
}

export function NpsPrompt({ conversationId = null, delayMs = 8000 }: Props) {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < COOLDOWN_MS) return;
      }
    } catch {
      // ignore storage errors
    }
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  function rememberSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  function close() {
    rememberSeen();
    setVisible(false);
  }

  function submit() {
    if (score === null) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("score", String(score));
      fd.append("feedback", feedback);
      if (conversationId) fd.append("conversationId", conversationId);
      await submitNpsAction(fd);
      rememberSeen();
      setSubmitted(true);
      window.setTimeout(() => setVisible(false), 1500);
    });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 w-[min(92vw,360px)] rounded-2xl border border-border bg-surface p-4 shadow-2xl md:bottom-6">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-text">Como foi sua experiência?</p>
          <p className="text-[0.65rem] text-text-soft">Sua nota ajuda a melhorar o app</p>
        </div>
        <button
          onClick={close}
          aria-label="Fechar"
          className="grid size-7 place-items-center rounded-xl text-text-soft transition-colors hover:bg-surface-2 hover:text-text"
        >
          <X className="size-4" />
        </button>
      </div>

      {submitted ? (
        <p className="py-4 text-center text-sm font-bold text-success">
          Obrigado pelo feedback ❤
        </p>
      ) : (
        <>
          <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1">
            {Array.from({ length: 11 }, (_, i) => {
              const active = score === i;
              return (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow"
                      : "border border-border bg-bg/40 text-text-soft hover:border-brand/40 hover:text-text"
                  }`}
                >
                  {i}
                </button>
              );
            })}
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="O que motivou sua nota? (opcional)"
            rows={2}
            className="mb-3 w-full resize-none rounded-xl border border-border bg-bg/40 px-3 py-2 text-xs text-text placeholder:text-muted focus:border-brand/40 focus:outline-none"
          />

          <button
            onClick={submit}
            disabled={score === null || pending}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 py-2 text-xs font-bold text-white shadow-glow transition-opacity disabled:opacity-50"
          >
            <Send className="size-3.5" />
            {pending ? "Enviando…" : "Enviar"}
          </button>
        </>
      )}
    </div>
  );
}
