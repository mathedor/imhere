import { HomeClient } from "@/components/app/HomeClient";
import { listNearbyEstablishments } from "@/lib/db/establishments";
import type { Establishment } from "@/data/establishments";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Server-side: busca todos os estabelecimentos com presença
  const nearby = await listNearbyEstablishments({ sort: "nearest" });

  const establishments: Establishment[] = nearby.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    city: e.city,
    state: e.state,
    address: e.address,
    distanceKm: e.distance_km ?? 0,
    rating: Number(e.rating ?? 0),
    reviewCount: e.review_count ?? 0,
    cover: e.cover_url ?? "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    presentNow: Number(e.present_count ?? 0),
    presentByGender: {
      male: Number(e.present_male ?? 0),
      female: Number(e.present_female ?? 0),
      other: 0,
    },
    tags: e.tags ?? [],
    priceLevel: (e.price_level ?? 2) as 1 | 2 | 3 | 4,
    openNow: e.open_now,
    instagram: e.instagram ?? undefined,
  }));

  const totalOnline = establishments.reduce((a, e) => a + e.presentNow, 0);

  return <HomeClient establishments={establishments} totalOnline={totalOnline} />;
}
