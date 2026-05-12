"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { createModerationReportAction } from "@/lib/actions/moderation-reports";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<{
  key: "harassment" | "spam" | "fake" | "offensive" | "safety" | "other";
  label: string;
  desc: string;
}> = [
  { key: "harassment", label: "Assédio", desc: "Insistência, ameaça ou conteúdo sexual indesejado" },
  { key: "offensive", label: "Ofensa", desc: "Xingamento, racismo, preconceito" },
  { key: "spam", label: "Spam / Golpe", desc: "Tentativa de venda, link suspeito" },
  { key: "fake", label: "Perfil falso", desc: "Foto de outra pessoa, identidade duvidosa" },
  { key: "safety", label: "Risco real", desc: "Algo grave acontecendo — vamos priorizar" },
  { key: "other", label: "Outro", desc: "Descreva o problema" },
];

interface Props {
  reportedProfileId?: string;
  conversationId?: string;
  className?: string;
}

export function ReportButton({ reportedProfileId, conversationId, className }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<typeof CATEGORIES[number]["key"] | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!category) return;
    setSubmitting(true);
    const result = await createModerationReportAction({
      reportedProfileId,
      conversationId,
      category,
      description: description.trim() || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setCategory(null);
        setDescription("");
      }, 1800);
    } else {
      alert(result.error ?? "Erro ao enviar denúncia");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "grid size-9 place-items-center rounded-full text-text-soft transition-colors hover:bg-brand/10 hover:text-brand",
          className
        )}
        title="Denunciar"
        aria-label="Denunciar"
      >
        <ShieldAlert className="size-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface"
            >
              <header className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
                    <ShieldAlert className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text">Denunciar</h3>
                    <p className="text-[0.65rem] text-text-soft">
                      Sua denúncia é anônima · revisamos em até 12h
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="grid size-9 place-items-center rounded-full text-muted hover:text-text"
                >
                  <X className="size-4" />
                </button>
              </header>

              {done ? (
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="grid size-16 place-items-center rounded-3xl bg-success/15 text-success"
                  >
                    <CheckCircle2 className="size-8" />
                  </motion.div>
                  <h4 className="text-lg font-black text-text">Denúncia enviada</h4>
                  <p className="text-sm text-text-soft">
                    Time de moderação revisa em até 12h.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  <p className="text-xs text-text-soft">
                    O que aconteceu? (escolhe a categoria que melhor descreve)
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {CATEGORIES.map((c) => {
                      const active = category === c.key;
                      return (
                        <button
                          key={c.key}
                          onClick={() => setCategory(c.key)}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                            active
                              ? "border-brand bg-brand/10 shadow-glow"
                              : "border-border bg-surface-2 hover:border-brand/40"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                              active ? "bg-brand text-white" : "bg-surface text-brand"
                            )}
                          >
                            <AlertTriangle className="size-3.5" />
                          </div>
                          <div className="flex-1 leading-tight">
                            <p className="text-sm font-bold text-text">{c.label}</p>
                            <p className="text-[0.65rem] text-text-soft">{c.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes (opcional)"
                    rows={3}
                    maxLength={500}
                    className="resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none placeholder:text-muted focus:border-brand/60"
                  />

                  <button
                    onClick={submit}
                    disabled={!category || submitting}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all",
                      category && !submitting
                        ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                        : "bg-surface-2 text-muted"
                    )}
                  >
                    {submitting ? "Enviando..." : "Enviar denúncia"}
                  </button>

                  <p className="text-center text-[0.6rem] text-muted">
                    Em casos de risco real à vida, ligue 190 (Polícia) ou 180 (mulheres).
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
