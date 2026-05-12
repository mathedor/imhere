import { Building2 } from "lucide-react";
import Link from "next/link";
import { EstablishmentDashboardClient } from "@/components/estabelecimento/DashboardClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { parseRange, rangeToDays } from "@/components/panel/DateRangeUrlFilter";
import {
  getCheckinsByDay,
  getMyEstablishmentContext,
  getRecentEstabMessages,
} from "@/lib/db/my-establishment";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function EstabelecimentoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const days = rangeToDays(rangeKey);

  const ctx = await getMyEstablishmentContext();

  if (!ctx.establishment) {
    return (
      <PanelLayout
        scope="estabelecimento"
        title="Painel do estabelecimento"
        subtitle="Aguardando associação"
        nav={NAV_ESTAB}
        quickNav={QUICK_ESTAB}
        user={{ name: "—", role: "Estabelecimento" }}
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Building2 className="size-8" />
          </div>
          <h2 className="text-xl font-black text-text">Você ainda não tem um estabelecimento</h2>
          <p className="text-sm text-text-soft">
            Cadastre seu bar, restaurante ou casa de show para começar a receber check-ins.
          </p>
          <Link
            href="/cadastro"
            className="rounded-pill bg-gradient-to-r from-brand-strong to-brand px-6 py-2.5 text-sm font-bold text-white shadow-glow"
          >
            Cadastrar agora →
          </Link>
        </div>
      </PanelLayout>
    );
  }

  const place = ctx.establishment;

  const [checkinsByDay, recentMessages] = await Promise.all([
    getCheckinsByDay(place.id, days),
    getRecentEstabMessages(place.id, 6),
  ]);

  return (
    <PanelLayout
      scope="estabelecimento"
      title={place.name}
      subtitle={`${place.address} · ${place.city}/${place.state}`}
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Gestão", role: "Estabelecimento" }}
    >
      <EstablishmentDashboardClient
        presentNow={ctx.presentProfiles.length}
        presentByGender={ctx.presentByGender}
        checkinsToday={ctx.checkinsToday}
        momentsActive={ctx.momentsActive}
        rating={Number(place.rating ?? 0)}
        instagram={place.instagram ?? undefined}
        checkinsByDay={checkinsByDay}
        recentMessages={recentMessages}
        range={rangeKey}
        days={days}
      />
    </PanelLayout>
  );
}
