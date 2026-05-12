import { Eye, Lock, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getMyProfileViews } from "@/lib/actions/profile-views";

export const dynamic = "force-dynamic";

// Helper pra formatar "5 min atrás"
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d} dia${d > 1 ? "s" : ""} atrás`;
}

export default async function VisitasPage() {
  const profile = await getCurrentProfile();

  // Premium gating (placeholder: detecta pelo current_plan_id != null OU
  // futuramente cruza com subscriptions ativas)
  const isPremium =
    !!profile?.current_plan_id || (profile?.role && ["admin"].includes(profile.role));

  if (!isPremium) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-5 py-12 text-center">
        <div className="relative grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-strong via-brand to-brand-soft shadow-glow">
          <Lock className="size-10 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-text">Quem visitou seu perfil</h1>
        <p className="text-sm leading-relaxed text-text-soft">
          Veja quem está olhando você nos últimos 30 dias.{" "}
          <strong className="text-text">Feature Premium</strong> — descubra quem se interessou.
        </p>

        <ul className="w-full space-y-2">
          {["Lista de visitantes únicos", "Quantas vezes cada pessoa olhou", "Última visita registrada", "Notificação quando alguém visita"].map((t) => (
            <li key={t} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-xs">
              <Sparkles className="size-3.5 text-brand" />
              <span className="text-text-soft">{t}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/app/planos"
          className="mt-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
        >
          Liberar agora
        </Link>
      </div>
    );
  }

  const visitors = await getMyProfileViews(30);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-8">
      <header className="mb-5">
        <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">
          Quem visitou seu perfil
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          {visitors.length} pessoa{visitors.length !== 1 ? "s" : ""} olharam você nos últimos 30 dias
        </p>
      </header>

      {visitors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-12 text-center">
          <Eye className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Ninguém visitou ainda</p>
          <p className="mt-1 text-xs text-text-soft">
            Faça check-in em algum lugar para aparecer nas listas e ser descoberto.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visitors.map((v) => (
            <li
              key={v.viewer_id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-brand/40"
            >
              <Link href={`/app/usuario/${v.viewer_id}`} className="flex flex-1 items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
                  {v.viewer_photo && (
                    <Image src={v.viewer_photo} alt={v.viewer_name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-text">{v.viewer_name}</p>
                  {v.viewer_profession && (
                    <p className="text-[0.7rem] text-text-soft">{v.viewer_profession}</p>
                  )}
                  <p className="mt-1 text-[0.65rem] text-muted">
                    {v.visits_count > 1 && (
                      <>
                        <span className="rounded-pill bg-brand/15 px-1.5 py-0.5 font-bold text-brand">
                          {v.visits_count} visitas
                        </span>
                        {" · "}
                      </>
                    )}
                    {timeAgo(v.last_view)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
