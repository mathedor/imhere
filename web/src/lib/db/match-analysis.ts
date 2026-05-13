import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[match-analysis] ${label}:`, err);
    return fallback;
  }
}

export interface MyMatchStats {
  sent: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptedPct: number;
  acceptedByGender: { male: number; female: number; other: number; na: number };
  ranking?: { position: number; total: number; percentile: number };
}

export async function getMyMatchStats(): Promise<MyMatchStats> {
  if (isMockMode()) {
    return {
      sent: 24,
      accepted: 18,
      rejected: 4,
      pending: 2,
      acceptedPct: 81,
      acceptedByGender: { male: 0, female: 18, other: 0, na: 0 },
      ranking: { position: 142, total: 5230, percentile: 97 },
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) throw new Error("not authenticated");

      // Meus contatos enviados
      const { data: sent } = await sb
        .from("contact_requests")
        .select("status, to_profile_id, profiles!to_profile_id(gender)")
        .eq("from_profile_id", user.id)
        .limit(5000);

      type SentRow = {
        status: string;
        to_profile_id: string;
        profiles: { gender: string | null } | null;
      };
      const rows = (sent ?? []) as unknown as SentRow[];

      const accepted = rows.filter((r) => r.status === "accepted").length;
      const rejected = rows.filter((r) => r.status === "rejected").length;
      const pending = rows.filter((r) => r.status === "pending").length;
      const total = rows.length;
      const responded = accepted + rejected;
      const pct = responded > 0 ? Math.round((accepted / responded) * 100) : 0;

      const byGender = { male: 0, female: 0, other: 0, na: 0 };
      for (const r of rows) {
        if (r.status !== "accepted") continue;
        const g = (r.profiles?.gender ?? "na") as keyof typeof byGender;
        if (g in byGender) byGender[g] += 1;
      }

      return {
        sent: total,
        accepted,
        rejected,
        pending,
        acceptedPct: pct,
        acceptedByGender: byGender,
      };
    },
    {
      sent: 0,
      accepted: 0,
      rejected: 0,
      pending: 0,
      acceptedPct: 0,
      acceptedByGender: { male: 0, female: 0, other: 0, na: 0 },
    },
    "getMyMatchStats"
  );
}

// ============================================================
// Admin: análise agregada de aceitação por gênero / cidade
// ============================================================

export interface GenderAcceptRow {
  gender: string;
  totalReceived: number;
  accepted: number;
  acceptedPct: number;
}

export async function getAggregateAcceptanceByGender(): Promise<GenderAcceptRow[]> {
  if (isMockMode()) {
    return [
      { gender: "female", totalReceived: 1842, accepted: 1024, acceptedPct: 56 },
      { gender: "male", totalReceived: 1432, accepted: 612, acceptedPct: 43 },
      { gender: "other", totalReceived: 132, accepted: 78, acceptedPct: 59 },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data } = await sb
        .from("contact_requests")
        .select("status, to_profile_id, profiles!to_profile_id(gender)")
        .in("status", ["accepted", "rejected"])
        .limit(50000);

      type Row = {
        status: string;
        profiles: { gender: string | null } | null;
      };
      const stats = new Map<string, { total: number; accepted: number }>();
      for (const r of ((data ?? []) as unknown as Row[])) {
        const g = r.profiles?.gender ?? "na";
        const cur = stats.get(g) ?? { total: 0, accepted: 0 };
        cur.total += 1;
        if (r.status === "accepted") cur.accepted += 1;
        stats.set(g, cur);
      }

      return Array.from(stats.entries())
        .map(([gender, s]) => ({
          gender,
          totalReceived: s.total,
          accepted: s.accepted,
          acceptedPct: s.total > 0 ? Math.round((s.accepted / s.total) * 100) : 0,
        }))
        .sort((a, b) => b.totalReceived - a.totalReceived);
    },
    [],
    "getAggregateAcceptanceByGender"
  );
}

// ============================================================
// Estab funil: pageviews -> checkin -> message -> retorno
// ============================================================

export interface EstabFunnelStage {
  key: string;
  label: string;
  count: number;
  pctOfPrev: number;
}

export async function getEstabConversionFunnel(estabId: string, days = 30): Promise<EstabFunnelStage[]> {
  if (isMockMode()) {
    const stages = [
      { key: "checkin", label: "Check-in feito", count: 412 },
      { key: "message", label: "Iniciou conversa no local", count: 198 },
      { key: "accepted", label: "Conversa aceita", count: 124 },
      { key: "returned", label: "Voltou ao estab", count: 58 },
    ];
    return stages.map((s, i) => ({
      ...s,
      pctOfPrev: i === 0 ? 100 : stages[i - 1].count > 0 ? Math.round((s.count / stages[i - 1].count) * 100) : 0,
    }));
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const start = new Date(Date.now() - days * 86400_000).toISOString();

      const [checkins, messages, contacts] = await Promise.all([
        sb.from("checkins").select("profile_id").eq("establishment_id", estabId).gte("checked_in_at", start).limit(50000),
        sb.from("contact_requests")
          .select("from_profile_id, status")
          .eq("establishment_id", estabId)
          .gte("created_at", start)
          .limit(50000),
        sb.from("checkins").select("profile_id, checked_in_at").eq("establishment_id", estabId).limit(50000),
      ]);

      const checkinUsers = new Set((checkins.data ?? []).map((r) => (r as { profile_id: string }).profile_id));
      const messageUsers = new Set(
        (messages.data ?? []).map((r) => (r as { from_profile_id: string }).from_profile_id)
      );
      const acceptedUsers = new Set(
        ((messages.data ?? []) as Array<{ from_profile_id: string; status: string }>)
          .filter((r) => r.status === "accepted")
          .map((r) => r.from_profile_id)
      );

      // Retorno: quem fez >= 2 check-ins
      const allCheckins = (contacts.data ?? []) as Array<{ profile_id: string }>;
      const countByUser = new Map<string, number>();
      for (const c of allCheckins) {
        countByUser.set(c.profile_id, (countByUser.get(c.profile_id) ?? 0) + 1);
      }
      const returnedUsers = Array.from(checkinUsers).filter((u) => (countByUser.get(u) ?? 0) >= 2);

      const stages = [
        { key: "checkin", label: "Check-in feito", count: checkinUsers.size },
        { key: "message", label: "Iniciou conversa no local", count: messageUsers.size },
        { key: "accepted", label: "Conversa aceita", count: acceptedUsers.size },
        { key: "returned", label: "Voltou ao estab", count: returnedUsers.length },
      ];
      return stages.map((s, i) => ({
        ...s,
        pctOfPrev:
          i === 0 ? 100 : stages[i - 1].count > 0 ? Math.round((s.count / stages[i - 1].count) * 100) : 0,
      }));
    },
    [],
    "getEstabConversionFunnel"
  );
}

// ============================================================
// Mapa: estabs com coords + usuários por cidade
// ============================================================

export interface MapMarker {
  kind: "estab";
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  presentNow: number;
  hasMoment: boolean;
}

export interface CityHeatPoint {
  city: string;
  state: string;
  lat: number;
  lng: number;
  userCount: number;
  estabCount: number;
}

// Aproximação grosseira: centroide médio dos estabs por cidade
export async function getMapData(): Promise<{ markers: MapMarker[]; heat: CityHeatPoint[] }> {
  if (isMockMode()) {
    return {
      markers: [
        { kind: "estab", id: "1", name: "Bravo Mar", city: "Itajaí", lat: -26.9078, lng: -48.6635, presentNow: 28, hasMoment: true },
        { kind: "estab", id: "2", name: "Lume Rooftop", city: "Itajaí", lat: -26.9085, lng: -48.6610, presentNow: 18, hasMoment: false },
        { kind: "estab", id: "3", name: "Beach Sunset", city: "Bal. Camboriú", lat: -26.9961, lng: -48.6359, presentNow: 12, hasMoment: false },
      ],
      heat: [
        { city: "Itajaí", state: "SC", lat: -26.9078, lng: -48.6635, userCount: 142, estabCount: 8 },
        { city: "Bal. Camboriú", state: "SC", lat: -26.9961, lng: -48.6359, userCount: 98, estabCount: 6 },
        { city: "Florianópolis", state: "SC", lat: -27.5949, lng: -48.5482, userCount: 76, estabCount: 4 },
      ],
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();

      const [{ data: estabs }, { data: actives }, { data: moments }, { data: profiles }] = await Promise.all([
        sb.from("establishments").select("id, name, city, state, geo").limit(2000),
        sb.from("checkins").select("establishment_id").eq("status", "active").limit(10000),
        sb.from("moments").select("establishment_id").gt("expires_at", new Date().toISOString()).limit(2000),
        sb.from("profiles").select("city, state").eq("role", "user").limit(50000),
      ]);

      const activeMap = new Map<string, number>();
      for (const a of (actives ?? []) as Array<{ establishment_id: string }>) {
        activeMap.set(a.establishment_id, (activeMap.get(a.establishment_id) ?? 0) + 1);
      }
      const momentSet = new Set((moments ?? []).map((m) => (m as { establishment_id: string }).establishment_id));

      const markers: MapMarker[] = [];
      const cityAgg = new Map<string, { city: string; state: string; latSum: number; lngSum: number; n: number; users: number; estabs: number }>();

      for (const e of (estabs ?? []) as Array<{ id: string; name: string; city: string; state: string; geo: unknown }>) {
        const geoStr = typeof e.geo === "string" ? e.geo : "";
        const match = geoStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
        if (!match) continue;
        const lng = Number(match[1]);
        const lat = Number(match[2]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        markers.push({
          kind: "estab",
          id: e.id,
          name: e.name,
          city: e.city,
          lat,
          lng,
          presentNow: activeMap.get(e.id) ?? 0,
          hasMoment: momentSet.has(e.id),
        });

        const key = `${e.city}|${e.state}`;
        const cur = cityAgg.get(key) ?? { city: e.city, state: e.state, latSum: 0, lngSum: 0, n: 0, users: 0, estabs: 0 };
        cur.latSum += lat;
        cur.lngSum += lng;
        cur.n += 1;
        cur.estabs += 1;
        cityAgg.set(key, cur);
      }

      // Conta users por cidade
      for (const p of (profiles ?? []) as Array<{ city: string | null; state: string | null }>) {
        if (!p.city || !p.state) continue;
        const key = `${p.city}|${p.state}`;
        const cur = cityAgg.get(key);
        if (cur) cur.users += 1;
      }

      const heat: CityHeatPoint[] = Array.from(cityAgg.values())
        .filter((c) => c.n > 0)
        .map((c) => ({
          city: c.city,
          state: c.state,
          lat: c.latSum / c.n,
          lng: c.lngSum / c.n,
          userCount: c.users,
          estabCount: c.estabs,
        }))
        .sort((a, b) => b.userCount + b.estabCount * 10 - (a.userCount + a.estabCount * 10));

      return { markers, heat };
    },
    { markers: [], heat: [] },
    "getMapData"
  );
}

// ============================================================
// Alertas admin (anomalias)
// ============================================================

export interface AdminAlert {
  id: string;
  kind: string;
  severity: "low" | "medium" | "high" | "critical";
  entityKind: string | null;
  entityId: string | null;
  title: string;
  body: string | null;
  resolved: boolean;
  createdAt: string;
}

export async function listAdminAlerts(includeResolved = false): Promise<AdminAlert[]> {
  if (isMockMode()) {
    return [
      {
        id: "a1",
        kind: "report_spike",
        severity: "high",
        entityKind: "global",
        entityId: null,
        title: "Pico de denúncias na última hora",
        body: "12 denúncias recebidas · revise a fila de moderação",
        resolved: false,
        createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
      },
    ];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      let query = sb.from("admin_alerts").select("*").order("created_at", { ascending: false }).limit(100);
      if (!includeResolved) query = query.eq("resolved", false);
      const { data } = await query;
      return ((data ?? []) as Array<{
        id: string;
        kind: string;
        severity: string;
        entity_kind: string | null;
        entity_id: string | null;
        title: string;
        body: string | null;
        resolved: boolean;
        created_at: string;
      }>).map((r) => ({
        id: r.id,
        kind: r.kind,
        severity: (r.severity as AdminAlert["severity"]) ?? "medium",
        entityKind: r.entity_kind,
        entityId: r.entity_id,
        title: r.title,
        body: r.body,
        resolved: r.resolved,
        createdAt: r.created_at,
      }));
    },
    [],
    "listAdminAlerts"
  );
}
