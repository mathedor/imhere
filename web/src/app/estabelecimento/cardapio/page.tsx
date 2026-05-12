import { CardapioEditor, type MenuItem } from "@/components/estabelecimento/CardapioEditor";
import { listMenuByEstablishment } from "@/lib/db/menu";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

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
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Cardápio</h1>
        <p className="mt-1 text-sm text-text-soft">{`${items.length} itens · publicado em /cardapio/${ctx.establishment?.slug ?? "seu-slug"}`}</p>
      </header>
      <CardapioEditor items={items} publicSlug={ctx.establishment?.slug ?? undefined} />
    </>
  );
}
