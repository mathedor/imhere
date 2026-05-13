import { Building2, Megaphone } from "lucide-react";
import Link from "next/link";
import { BroadcastClient } from "@/components/estabelecimento/BroadcastClient";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const ctx = await getMyEstablishmentContext();

  if (!ctx.establishment) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Disparar aviso</h1>
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

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          <Megaphone className="mr-2 inline size-7 text-brand" />
          Disparar aviso
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Manda mensagem direta pra quem está aqui ou frequenta · entrega como notificação no app
        </p>
      </header>

      <BroadcastClient
        presentNow={ctx.presentProfiles.length}
        estabName={ctx.establishment.name}
      />
    </>
  );
}
