import { Building2, Crown, Gift, Plus } from "lucide-react";
import Link from "next/link";
import { LoyaltyProgramsClient } from "@/components/estabelecimento/LoyaltyProgramsClient";
import { LoyaltyCustomersClient } from "@/components/estabelecimento/LoyaltyCustomersClient";
import { listMyEstabPrograms, listProgramCustomers } from "@/lib/db/loyalty";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

export const dynamic = "force-dynamic";

export default async function FidelidadePage() {
  const ctx = await getMyEstablishmentContext();

  if (!ctx.establishment) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Fidelidade</h1>
          <p className="mt-1 text-sm text-text-soft">Aguardando associação</p>
        </header>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Building2 className="size-8" />
          </div>
          <h2 className="text-xl font-black text-text">Sem estabelecimento</h2>
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
  const [programs, customers] = await Promise.all([
    listMyEstabPrograms(),
    listProgramCustomers(place.id),
  ]);

  const readyCount = customers.filter((c) => c.ready).length;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
            Fidelidade
          </h1>
          <p className="mt-1 text-sm text-text-soft">
            Premie quem volta · {place.name}
          </p>
        </div>
        {readyCount > 0 && (
          <Link
            href="#prontos"
            className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-warn via-brand to-brand-strong px-4 py-2 text-sm font-bold text-white shadow-glow"
          >
            <Crown className="size-4" />
            {readyCount} cliente{readyCount !== 1 ? "s" : ""} pronto{readyCount !== 1 ? "s" : ""}
          </Link>
        )}
      </header>

      {/* Programas */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Gift className="size-4 text-brand" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
            Programas ativos
          </h2>
        </div>
        <LoyaltyProgramsClient programs={programs} />
      </section>

      {/* Clientes em progresso */}
      <section id="prontos">
        <div className="mb-3 flex items-center gap-2">
          <Crown className="size-4 text-warn" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
            Clientes em progresso ({customers.length})
          </h2>
        </div>
        <LoyaltyCustomersClient customers={customers} />
      </section>
    </>
  );
}
