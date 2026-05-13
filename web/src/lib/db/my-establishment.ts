import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { Establishment, Profile } from "./types";

export interface DailyPoint {
  label: string;
  value: number;
}

export interface RecentEstabMessage {
  who: string;
  msg: string;
  time: string;
}

function daysBack(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (n - 1));
  return d;
}

function buildDailyBuckets(days: number): Map<string, number> {
  const buckets = new Map<string, number>();
  const start = daysBack(days);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  return buckets;
}

function bucketsToSeries(buckets: Map<string, number>): DailyPoint[] {
  return Array.from(buckets.entries()).map(([iso, value]) => {
    const [, m, d] = iso.split("-");
    return { label: `${d}/${m}`, value };
  });
}

function mockCheckins(days: number): DailyPoint[] {
  const buckets = buildDailyBuckets(days);
  let i = 0;
  for (const key of buckets.keys()) {
    const dow = new Date(key).getDay();
    const boost = [0.6, 0.5, 0.8, 1.2, 1.6, 2.1, 1.7][dow];
    buckets.set(key, Math.round(22 * boost + ((i * 7) % 13)));
    i++;
  }
  return bucketsToSeries(buckets);
}

export async function getCheckinsByDay(estabId: string, days = 30): Promise<DailyPoint[]> {
  if (isMockMode()) return mockCheckins(days);
  const sb = await supabaseServer();
  const start = daysBack(days);
  const { data } = await sb
    .from("checkins")
    .select("checked_in_at")
    .eq("establishment_id", estabId)
    .gte("checked_in_at", start.toISOString());
  const buckets = buildDailyBuckets(days);
  for (const row of (data ?? []) as Array<{ checked_in_at: string }>) {
    const key = row.checked_in_at.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return bucketsToSeries(buckets);
}

/**
 * Últimas mensagens em conversas entre pessoas que estavam neste estabelecimento.
 * Filtra conversas com `establishment_id = estabId`.
 */
export async function getRecentEstabMessages(estabId: string, limit = 6): Promise<RecentEstabMessage[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb
    .from("messages")
    .select("body, created_at, sender_id, conversations!inner(establishment_id), profiles!sender_id(name)")
    .eq("conversations.establishment_id", estabId)
    .eq("type", "text")
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as Array<{
    body: string | null;
    created_at: string;
    profiles: { name: string } | null;
  }>).map((m) => ({
    who: m.profiles?.name ?? "—",
    msg: m.body ?? "",
    time: new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  }));
}

export interface TopVisitor {
  profileId: string;
  name: string;
  photo: string | null;
  checkins: number;
  lastCheckinAt: string | null;
}

export async function getTopVisitors(estabId: string, limit = 8): Promise<TopVisitor[]> {
  if (isMockMode()) return [];
  try {
    const sb = await supabaseServer();
    const thirty = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data } = await sb
      .from("checkins")
      .select("profile_id, checked_in_at, profiles(name, photo_url)")
      .eq("establishment_id", estabId)
      .gte("checked_in_at", thirty)
      .limit(5000);

    const map = new Map<string, TopVisitor>();
    for (const row of (data ?? []) as unknown as Array<{
      profile_id: string;
      checked_in_at: string;
      profiles: { name: string | null; photo_url: string | null } | null;
    }>) {
      const existing = map.get(row.profile_id);
      if (existing) {
        existing.checkins += 1;
        if (!existing.lastCheckinAt || row.checked_in_at > existing.lastCheckinAt) {
          existing.lastCheckinAt = row.checked_in_at;
        }
      } else {
        map.set(row.profile_id, {
          profileId: row.profile_id,
          name: row.profiles?.name ?? "—",
          photo: row.profiles?.photo_url ?? null,
          checkins: 1,
          lastCheckinAt: row.checked_in_at,
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.checkins - a.checkins)
      .slice(0, limit);
  } catch (err) {
    console.error("[getTopVisitors]", err);
    return [];
  }
}

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
