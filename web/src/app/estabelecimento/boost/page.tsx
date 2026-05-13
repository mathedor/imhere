import { Building2, Clock, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { BoostButton } from "@/components/estabelecimento/BoostButton";
import { getMyBalance } from "@/lib/actions/credits";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";
import { isMockMode } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ActiveBoost {
  id: string;
  reason: string | null;
  ends_at: string;
  paid_credits: number;
}

const REASON_LABEL: Record<string, string> = {
  banda: "Banda começa",
  happy_hour: "Happy hour",
  show_especial: "Show especial",
  outro: "Outro",
};

async function getActiveBoosts(estabId: string): Promise<ActiveBoost[]> {
  if (isMockMode()) {
    return [
      {
        id: "mock",
        reason: "happy_hour",
        ends_at: new Date(Date.now() + 25 * 60_000).toISOString(),
        paid_credits: 50,
      },
    ];
  }
  try {
    const sb = await supabaseServer();
    const { data } = await sb
      .from("establishment_boosts")
      .select("id, reason, ends_at, paid_credits")
      .eq("establishment_id", estabId)
      .gt("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: false })
      .limit(10);
    return (data ?? []) as ActiveBoost[];
  } catch (err) {
    console.error("[boost] getActiveBoosts", err);
    return [];
  }
}

function minutesLeft(iso: string): number {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60_000));
}

export default async function BoostPage() {
  const ctx = await getMyEstablishmentContext();

  if (!ctx.establishment) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
            Boost de evento
          </h1>
          <p className="mt-1 text-sm text-text-soft">Aguardando associação</p>
        </header>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Building2 className="size-8" />
          </div>
          <h2 className="text-xl font-black text-text">Sem estabelecimento</h2>
          <p className="text-sm text-text-soft">
            Cadastre seu estabelecimento pra comprar boost.
          </p>
          <Link
            href="/cadastro"
            className="rounded-pill bg-gradient-to-r from-brand-strong to-brand px-6 py-2.5 text-sm font-bold text-white shadow-glow"
          >
            Cadastrar →
          </Link>
        </div>
      </>
    );
  }

  const place = ctx.establishment;
  const [balance, active] = await Promise.all([getMyBalance(), getActiveBoosts(place.id)]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Boost de evento
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          {place.name} · destaque temporário pra horas críticas
        </p>
      </header>

      <section className="mb-5 overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 via-surface to-surface p-5">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/20 text-brand">
            <Zap className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black text-text">Como o boost funciona</h2>
            <ul className="mt-2 space-y-1 text-xs text-text-soft">
              <li>· Custa <strong className="text-text">50 créditos</strong> por compra</li>
              <li>· Dura <strong className="text-text">1 hora</strong> a partir da ativação</li>
              <li>· Seu estab aparece no <strong className="text-text">topo da busca</strong> e do mapa</li>
              <li>· Ideal pra anunciar evento: banda começando, happy hour ou show especial</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
            <Sparkles className="size-3" />
            Saldo de créditos
          </p>
          <p className="mt-1 text-3xl font-black text-text">
            {balance.toLocaleString("pt-BR")}
          </p>
          <Link
            href="/estabelecimento/perfil"
            className="mt-1 text-[0.65rem] font-bold text-brand hover:underline"
          >
            Comprar mais créditos →
          </Link>
        </div>

        <BoostButton balance={balance} />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold text-text">Boosts ativos</h2>
        {active.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg/30 py-10 text-center">
            <Clock className="mx-auto size-7 text-muted" />
            <p className="mt-2 text-sm font-bold text-text">Nenhum boost rodando</p>
            <p className="mt-1 text-xs text-text-soft">
              Ative pra aparecer no topo agora.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-bg/30 p-4"
              >
                <div>
                  <p className="text-sm font-bold text-text">
                    {REASON_LABEL[b.reason ?? ""] ?? "Boost ativo"}
                  </p>
                  <p className="text-[0.65rem] text-text-soft">
                    {b.paid_credits} créditos · termina em {minutesLeft(b.ends_at)} min
                  </p>
                </div>
                <span className="rounded-pill bg-brand/15 px-3 py-1 text-[0.6rem] font-black uppercase tracking-widest text-brand">
                  Live
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
