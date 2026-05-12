import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardapioEditor, type MenuItem } from "@/components/estabelecimento/CardapioEditor";
import { getEstablishment } from "@/lib/db/establishments";
import { listMenuByEstablishment } from "@/lib/db/menu";

export const dynamic = "force-dynamic";

export default async function AdminCardapioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estab = await getEstablishment(id);
  if (!estab) notFound();

  const items: MenuItem[] = (await listMenuByEstablishment(estab.id)).map((m) => ({
    id: m.id,
    category: m.category,
    name: m.name,
    description: m.description,
    price_cents: m.price_cents,
    image_url: m.image_url,
    position: m.position,
    available: m.available,
  }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">{`Cardápio · ${estab.name}`}</h1>
        <p className="mt-1 text-sm text-text-soft">{`${items.length} itens · publicado em /cardapio/${estab.slug ?? estab.id}`}</p>
      </header>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/admin/estabelecimentos/${estab.id}`}
          className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
        >
          <ArrowLeft className="size-3.5" />
          Voltar pro estabelecimento
        </Link>
        <span className="flex items-center gap-1.5 rounded-pill bg-warn/15 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-warn">
          <UtensilsCrossed className="size-3.5" />
          Edição administrativa
        </span>
      </div>

      <CardapioEditor
        items={items}
        publicSlug={estab.slug ?? undefined}
        establishmentId={estab.id}
      />
    </>
  );
}
