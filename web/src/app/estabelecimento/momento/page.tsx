import { MomentoEditor, type MomentItem } from "@/components/estabelecimento/MomentoEditor";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { listMoments } from "@/lib/db/establishments";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function MomentoPage() {
  const ctx = await getMyEstablishmentContext();
  const moments: MomentItem[] = ctx.establishment
    ? (await listMoments(ctx.establishment.id)).map((m) => ({
        id: m.id,
        image_url: m.image_url,
        caption: m.caption,
        views_count: m.views_count,
        posted_at: m.posted_at,
        expires_at: m.expires_at,
      }))
    : [];

  return (
    <PanelLayout
      scope="estabelecimento"
      title="No Momento"
      subtitle="Stories ao vivo do seu estabelecimento · expira em 4h"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Gestão", role: "Estabelecimento" }}
    >
      <MomentoEditor moments={moments} />
    </PanelLayout>
  );
}
