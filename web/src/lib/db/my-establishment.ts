import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { Establishment, Profile } from "./types";

export interface MyEstabContext {
  establishment: Establishment | null;
  presentProfiles: Profile[];
  presentByGender: { male: number; female: number; other: number };
  checkinsToday: number;
  momentsActive: number;
}

/**
 * Carrega o estabelecimento do user logado (role=establishment, owner_id=auth.uid())
 * + estatísticas básicas. Server-side only.
 */
export async function getMyEstablishmentContext(): Promise<MyEstabContext> {
  if (isMockMode()) {
    return {
      establishment: null,
      presentProfiles: [],
      presentByGender: { male: 0, female: 0, other: 0 },
      checkinsToday: 0,
      momentsActive: 0,
    };
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return {
      establishment: null,
      presentProfiles: [],
      presentByGender: { male: 0, female: 0, other: 0 },
      checkinsToday: 0,
      momentsActive: 0,
    };
  }

  // 1. Estabelecimento do owner
  const { data: estab } = await sb
    .from("establishments")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!estab) {
    return {
      establishment: null,
      presentProfiles: [],
      presentByGender: { male: 0, female: 0, other: 0 },
      checkinsToday: 0,
      momentsActive: 0,
    };
  }

  // 2. Presentes agora
  const { data: checkins } = await sb
    .from("checkins")
    .select("profile_id, checked_in_at, profiles(*)")
    .eq("establishment_id", estab.id)
    .eq("status", "active");

  const presentProfiles = (checkins ?? [])
    .map((c) => (c as { profiles: Profile }).profiles)
    .filter(Boolean);

  // 3. Check-ins de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: checkinsToday } = await sb
    .from("checkins")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", estab.id)
    .gte("checked_in_at", today.toISOString());

  // 4. Moments ativos
  const { count: momentsActive } = await sb
    .from("moments")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", estab.id)
    .gt("expires_at", new Date().toISOString());

  return {
    establishment: estab as Establishment,
    presentProfiles,
    presentByGender: {
      male: presentProfiles.filter((p) => p.gender === "male").length,
      female: presentProfiles.filter((p) => p.gender === "female").length,
      other: presentProfiles.filter((p) => p.gender === "other").length,
    },
    checkinsToday: checkinsToday ?? 0,
    momentsActive: momentsActive ?? 0,
  };
}
