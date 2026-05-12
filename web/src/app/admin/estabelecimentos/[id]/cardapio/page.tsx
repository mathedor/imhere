import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardapioEditor, type MenuItem } from "@/components/estabelecimento/CardapioEditor";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { getEstablishment } from "@/lib/db/establishments";
import { listMenuByEstablishment } from "@/lib/db/menu";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

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
    <PanelLayout
      scope="admin"
      title={`Cardápio · ${estab.name}`}
      subtitle={`${items.length} itens · publicado em /cardapio/${estab.slug ?? estab.id}`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
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
    </PanelLayout>
  );
}
