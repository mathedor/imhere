import { notFound } from "next/navigation";
import { EstablishmentDetail } from "@/components/establishment/EstablishmentDetail";
import { getCurrentCheckin } from "@/lib/db/checkins";
import { getEstablishment, listMoments, listPresentUsers } from "@/lib/db/establishments";
import { listMenuByEstablishment } from "@/lib/db/menu";
import type { Establishment as EstabUI, EstablishmentType } from "@/data/establishments";
import type { AppUser } from "@/data/users";

export const dynamic = "force-dynamic";

export default async function EstablishmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await getEstablishment(id);
  if (!place) notFound();

  const [presentProfiles, moments, menu, myCheckin] = await Promise.all([
    listPresentUsers(place.id),
    listMoments(place.id),
    listMenuByEstablishment(place.id),
    getCurrentCheckin(),
  ]);

  const iAmCheckedInHere =
    typeof myCheckin === "object" && myCheckin !== null && "establishment_id" in myCheckin
      ? (myCheckin as { establishment_id: string }).establishment_id === place.id
      : false;

  const placeUI: EstabUI = {
    id: place.id,
    name: place.name,
    type: place.type as EstablishmentType,
    city: place.city,
    state: place.state,
    address: place.address,
    distanceKm: 0,
    rating: Number(place.rating ?? 0),
    reviewCount: place.review_count ?? 0,
    cover: place.cover_url ?? "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
    presentNow: presentProfiles.length,
    presentByGender: {
      male: presentProfiles.filter((p) => p.gender === "male").length,
      female: presentProfiles.filter((p) => p.gender === "female").length,
      other: presentProfiles.filter((p) => p.gender === "other").length,
    },
    tags: place.tags ?? [],
    priceLevel: (place.price_level ?? 2) as 1 | 2 | 3 | 4,
    openNow: place.open_now,
    instagram: place.instagram ?? undefined,
  };

  const presentUI: AppUser[] = presentProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.birth_date
      ? Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
      : 25,
    gender: (p.gender ?? "other") as AppUser["gender"],
    status: p.status,
    photo: p.photo_url ?? "https://i.pravatar.cc/300",
    bio: p.bio ?? "",
    profession: p.profession ?? "",
    instagram: p.instagram ?? undefined,
    city: p.city ?? "",
    state: p.state ?? "",
    checkedInAt: p.last_seen_at ?? undefined,
  }));

  return (
    <EstablishmentDetail
      place={placeUI}
      present={presentUI}
      hasMomento={moments.length > 0}
      hasMenu={menu.length > 0}
      iAmCheckedInHere={iAmCheckedInHere}
    />
  );
}
