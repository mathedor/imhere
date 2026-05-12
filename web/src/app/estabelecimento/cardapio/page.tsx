import { CardapioEditor, type MenuItem } from "@/components/estabelecimento/CardapioEditor";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { listMenuByEstablishment } from "@/lib/db/menu";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function CardapioEditorPage() {
  const ctx = await getMyEstablishmentContext();
  const items: MenuItem[] = ctx.establishment
    ? (await listMenuByEstablishment(ctx.establishment.id)).map((m) => ({
        id: m.id,
        category: m.category,
        name: m.name,
        description: m.description,
        price_cents: m.price_cents,
        image_url: m.image_url,
        position: m.position,
        available: m.available,
      }))
    : [];

  return (
    <PanelLayout
      scope="estabelecimento"
      title="Cardápio"
      subtitle={`${items.length} itens · publicado em /cardapio/${ctx.establishment?.slug ?? "seu-slug"}`}
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Gestão", role: "Estabelecimento" }}
    >
      <CardapioEditor items={items} publicSlug={ctx.establishment?.slug ?? undefined} />
    </PanelLayout>
  );
}
