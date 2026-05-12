import { establishments as mockEstabs, momentoByEstablishment } from "@/data/establishments";
import { presentByEstablishment, users as mockUsers } from "@/data/users";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type {
  Establishment,
  Moment,
  NearbyEstablishment,
  Profile,
} from "./types";

function mockToEstablishment(e: (typeof mockEstabs)[number]): Establishment {
  return {
    id: e.id,
    owner_id: null,
    sales_agent_id: null,
    slug: e.id,
    name: e.name,
    type: e.type,
    city: e.city,
    state: e.state,
    address: e.address,
    cep: null,
    cnpj: null,
    capacity: null,
    rating: e.rating,
    review_count: e.reviewCount,
    cover_url: e.cover,
    whatsapp: null,
    instagram: e.instagram ?? null,
    reservation_url: null,
    menu_url: null,
    about: null,
    price_level: e.priceLevel,
    open_now: e.openNow,
    tags: e.tags,
    perks_active: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mockToNearby(e: (typeof mockEstabs)[number]): NearbyEstablishment {
  const moments = momentoByEstablishment[e.id] ?? [];
  return {
    ...mockToEstablishment(e),
    distance_km: e.distanceKm,
    present_count: e.presentNow,
    present_male: e.presentByGender.male,
    present_female: e.presentByGender.female,
    has_momento: moments.length > 0,
  };
}

export interface NearbyParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: "nearest" | "busiest" | "rated";
  nearbyOnly?: boolean;
}

export async function listNearbyEstablishments(params: NearbyParams = {}): Promise<NearbyEstablishment[]> {
  const { sort = "nearest", nearbyOnly = false, lat, lng, radiusKm = 30 } = params;

  if (isMockMode() || !lat || !lng) {
    let list = mockEstabs.map(mockToNearby);
    if (nearbyOnly) list = list.filter((e) => (e.distance_km ?? 99) <= 2);
    if (sort === "nearest") list.sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
    if (sort === "busiest") list.sort((a, b) => b.present_count - a.present_count);
    if (sort === "rated") list.sort((a, b) => b.rating - a.rating);
    return list;
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("nearby_establishments", {
    user_lat: lat,
    user_lng: lng,
    radius_km: nearbyOnly ? 2 : radiusKm,
    sort,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getEstablishment(idOrSlug: string): Promise<Establishment | null> {
  if (isMockMode()) {
    const e = mockEstabs.find((x) => x.id === idOrSlug);
    return e ? mockToEstablishment(e) : null;
  }
  const sb = await supabaseServer();
  const { data } = await sb
    .from("establishments")
    .select("*")
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .maybeSingle();
  return data;
}

export async function listMoments(establishmentId: string): Promise<Moment[]> {
  if (isMockMode()) {
    const list = momentoByEstablishment[establishmentId] ?? [];
    return list.map((m) => ({
      id: m.id,
      establishment_id: m.establishmentId,
      image_url: m.imageUrl,
      caption: m.caption ?? null,
      views_count: m.views,
      posted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + m.expiresInMin * 60_000).toISOString(),
    }));
  }
  const sb = await supabaseServer();
  const { data } = await sb
    .from("moments")
    .select("*")
    .eq("establishment_id", establishmentId)
    .gt("expires_at", new Date().toISOString())
    .order("posted_at", { ascending: false });
  return data ?? [];
}

export async function listPresentUsers(establishmentId: string): Promise<Profile[]> {
  if (isMockMode()) {
    const ids = presentByEstablishment[establishmentId] ?? [];
    return mockUsers
      .filter((u) => ids.includes(u.id))
      .map((u) => ({
        id: u.id,
        role: "user" as const,
        name: u.name,
        email: `${u.id}@imhere.app`,
        phone: null,
        whatsapp: null,
        instagram: u.instagram ?? null,
        birth_date: null,
        gender: u.gender,
        profession: u.profession,
        bio: u.bio,
        photo_url: u.photo,
        status: u.status,
        city: u.city,
        state: u.state,
        current_plan_id: null,
        verified_at: null,
        last_seen_at: u.checkedInAt ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
  }
  const sb = await supabaseServer();
  const { data: checkins } = await sb
    .from("checkins")
    .select("profile_id, checked_in_at, profiles(*)")
    .eq("establishment_id", establishmentId)
    .eq("status", "active");
  return (checkins ?? []).map((c) => (c as { profiles: Profile }).profiles).filter(Boolean);
}
