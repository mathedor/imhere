import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

// ============================================================
// Helpers de período
// ============================================================

export type Period = "today" | "7d" | "30d" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export function resolveRange(period: Period, fromIso?: string, toIso?: string): DateRange {
  const end = toIso ? new Date(toIso) : new Date();
  let start: Date;
  if (period === "custom" && fromIso) {
    start = new Date(fromIso);
  } else {
    start = new Date(end);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "7d") start.setDate(start.getDate() - 6);
    else start.setDate(start.getDate() - 29); // 30d
  }
  return { start, end };
}

export interface DailyPoint {
  label: string;
  value: number;
}

function buildDailyBuckets(start: Date, end: Date): Map<string, number> {
  const m = new Map<string, number>();
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    m.set(cur.toISOString().slice(0, 10), 0);
    cur.setDate(cur.getDate() + 1);
  }
  return m;
}

function bucketsToSeries(buckets: Map<string, number>): DailyPoint[] {
  return Array.from(buckets.entries()).map(([iso, value]) => {
    const [, m, d] = iso.split("-");
    return { label: `${d}/${m}`, value };
  });
}

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin-reports] ${label} falhou:`, err);
    return fallback;
  }
}

// ============================================================
// Check-ins (com estabId opcional)
// ============================================================

export interface CheckinReport {
  total: number;
  series: DailyPoint[];
  avgDaily: number;
  peakDay: { label: string; value: number } | null;
}

export async function getCheckinReport(
  period: Period,
  options: { estabId?: string; fromIso?: string; toIso?: string } = {}
): Promise<CheckinReport> {
  const { start, end } = resolveRange(period, options.fromIso, options.toIso);
  const buckets = buildDailyBuckets(start, end);

  if (isMockMode()) {
    let i = 0;
    for (const key of buckets.keys()) {
      const dow = new Date(key).getDay();
      const boost = [0.6, 0.5, 0.8, 1.2, 1.6, 2.1, 1.7][dow];
      buckets.set(key, Math.round(50 * boost + ((i * 11) % 17)));
      i++;
    }
    const series = bucketsToSeries(buckets);
    const total = series.reduce((a, p) => a + p.value, 0);
    const peakDay = series.reduce((max, p) => (max && max.value >= p.value ? max : p), null as DailyPoint | null);
    return { total, series, avgDaily: series.length > 0 ? Math.round(total / series.length) : 0, peakDay };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      let q = sb
        .from("checkins")
        .select("checked_in_at")
        .gte("checked_in_at", start.toISOString())
        .lte("checked_in_at", end.toISOString())
        .limit(50000);
      if (options.estabId) q = q.eq("establishment_id", options.estabId);
      const { data, error } = await q;
      if (error) throw error;

      for (const row of (data ?? []) as Array<{ checked_in_at: string }>) {
        const key = row.checked_in_at?.slice(0, 10);
        if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      const series = bucketsToSeries(buckets);
      const total = series.reduce((a, p) => a + p.value, 0);
      const peakDay = series.reduce(
        (max, p) => (max && max.value >= p.value ? max : p),
        null as DailyPoint | null
      );
      return {
        total,
        series,
        avgDaily: series.length > 0 ? Math.round(total / series.length) : 0,
        peakDay,
      };
    },
    { total: 0, series: bucketsToSeries(buckets), avgDaily: 0, peakDay: null },
    "getCheckinReport"
  );
}

// ============================================================
// Novos usuários por período
// ============================================================

export interface NewUsersReport {
  total: number;
  series: DailyPoint[];
}

export async function getNewUsersReport(
  period: Period,
  options: { fromIso?: string; toIso?: string } = {}
): Promise<NewUsersReport> {
  const { start, end } = resolveRange(period, options.fromIso, options.toIso);
  const buckets = buildDailyBuckets(start, end);

  if (isMockMode()) {
    let i = 0;
    for (const key of buckets.keys()) {
      buckets.set(key, Math.round(20 + ((i * 7) % 25)));
      i++;
    }
    const series = bucketsToSeries(buckets);
    return { total: series.reduce((a, p) => a + p.value, 0), series };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("profiles")
        .select("created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .limit(50000);
      if (error) throw error;
      for (const row of (data ?? []) as Array<{ created_at: string }>) {
        const key = row.created_at?.slice(0, 10);
        if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      const series = bucketsToSeries(buckets);
      return { total: series.reduce((a, p) => a + p.value, 0), series };
    },
    { total: 0, series: bucketsToSeries(buckets) },
    "getNewUsersReport"
  );
}

// ============================================================
// Usuários online agora (check-ins ativos)
// ============================================================

export interface OnlineUsersReport {
  total: number;
  byGender: { male: number; female: number; other: number; na: number };
  byCity: Array<{ city: string; count: number }>;
}

export async function getOnlineUsersReport(): Promise<OnlineUsersReport> {
  if (isMockMode()) {
    return {
      total: 248,
      byGender: { male: 110, female: 122, other: 12, na: 4 },
      byCity: [
        { city: "Itajaí", count: 78 },
        { city: "Balneário Camboriú", count: 65 },
        { city: "Florianópolis", count: 50 },
      ],
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("checkins")
        .select("profile_id, profiles(gender, city)")
        .eq("status", "active")
        .limit(10000);
      if (error) throw error;

      const rows = (data ?? []) as unknown as Array<{
        profiles: { gender: string | null; city: string | null } | null;
      }>;

      const byGender = { male: 0, female: 0, other: 0, na: 0 };
      const cityMap = new Map<string, number>();

      for (const r of rows) {
        const g = (r.profiles?.gender ?? "na") as keyof typeof byGender;
        if (g in byGender) byGender[g] += 1;
        else byGender.na += 1;
        const c = r.profiles?.city ?? "—";
        cityMap.set(c, (cityMap.get(c) ?? 0) + 1);
      }

      const byCity = Array.from(cityMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return { total: rows.length, byGender, byCity };
    },
    { total: 0, byGender: { male: 0, female: 0, other: 0, na: 0 }, byCity: [] },
    "getOnlineUsersReport"
  );
}

// ============================================================
// Buscas feitas
// ============================================================

export interface SearchReport {
  total: number;
  series: DailyPoint[];
  topQueries: Array<{ query: string; count: number }>;
}

export async function getSearchReport(
  period: Period,
  options: { fromIso?: string; toIso?: string } = {}
): Promise<SearchReport> {
  const { start, end } = resolveRange(period, options.fromIso, options.toIso);
  const buckets = buildDailyBuckets(start, end);

  if (isMockMode()) {
    let i = 0;
    for (const key of buckets.keys()) {
      buckets.set(key, Math.round(80 + ((i * 13) % 60)));
      i++;
    }
    const series = bucketsToSeries(buckets);
    return {
      total: series.reduce((a, p) => a + p.value, 0),
      series,
      topQueries: [
        { query: "bar", count: 142 },
        { query: "balada", count: 98 },
        { query: "restaurante", count: 76 },
        { query: "sushi", count: 41 },
      ],
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("search_events")
        .select("query, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .limit(50000);
      if (error) throw error;

      const queryMap = new Map<string, number>();
      for (const row of (data ?? []) as Array<{ query: string | null; created_at: string }>) {
        const key = row.created_at?.slice(0, 10);
        if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
        const q = (row.query ?? "").trim().toLowerCase();
        if (q) queryMap.set(q, (queryMap.get(q) ?? 0) + 1);
      }

      const series = bucketsToSeries(buckets);
      const topQueries = Array.from(queryMap.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return { total: series.reduce((a, p) => a + p.value, 0), series, topQueries };
    },
    { total: 0, series: bucketsToSeries(buckets), topQueries: [] },
    "getSearchReport"
  );
}

// ============================================================
// Tentativas de contato (sucesso, recusadas, pendentes)
// ============================================================

export interface ContactReport {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptedPct: number;
  series: { date: DailyPoint["label"]; accepted: number; rejected: number; pending: number }[];
}

export async function getContactReport(
  period: Period,
  options: { fromIso?: string; toIso?: string } = {}
): Promise<ContactReport> {
  const { start, end } = resolveRange(period, options.fromIso, options.toIso);
  const buckets = buildDailyBuckets(start, end);

  if (isMockMode()) {
    return {
      total: 412,
      accepted: 278,
      rejected: 84,
      pending: 50,
      acceptedPct: 78,
      series: bucketsToSeries(buckets).map((d) => ({
        date: d.label,
        accepted: Math.round(8 + Math.random() * 12),
        rejected: Math.round(2 + Math.random() * 4),
        pending: Math.round(1 + Math.random() * 3),
      })),
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("contact_requests")
        .select("status, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .limit(50000);
      if (error) throw error;

      const dayMap = new Map<string, { accepted: number; rejected: number; pending: number }>();
      for (const key of buckets.keys()) {
        dayMap.set(key, { accepted: 0, rejected: 0, pending: 0 });
      }

      let accepted = 0;
      let rejected = 0;
      let pending = 0;
      for (const row of (data ?? []) as Array<{ status: string; created_at: string }>) {
        const key = row.created_at?.slice(0, 10);
        if (!key) continue;
        const bucket = dayMap.get(key);
        const s = row.status;
        if (s === "accepted") accepted += 1;
        else if (s === "rejected") rejected += 1;
        else pending += 1;
        if (bucket) {
          if (s === "accepted") bucket.accepted += 1;
          else if (s === "rejected") bucket.rejected += 1;
          else bucket.pending += 1;
        }
      }

      const total = accepted + rejected + pending;
      const responded = accepted + rejected;
      const acceptedPct = responded > 0 ? Math.round((accepted / responded) * 100) : 0;

      const series = Array.from(dayMap.entries()).map(([iso, vals]) => {
        const [, m, d] = iso.split("-");
        return { date: `${d}/${m}`, ...vals };
      });

      return { total, accepted, rejected, pending, acceptedPct, series };
    },
    { total: 0, accepted: 0, rejected: 0, pending: 0, acceptedPct: 0, series: [] },
    "getContactReport"
  );
}

// ============================================================
// Distribuição por gênero (cadastros e online)
// ============================================================

export interface GenderReport {
  registered: { male: number; female: number; other: number; na: number };
  online: { male: number; female: number; other: number; na: number };
}

export async function getGenderReport(): Promise<GenderReport> {
  if (isMockMode()) {
    return {
      registered: { male: 5230, female: 6840, other: 220, na: 128 },
      online: { male: 110, female: 122, other: 12, na: 4 },
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const [{ data: allProfiles }, online] = await Promise.all([
        sb.from("profiles").select("gender").eq("role", "user").limit(50000),
        getOnlineUsersReport(),
      ]);

      const registered = { male: 0, female: 0, other: 0, na: 0 };
      for (const row of (allProfiles ?? []) as Array<{ gender: string | null }>) {
        const g = (row.gender ?? "na") as keyof typeof registered;
        if (g in registered) registered[g] += 1;
        else registered.na += 1;
      }

      return { registered, online: online.byGender };
    },
    {
      registered: { male: 0, female: 0, other: 0, na: 0 },
      online: { male: 0, female: 0, other: 0, na: 0 },
    },
    "getGenderReport"
  );
}

// ============================================================
// Comparativo com concorrência (estabs próximos + movimento)
// ============================================================

export interface CompetitorRow {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  rating: number;
  checkinsToday: number;
  presentNow: number;
}

export async function getCompetitorReport(targetEstabId: string): Promise<CompetitorRow[]> {
  if (isMockMode()) {
    return [
      { id: "e1", name: "Lume Rooftop", city: "Itajaí", distanceKm: 0.4, rating: 4.6, checkinsToday: 78, presentNow: 32 },
      { id: "e2", name: "Beach Club Sun", city: "Itajaí", distanceKm: 1.2, rating: 4.4, checkinsToday: 64, presentNow: 28 },
      { id: "e3", name: "Mar Azul", city: "Balneário", distanceKm: 2.3, rating: 4.2, checkinsToday: 52, presentNow: 19 },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();

      // Pega o estab base + coordenadas
      const { data: target } = await sb
        .from("establishments")
        .select("id, geo, city")
        .eq("id", targetEstabId)
        .maybeSingle();

      if (!target?.geo) return [];

      // Extrai lat/lng do PostGIS geography (point)
      const geoStr = typeof target.geo === "string" ? target.geo : "";
      const match = geoStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (!match) return [];
      const lng = Number(match[1]);
      const lat = Number(match[2]);

      // Chama RPC pra pegar próximos com PostGIS
      const { data: nearby, error } = await sb.rpc("nearby_establishments", {
        user_lat: lat,
        user_lng: lng,
        radius_km: 10,
        sort: "busiest",
      });
      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const competitorIds = ((nearby ?? []) as Array<{ id: string }>)
        .filter((e) => e.id !== targetEstabId)
        .slice(0, 8)
        .map((e) => e.id);

      // Conta check-ins de hoje para cada competidor
      const { data: checkinsToday } = competitorIds.length
        ? await sb
            .from("checkins")
            .select("establishment_id")
            .in("establishment_id", competitorIds)
            .gte("checked_in_at", today.toISOString())
        : { data: [] };

      const todayMap = new Map<string, number>();
      for (const row of (checkinsToday ?? []) as Array<{ establishment_id: string }>) {
        todayMap.set(row.establishment_id, (todayMap.get(row.establishment_id) ?? 0) + 1);
      }

      return ((nearby ?? []) as Array<{
        id: string;
        name: string;
        city: string;
        distance_km: number | null;
        rating: number | null;
        present_count: number;
      }>)
        .filter((e) => e.id !== targetEstabId)
        .slice(0, 8)
        .map((e) => ({
          id: e.id,
          name: e.name,
          city: e.city,
          distanceKm: Number((e.distance_km ?? 0).toFixed(2)),
          rating: Number(e.rating ?? 0),
          checkinsToday: todayMap.get(e.id) ?? 0,
          presentNow: Number(e.present_count ?? 0),
        }));
    },
    [],
    "getCompetitorReport"
  );
}
