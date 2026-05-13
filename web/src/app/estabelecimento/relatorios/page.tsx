import { Building2, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { EstabRelatoriosClient } from "@/components/estabelecimento/RelatoriosClient";
import {
  getCheckinReport,
  getCompetitorReport,
  type Period,
} from "@/lib/db/admin-reports";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

export const dynamic = "force-dynamic";

function parsePeriod(value?: string): Period {
  if (value === "today" || value === "7d" || value === "30d" || value === "custom") return value;
  return "30d";
}

export default async function EstabelecimentoRelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const ctx = await getMyEstablishmentContext();

  if (!ctx.establishment) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Relatórios</h1>
          <p className="mt-1 text-sm text-text-soft">Aguardando associação</p>
        </header>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Building2 className="size-8" />
          </div>
          <h2 className="text-xl font-black text-text">Sem estabelecimento</h2>
          <p className="text-sm text-text-soft">
            Cadastre seu estabelecimento pra ver os relatórios.
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
  const sp = await searchParams;
  const period = parsePeriod(sp.period);

  const [checkins, competitors] = await Promise.all([
    getCheckinReport(period, { estabId: place.id, fromIso: sp.from, toIso: sp.to }),
    getCompetitorReport(place.id),
  ]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Relatórios</h1>
        <p className="mt-1 text-sm text-text-soft">{`${place.name} · análise por período + benchmark com concorrência`}</p>
      </header>

      <Link
        href="/estabelecimento/relatorios/funil"
        className="mb-5 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
          <Filter className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-text">Funil de conversão</p>
          <p className="text-xs text-text-soft">
            Check-in → conversa → aceite → retorno · últimos 30 dias
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-text-soft" />
      </Link>

      <EstabRelatoriosClient
        period={period}
        fromIso={sp.from}
        toIso={sp.to}
        checkins={checkins}
        competitors={competitors}
        estabName={place.name}
        presentNow={ctx.presentProfiles.length}
        checkinsToday={ctx.checkinsToday}
      />
    </>
  );
}
