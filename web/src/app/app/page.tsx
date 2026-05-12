import { HomeClient } from "@/components/app/HomeClient";
import { getMyBalance } from "@/lib/actions/credits";
import { listNearbyEstablishments } from "@/lib/db/establishments";
import { getCurrentProfile } from "@/lib/db/profiles";
import type { Establishment } from "@/data/establishments";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string; nearby?: string }>;
}) {
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;
  const nearbyOnly = sp.nearby === "1";

  const [nearby, profile, credits] = await Promise.all([
    listNearbyEstablishments({
      sort: "nearest",
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      nearbyOnly,
    }),
    getCurrentProfile(),
    getMyBalance(),
  ]);

  const isPremium = !!profile?.current_plan_id || profile?.role === "admin";

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
    hasMomento: e.has_momento ?? false,
  }));

  const totalOnline = establishments.reduce((a, e) => a + e.presentNow, 0);

  return <HomeClient establishments={establishments} totalOnline={totalOnline} isPremium={isPremium} credits={credits} />;
}
