import { Check, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VerificationReviewClient } from "@/components/admin/VerificationReviewClient";
import { listPendingVerifications } from "@/lib/db/verifications";

export const dynamic = "force-dynamic";

function fmtTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default async function VerificacoesPage() {
  const pending = await listPendingVerifications();

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
            Verificações pendentes
          </h1>
          <p className="mt-1 text-sm text-text-soft">
            {pending.length} selfie{pending.length !== 1 ? "s" : ""} aguardando análise
          </p>
        </div>
        <Link
          href="/admin/moderacao"
          className="text-xs font-bold text-brand hover:underline"
        >
          ← Voltar pra moderação
        </Link>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-success/30 bg-success/5 py-16 text-center">
          <ShieldCheck className="mx-auto size-12 text-success" />
          <p className="mt-4 text-base font-bold text-text">Nenhuma verificação pendente</p>
          <p className="mt-1 text-xs text-text-soft">Quando alguém enviar selfie, aparece aqui.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pending.map((v) => (
            <li
              key={v.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="grid grid-cols-2 gap-1 bg-surface-2">
                <div className="relative aspect-square">
                  {v.selfie_url && (
                    <Image
                      src={v.selfie_url}
                      alt="Selfie"
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded-pill bg-black/70 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">
                    Selfie
                  </span>
                </div>
                <div className="relative aspect-square">
                  {v.doc_url ? (
                    <Image
                      src={v.doc_url}
                      alt="Documento"
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[0.65rem] text-muted">
                      Sem documento
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-pill bg-black/70 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">
                    Documento
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface-2">
                    {v.profile?.photo_url ? (
                      <Image
                        src={v.profile.photo_url}
                        alt={v.profile.name ?? ""}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <Link
                      href={`/admin/usuarios/${v.profile?.id ?? v.profile_id}`}
                      className="block truncate text-sm font-bold text-text hover:text-brand"
                    >
                      {v.profile?.name ?? "—"}
                    </Link>
                    <p className="truncate text-[0.65rem] text-text-soft">
                      {v.profile?.email}
                    </p>
                    <p className="text-[0.65rem] text-muted">
                      Enviado há {fmtTimeAgo(v.created_at)}
                    </p>
                  </div>
                </div>

                <VerificationReviewClient verificationId={v.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
