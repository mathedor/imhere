import { CheckCircle2, Clock, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { redeemCourtesy } from "@/lib/db/courtesies";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

interface CourtesyRow {
  id: string;
  title: string;
  message: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  establishment: { id: string; name: string; cover_url: string | null } | null;
}

async function listMyCourtesies(): Promise<CourtesyRow[]> {
  if (isMockMode()) {
    return [
      {
        id: "c1",
        title: "Drink cortesia",
        message: "Passa lá no balcão pra retirar!",
        status: "sent",
        expires_at: new Date(Date.now() + 3 * 3600000).toISOString(),
        created_at: new Date().toISOString(),
        establishment: { id: "lume-rooftop", name: "Lume Rooftop", cover_url: null },
      },
      {
        id: "c2",
        title: "10% off conta",
        message: null,
        status: "redeemed",
        expires_at: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        establishment: { id: "boteco-da-vila", name: "Boteco da Vila", cover_url: null },
      },
    ];
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data } = await sb
    .from("courtesies")
    .select("id, title, message, status, expires_at, created_at, establishments(id, name, cover_url)")
    .eq("to_profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data ?? []) as unknown as CourtesyRow[]).map((c) => ({
    ...c,
    establishment: (c.establishment as unknown) as CourtesyRow["establishment"],
  }));
}

function timeLeft(iso: string | null): string | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expirou";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const STATUS_META: Record<string, { color: string; label: string; bg: string }> = {
  sent: { color: "#3b82f6", label: "Disponível", bg: "rgba(59,130,246,0.15)" },
  delivered: { color: "#3b82f6", label: "Disponível", bg: "rgba(59,130,246,0.15)" },
  redeemed: { color: "#22c55e", label: "Resgatada ✓", bg: "rgba(34,197,94,0.15)" },
  expired: { color: "#6b6b75", label: "Expirou", bg: "rgba(107,107,117,0.20)" },
};

export default async function CortesiasPage() {
  const courtesies = await listMyCourtesies();

  async function redeem(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await redeemCourtesy(id);
  }

  const active = courtesies.filter((c) => c.status === "sent" || c.status === "delivered");
  const past = courtesies.filter((c) => c.status === "redeemed" || c.status === "expired");

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-8">
      <header className="mb-5">
        <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Minhas cortesias</h1>
        <p className="mt-1 text-sm text-text-soft">
          {active.length > 0
            ? `${active.length} cortesia${active.length > 1 ? "s" : ""} ativa${active.length > 1 ? "s" : ""}`
            : "Sem cortesias ativas agora"}
        </p>
      </header>

      {courtesies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <Gift className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Sem cortesias ainda</p>
          <p className="mt-1 text-xs text-text-soft">
            Quando algum estabelecimento te enviar um drink, desconto ou convite, aparece aqui.
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">Disponíveis</h2>
              <ul className="flex flex-col gap-2">
                {active.map((c) => {
                  const meta = STATUS_META[c.status] ?? STATUS_META.sent;
                  const expiry = timeLeft(c.expires_at);
                  return (
                    <li
                      key={c.id}
                      className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-4"
                    >
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand text-2xl">
                        🎁
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text">{c.title}</p>
                          <span
                            className="rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {c.message && (
                          <p className="mt-0.5 text-xs text-text-soft">&ldquo;{c.message}&rdquo;</p>
                        )}
                        <p className="mt-1 text-[0.7rem] text-muted">
                          De {c.establishment?.name ?? "estabelecimento"}
                          {expiry && (
                            <>
                              {" · "}
                              <Clock className="mr-0.5 inline size-3" />
                              expira em {expiry}
                            </>
                          )}
                        </p>
                      </div>
                      <form action={redeem}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow"
                        >
                          Resgatar
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">Histórico</h2>
              <ul className="flex flex-col gap-2">
                {past.map((c) => {
                  const meta = STATUS_META[c.status] ?? STATUS_META.expired;
                  return (
                    <li
                      key={c.id}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 opacity-70"
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-lg">
                        {c.status === "redeemed" ? "✓" : "✕"}
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-sm font-bold text-text">{c.title}</p>
                        <p className="text-[0.7rem] text-muted">
                          De {c.establishment?.name ?? "—"}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
