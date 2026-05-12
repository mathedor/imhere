import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import { resolveRange, type Period } from "./admin-reports";

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin-rankings] ${label}:`, err);
    return fallback;
  }
}

// ============================================================
// Ranking de estabelecimentos
// ============================================================

export interface EstabRanking {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  revenueCents: number;
  subscriptions: number;
  checkins: number;
  presentNow: number;
}

export async function getRankingEstabelecimentos(period: Period = "30d"): Promise<EstabRanking[]> {
  const { start, end } = resolveRange(period);

  if (isMockMode()) {
    return [
      { id: "e1", name: "Bravo Mar Beach Club", city: "Itajaí", state: "SC", type: "lounge", rating: 4.7, revenueCents: 1_240_000, subscriptions: 4, checkins: 412, presentNow: 38 },
      { id: "e2", name: "Lume Rooftop", city: "Itajaí", state: "SC", type: "bar", rating: 4.6, revenueCents: 980_000, subscriptions: 3, checkins: 312, presentNow: 24 },
      { id: "e3", name: "Beach Sunset", city: "Bal. Camboriú", state: "SC", type: "club", rating: 4.4, revenueCents: 760_000, subscriptions: 2, checkins: 198, presentNow: 12 },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data: estabs, error } = await sb
        .from("establishments")
        .select("id, name, city, state, type, rating");
      if (error) throw error;
      const list = (estabs ?? []) as Array<{
        id: string;
        name: string;
        city: string;
        state: string;
        type: string;
        rating: number | null;
      }>;
      if (list.length === 0) return [];

      const ids = list.map((e) => e.id);

      const [subs, checkinsPeriod, checkinsActive] = await Promise.all([
        sb.from("subscriptions").select("establishment_id, amount_cents, status").in("establishment_id", ids).eq("status", "active"),
        sb
          .from("checkins")
          .select("establishment_id")
          .in("establishment_id", ids)
          .gte("checked_in_at", start.toISOString())
          .lte("checked_in_at", end.toISOString())
          .limit(50000),
        sb.from("checkins").select("establishment_id").in("establishment_id", ids).eq("status", "active").limit(10000),
      ]);

      const revenueMap = new Map<string, number>();
      const subsMap = new Map<string, number>();
      for (const s of (subs.data ?? []) as Array<{ establishment_id: string; amount_cents: number }>) {
        revenueMap.set(s.establishment_id, (revenueMap.get(s.establishment_id) ?? 0) + (s.amount_cents ?? 0));
        subsMap.set(s.establishment_id, (subsMap.get(s.establishment_id) ?? 0) + 1);
      }

      const checkinsMap = new Map<string, number>();
      for (const c of (checkinsPeriod.data ?? []) as Array<{ establishment_id: string }>) {
        checkinsMap.set(c.establishment_id, (checkinsMap.get(c.establishment_id) ?? 0) + 1);
      }

      const presentMap = new Map<string, number>();
      for (const c of (checkinsActive.data ?? []) as Array<{ establishment_id: string }>) {
        presentMap.set(c.establishment_id, (presentMap.get(c.establishment_id) ?? 0) + 1);
      }

      return list
        .map((e) => ({
          id: e.id,
          name: e.name,
          city: e.city,
          state: e.state,
          type: e.type,
          rating: Number(e.rating ?? 0),
          revenueCents: revenueMap.get(e.id) ?? 0,
          subscriptions: subsMap.get(e.id) ?? 0,
          checkins: checkinsMap.get(e.id) ?? 0,
          presentNow: presentMap.get(e.id) ?? 0,
        }))
        .sort((a, b) => b.checkins - a.checkins);
    },
    [],
    "getRankingEstabelecimentos"
  );
}

// ============================================================
// Ranking de usuários
// ============================================================

export interface UserRanking {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  checkins: number;
  contactsSent: number;
  contactsAccepted: number;
  creditsSpent: number;
  messagesCount: number;
}

export async function getRankingUsuarios(period: Period = "30d"): Promise<UserRanking[]> {
  const { start, end } = resolveRange(period);

  if (isMockMode()) {
    return [
      { id: "u1", name: "Mariana Costa", city: "Itajaí", state: "SC", checkins: 14, contactsSent: 22, contactsAccepted: 17, creditsSpent: 240, messagesCount: 142 },
      { id: "u2", name: "Lucas Andrade", city: "Bal. Camboriú", state: "SC", checkins: 12, contactsSent: 18, contactsAccepted: 14, creditsSpent: 180, messagesCount: 98 },
      { id: "u3", name: "Bruno Salles", city: "Itajaí", state: "SC", checkins: 9, contactsSent: 12, contactsAccepted: 10, creditsSpent: 120, messagesCount: 56 },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();

      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const [profilesRes, checkins, contacts, txs, messages] = await Promise.all([
        sb.from("profiles").select("id, name, city, state").eq("role", "user").limit(500),
        sb.from("checkins").select("profile_id").gte("checked_in_at", startIso).lte("checked_in_at", endIso).limit(50000),
        sb.from("contact_requests").select("from_profile_id, status").gte("created_at", startIso).lte("created_at", endIso).limit(50000),
        sb.from("credit_transactions").select("profile_id, amount").eq("kind", "spend").gte("created_at", startIso).lte("created_at", endIso).limit(50000),
        sb.from("messages").select("sender_id").gte("created_at", startIso).lte("created_at", endIso).limit(50000),
      ]);

      const profiles = (profilesRes.data ?? []) as Array<{
        id: string;
        name: string | null;
        city: string | null;
        state: string | null;
      }>;

      const checkinsMap = new Map<string, number>();
      for (const c of (checkins.data ?? []) as Array<{ profile_id: string }>) {
        checkinsMap.set(c.profile_id, (checkinsMap.get(c.profile_id) ?? 0) + 1);
      }

      const sentMap = new Map<string, number>();
      const acceptedMap = new Map<string, number>();
      for (const c of (contacts.data ?? []) as Array<{ from_profile_id: string; status: string }>) {
        sentMap.set(c.from_profile_id, (sentMap.get(c.from_profile_id) ?? 0) + 1);
        if (c.status === "accepted") {
          acceptedMap.set(c.from_profile_id, (acceptedMap.get(c.from_profile_id) ?? 0) + 1);
        }
      }

      const spentMap = new Map<string, number>();
      for (const t of (txs.data ?? []) as Array<{ profile_id: string; amount: number }>) {
        spentMap.set(t.profile_id, (spentMap.get(t.profile_id) ?? 0) + Math.abs(t.amount ?? 0));
      }

      const msgsMap = new Map<string, number>();
      for (const m of (messages.data ?? []) as Array<{ sender_id: string }>) {
        msgsMap.set(m.sender_id, (msgsMap.get(m.sender_id) ?? 0) + 1);
      }

      return profiles
        .map((p) => ({
          id: p.id,
          name: p.name ?? "—",
          city: p.city,
          state: p.state,
          checkins: checkinsMap.get(p.id) ?? 0,
          contactsSent: sentMap.get(p.id) ?? 0,
          contactsAccepted: acceptedMap.get(p.id) ?? 0,
          creditsSpent: spentMap.get(p.id) ?? 0,
          messagesCount: msgsMap.get(p.id) ?? 0,
        }))
        .filter((u) => u.checkins + u.contactsSent + u.messagesCount > 0)
        .sort((a, b) => b.checkins - a.checkins);
    },
    [],
    "getRankingUsuarios"
  );
}

// ============================================================
// Ranking por categoria (tipo de estabelecimento)
// ============================================================

export interface CategoryRanking {
  type: string;
  label: string;
  count: number;
  checkins: number;
  revenueCents: number;
}

const TYPE_LABELS: Record<string, string> = {
  bar: "Bares",
  restaurant: "Restaurantes",
  club: "Casas noturnas",
  show: "Casas de show",
  lounge: "Lounges & Beach Clubs",
};

export async function getRankingCategorias(period: Period = "30d"): Promise<CategoryRanking[]> {
  const { start, end } = resolveRange(period);

  if (isMockMode()) {
    return [
      { type: "lounge", label: TYPE_LABELS.lounge, count: 8, checkins: 1820, revenueCents: 3_200_000 },
      { type: "bar", label: TYPE_LABELS.bar, count: 12, checkins: 1240, revenueCents: 1_800_000 },
      { type: "club", label: TYPE_LABELS.club, count: 4, checkins: 920, revenueCents: 1_400_000 },
      { type: "restaurant", label: TYPE_LABELS.restaurant, count: 14, checkins: 720, revenueCents: 980_000 },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const [estabsRes, subsRes, checkinsRes] = await Promise.all([
        sb.from("establishments").select("id, type"),
        sb.from("subscriptions").select("establishment_id, amount_cents").eq("status", "active"),
        sb.from("checkins").select("establishment_id").gte("checked_in_at", start.toISOString()).lte("checked_in_at", end.toISOString()).limit(50000),
      ]);

      const estabsByType = new Map<string, { count: number; ids: string[] }>();
      for (const e of (estabsRes.data ?? []) as Array<{ id: string; type: string }>) {
        const t = e.type ?? "other";
        const cur = estabsByType.get(t) ?? { count: 0, ids: [] };
        cur.count += 1;
        cur.ids.push(e.id);
        estabsByType.set(t, cur);
      }

      const idToType = new Map<string, string>();
      for (const [t, v] of estabsByType) {
        for (const id of v.ids) idToType.set(id, t);
      }

      const revenueByType = new Map<string, number>();
      for (const s of (subsRes.data ?? []) as Array<{ establishment_id: string | null; amount_cents: number }>) {
        if (!s.establishment_id) continue;
        const t = idToType.get(s.establishment_id);
        if (!t) continue;
        revenueByType.set(t, (revenueByType.get(t) ?? 0) + (s.amount_cents ?? 0));
      }

      const checkinsByType = new Map<string, number>();
      for (const c of (checkinsRes.data ?? []) as Array<{ establishment_id: string }>) {
        const t = idToType.get(c.establishment_id);
        if (!t) continue;
        checkinsByType.set(t, (checkinsByType.get(t) ?? 0) + 1);
      }

      return Array.from(estabsByType.entries())
        .map(([type, v]) => ({
          type,
          label: TYPE_LABELS[type] ?? type,
          count: v.count,
          checkins: checkinsByType.get(type) ?? 0,
          revenueCents: revenueByType.get(type) ?? 0,
        }))
        .sort((a, b) => b.checkins - a.checkins);
    },
    [],
    "getRankingCategorias"
  );
}

// ============================================================
// Ranking por cidade
// ============================================================

export interface CityRanking {
  city: string;
  state: string;
  estabsCount: number;
  usersCount: number;
  checkins: number;
  presentNow: number;
}

export async function getRankingCidades(period: Period = "30d"): Promise<CityRanking[]> {
  const { start, end } = resolveRange(period);

  if (isMockMode()) {
    return [
      { city: "Itajaí", state: "SC", estabsCount: 8, usersCount: 142, checkins: 820, presentNow: 78 },
      { city: "Balneário Camboriú", state: "SC", estabsCount: 6, usersCount: 98, checkins: 540, presentNow: 65 },
      { city: "Florianópolis", state: "SC", estabsCount: 4, usersCount: 76, checkins: 380, presentNow: 50 },
      { city: "Bombinhas", state: "SC", estabsCount: 2, usersCount: 24, checkins: 110, presentNow: 18 },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const [estabsRes, profilesRes, checkinsRes, activeRes] = await Promise.all([
        sb.from("establishments").select("id, city, state"),
        sb.from("profiles").select("city, state").eq("role", "user").limit(50000),
        sb
          .from("checkins")
          .select("establishment_id")
          .gte("checked_in_at", start.toISOString())
          .lte("checked_in_at", end.toISOString())
          .limit(50000),
        sb.from("checkins").select("establishment_id").eq("status", "active").limit(10000),
      ]);

      const estabs = (estabsRes.data ?? []) as Array<{ id: string; city: string; state: string }>;
      const idToCity = new Map<string, string>();
      const cityKeys = new Map<string, { city: string; state: string; estabs: number }>();
      for (const e of estabs) {
        const key = `${e.city}|${e.state}`;
        idToCity.set(e.id, key);
        const cur = cityKeys.get(key) ?? { city: e.city, state: e.state, estabs: 0 };
        cur.estabs += 1;
        cityKeys.set(key, cur);
      }

      const usersMap = new Map<string, number>();
      for (const p of (profilesRes.data ?? []) as Array<{ city: string | null; state: string | null }>) {
        if (!p.city || !p.state) continue;
        const key = `${p.city}|${p.state}`;
        usersMap.set(key, (usersMap.get(key) ?? 0) + 1);
      }

      const checkinsMap = new Map<string, number>();
      for (const c of (checkinsRes.data ?? []) as Array<{ establishment_id: string }>) {
        const key = idToCity.get(c.establishment_id);
        if (!key) continue;
        checkinsMap.set(key, (checkinsMap.get(key) ?? 0) + 1);
      }

      const presentMap = new Map<string, number>();
      for (const c of (activeRes.data ?? []) as Array<{ establishment_id: string }>) {
        const key = idToCity.get(c.establishment_id);
        if (!key) continue;
        presentMap.set(key, (presentMap.get(key) ?? 0) + 1);
      }

      // Inclui cidades de usuários que não têm estab cadastrado
      for (const key of usersMap.keys()) {
        if (!cityKeys.has(key)) {
          const [city, state] = key.split("|");
          cityKeys.set(key, { city, state, estabs: 0 });
        }
      }

      return Array.from(cityKeys.entries())
        .map(([key, v]) => ({
          city: v.city,
          state: v.state,
          estabsCount: v.estabs,
          usersCount: usersMap.get(key) ?? 0,
          checkins: checkinsMap.get(key) ?? 0,
          presentNow: presentMap.get(key) ?? 0,
        }))
        .sort((a, b) => b.checkins - a.checkins);
    },
    [],
    "getRankingCidades"
  );
}
