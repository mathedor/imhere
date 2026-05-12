import { EstabsClient } from "@/components/admin/EstabsClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { listAllEstablishments } from "@/lib/db/admin-queries";
import { listNearbyEstablishments } from "@/lib/db/establishments";
import { isMockMode } from "@/lib/supabase/config";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function EstabelecimentosAdminPage() {
  let rows;

  if (isMockMode()) {
    const { establishments } = await import("@/data/establishments");
    rows = establishments.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      city: e.city,
      state: e.state,
      rating: e.rating,
      reviewCount: e.reviewCount,
      priceLevel: e.priceLevel,
      openNow: e.openNow,
      presentNow: e.presentNow,
      cover: e.cover,
    }));
  } else {
    const [estabs, nearby] = await Promise.all([
      listAllEstablishments(),
      listNearbyEstablishments({ sort: "nearest" }),
    ]);
    const presenceMap = new Map(nearby.map((n) => [n.id, n.present_count]));
    rows = estabs.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      city: e.city,
      state: e.state,
      rating: Number(e.rating ?? 0),
      reviewCount: e.review_count,
      priceLevel: e.price_level,
      openNow: e.open_now,
      presentNow: Number(presenceMap.get(e.id) ?? 0),
      cover: e.cover_url ?? undefined,
    }));
  }

  return (
    <PanelLayout
      scope="admin"
      title="Estabelecimentos"
      subtitle={`${rows.length} cadastrados`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <EstabsClient rows={rows} />
    </PanelLayout>
  );
}
