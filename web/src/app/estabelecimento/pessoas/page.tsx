import { PessoasClient } from "@/components/estabelecimento/PessoasClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function PessoasPage() {
  const ctx = await getMyEstablishmentContext();

  const presentUsers = ctx.presentProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.birth_date
      ? Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
      : undefined,
    gender: p.gender ?? undefined,
    status: p.status,
    photo: p.photo_url ?? undefined,
    profession: p.profession ?? undefined,
    checkedInAt: p.last_seen_at ?? undefined,
  }));

  return (
    <PanelLayout
      scope="estabelecimento"
      title="Pessoas no local agora"
      subtitle={`${presentUsers.length} pessoa${presentUsers.length !== 1 ? "s" : ""} com check-in ativo · atualiza em tempo real`}
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Gestão", role: "Estabelecimento" }}
    >
      <PessoasClient present={presentUsers} />
    </PanelLayout>
  );
}
