"use client";

import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { submitVerificationAction } from "@/lib/actions/verifications";

export function VerificationForm() {
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!selfieUrl) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("selfieUrl", selfieUrl);
    if (docUrl) fd.append("docUrl", docUrl);
    const result = await submitVerificationAction(fd);
    setSubmitting(false);
    if (result.ok) {
      setDone(true);
      setTimeout(() => window.location.reload(), 2000);
    } else {
      alert(result.error ?? "Erro ao enviar");
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-success/30 bg-success/10 p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <p className="mt-3 text-base font-bold text-text">Selfie enviada!</p>
        <p className="mt-1 text-xs text-text-soft">Vai pra análise · recarregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
          1. Sua selfie (obrigatória)
        </p>
        <PhotoUpload
          bucket="verifications"
          shape="square"
          label="Tirar / enviar selfie"
          defaultUrl={selfieUrl ?? undefined}
          onUpload={(url) => setSelfieUrl(url)}
          className="aspect-square w-full"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
          2. Foto do documento (opcional · aumenta chances)
        </p>
        <PhotoUpload
          bucket="verifications"
          shape="wide"
          label="RG, CNH ou Passaporte"
          defaultUrl={docUrl ?? undefined}
          onUpload={(url) => setDocUrl(url)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selfieUrl || submitting}
        className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all ${
          selfieUrl && !submitting
            ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
            : "bg-surface-2 text-muted"
        }`}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {submitting ? "Enviando..." : "Enviar pra verificação"}
      </button>
    </div>
  );
}
