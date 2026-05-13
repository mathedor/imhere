import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { VerificationForm } from "@/components/app/VerificationForm";
import { getMyVerification } from "@/lib/db/verifications";
import { getCurrentProfile } from "@/lib/db/profiles";

export const dynamic = "force-dynamic";

export default async function VerificacaoPage() {
  const [profile, verification] = await Promise.all([getCurrentProfile(), getMyVerification()]);

  const isVerified = !!(profile as { is_verified?: boolean } | null)?.is_verified;
  const status = verification?.status;

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-8">
      <Link
        href="/app/perfil"
        className="mb-4 inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
      >
        <ArrowLeft className="size-3.5" />
        Voltar pro perfil
      </Link>

      <header className="mb-6 flex flex-col items-center gap-3 text-center">
        <div
          className={`grid size-20 place-items-center rounded-3xl text-white shadow-glow ${
            isVerified
              ? "bg-gradient-to-br from-success to-success/70"
              : "bg-gradient-to-br from-brand-strong via-brand to-brand-soft"
          }`}
        >
          <ShieldCheck className="size-10" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-text">
          Verificação de identidade
        </h1>
        <p className="max-w-md text-sm text-text-soft">
          Conta verificada ganha badge ✓ azul · 3x mais aceite de contato · maior confiança
          de quem você quer conhecer.
        </p>
      </header>

      {isVerified && (
        <section className="mb-6 rounded-3xl border border-success/30 bg-success/10 p-5 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <p className="mt-3 text-base font-bold text-text">Você está verificado!</p>
          <p className="mt-1 text-xs text-text-soft">
            Seu badge ✓ aparece no seu perfil pra todo mundo do app.
          </p>
        </section>
      )}

      {!isVerified && status === "pending" && (
        <section className="mb-6 rounded-3xl border border-warn/30 bg-warn/10 p-5 text-center">
          <Clock className="mx-auto size-12 text-warn" />
          <p className="mt-3 text-base font-bold text-text">Em análise...</p>
          <p className="mt-1 text-xs text-text-soft">
            Recebemos sua selfie. Costumamos revisar em até 12h. Você recebe notificação assim que sai o resultado.
          </p>
        </section>
      )}

      {!isVerified && status === "rejected" && (
        <section className="mb-6 rounded-3xl border border-brand/30 bg-brand/10 p-5 text-center">
          <X className="mx-auto size-12 text-brand" />
          <p className="mt-3 text-base font-bold text-text">Verificação recusada</p>
          {verification?.rejection_reason && (
            <p className="mt-1 text-xs text-text-soft">{verification.rejection_reason}</p>
          )}
          <p className="mt-2 text-xs text-text-soft">Envie uma nova abaixo.</p>
        </section>
      )}

      {!isVerified && (status === undefined || status === "rejected") && (
        <VerificationForm />
      )}

      {/* Critérios */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold text-text">Critérios pra aprovação</h2>
        <ul className="flex flex-col gap-2 text-xs text-text-soft">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
            Selfie com rosto inteiro, sem óculos escuros ou máscara
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
            Boa iluminação · sem filtros agressivos
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
            Pessoa precisa ser a mesma do perfil
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
            (Opcional) Foto de documento aumenta as chances
          </li>
        </ul>
        <p className="mt-3 text-[0.65rem] text-muted">
          🔒 Imagens são privadas · só nossa equipe de moderação vê · apagamos após revisão se você pedir.
        </p>
      </section>
    </div>
  );
}
