import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import { resolveRange, type Period } from "./admin-reports";

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin-indices] ${label}:`, err);
    return fallback;
  }
}

// ============================================================
// Hourly: check-ins/messages por hora do dia (0-23)
// ============================================================

export interface HourlyPoint {
  hour: number; // 0-23
  count: number;
}

function buildHourly(): HourlyPoint[] {
  return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
}

function mockHourly(base: number): HourlyPoint[] {
  // Padrão noturno (madrugada/noite com pico)
  const profile = [4, 2, 1, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 4, 5, 6, 8, 12, 16, 18, 14, 8];
  return profile.map((m, h) => ({ hour: h, count: Math.round(base * (m / 10)) }));
}

export async function getCheckinsHourly(period: Period = "30d"): Promise<HourlyPoint[]> {
  const { start, end } = resolveRange(period);
  if (isMockMode()) return mockHourly(80);

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("checkins")
        .select("checked_in_at")
        .gte("checked_in_at", start.toISOString())
        .lte("checked_in_at", end.toISOString())
        .limit(50000);
      if (error) throw error;
      const buckets = buildHourly();
      for (const row of (data ?? []) as Array<{ checked_in_at: string }>) {
        const h = new Date(row.checked_in_at).getHours();
        if (h >= 0 && h <= 23) buckets[h].count += 1;
      }
      return buckets;
    },
    buildHourly(),
    "getCheckinsHourly"
  );
}

export async function getMessagesHourly(period: Period = "30d"): Promise<HourlyPoint[]> {
  const { start, end } = resolveRange(period);
  if (isMockMode()) return mockHourly(120);

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("messages")
        .select("created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .limit(50000);
      if (error) throw error;
      const buckets = buildHourly();
      for (const row of (data ?? []) as Array<{ created_at: string }>) {
        const h = new Date(row.created_at).getHours();
        if (h >= 0 && h <= 23) buckets[h].count += 1;
      }
      return buckets;
    },
    buildHourly(),
    "getMessagesHourly"
  );
}

// ============================================================
// Heatmap: dia da semana (0=dom .. 6=sáb) × hora (0-23)
// ============================================================

export interface HeatmapCell {
  day: number; // 0-6 (dom..sáb)
  hour: number; // 0-23
  count: number;
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildHeatmapEmpty(): HeatmapCell[] {
  const out: HeatmapCell[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      out.push({ day: d, hour: h, count: 0 });
    }
  }
  return out;
}

function mockHeatmap(): HeatmapCell[] {
  const cells = buildHeatmapEmpty();
  // Fim-de-semana à noite tem mais movimento
  for (const c of cells) {
    const dayBoost = [0.6, 0.4, 0.5, 0.6, 0.9, 1.6, 1.8][c.day];
    const hourBoost =
      c.hour >= 19 ? 2.2 : c.hour >= 17 ? 1.4 : c.hour >= 12 ? 0.8 : c.hour >= 6 ? 0.3 : 0.15;
    c.count = Math.round(30 * dayBoost * hourBoost + ((c.day * 7 + c.hour * 3) % 8));
  }
  return cells;
}

export async function getHeatmapCheckins(period: Period = "30d"): Promise<HeatmapCell[]> {
  const { start, end } = resolveRange(period);
  if (isMockMode()) return mockHeatmap();

  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data, error } = await sb
        .from("checkins")
        .select("checked_in_at")
        .gte("checked_in_at", start.toISOString())
        .lte("checked_in_at", end.toISOString())
        .limit(50000);
      if (error) throw error;
      const cells = buildHeatmapEmpty();
      for (const row of (data ?? []) as Array<{ checked_in_at: string }>) {
        const d = new Date(row.checked_in_at);
        const day = d.getDay();
        const hour = d.getHours();
        const idx = day * 24 + hour;
        if (cells[idx]) cells[idx].count += 1;
      }
      return cells;
    },
    buildHeatmapEmpty(),
    "getHeatmapCheckins"
  );
}

export { DAY_LABELS };

// ============================================================
// Locais com mais X (cidades agregadas)
// ============================================================

export interface LocalRow {
  city: string;
  state: string;
  count: number;
}

export async function getLocalsByEstabs(): Promise<LocalRow[]> {
  if (isMockMode()) {
    return [
      { city: "Itajaí", state: "SC", count: 8 },
      { city: "Balneário Camboriú", state: "SC", count: 6 },
      { city: "Florianópolis", state: "SC", count: 4 },
    ];
  }
  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data } = await sb.from("establishments").select("city, state").limit(10000);
      const map = new Map<string, { city: string; state: string; count: number }>();
      for (const e of (data ?? []) as Array<{ city: string; state: string }>) {
        const key = `${e.city}|${e.state}`;
        const cur = map.get(key) ?? { city: e.city, state: e.state, count: 0 };
        cur.count += 1;
        map.set(key, cur);
      }
      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    },
    [],
    "getLocalsByEstabs"
  );
}

export async function getLocalsByUsers(): Promise<LocalRow[]> {
  if (isMockMode()) {
    return [
      { city: "Itajaí", state: "SC", count: 142 },
      { city: "Balneário Camboriú", state: "SC", count: 98 },
      { city: "Florianópolis", state: "SC", count: 76 },
    ];
  }
  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data } = await sb
        .from("profiles")
        .select("city, state")
        .eq("role", "user")
        .not("city", "is", null)
        .limit(50000);
      const map = new Map<string, { city: string; state: string; count: number }>();
      for (const p of (data ?? []) as Array<{ city: string | null; state: string | null }>) {
        if (!p.city || !p.state) continue;
        const key = `${p.city}|${p.state}`;
        const cur = map.get(key) ?? { city: p.city, state: p.state, count: 0 };
        cur.count += 1;
        map.set(key, cur);
      }
      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    },
    [],
    "getLocalsByUsers"
  );
}

export async function getLocalsByCheckins(period: Period = "30d"): Promise<LocalRow[]> {
  const { start, end } = resolveRange(period);
  if (isMockMode()) {
    return [
      { city: "Itajaí", state: "SC", count: 820 },
      { city: "Balneário Camboriú", state: "SC", count: 540 },
      { city: "Florianópolis", state: "SC", count: 380 },
    ];
  }
  return safe(
    async () => {
      const sb = await supabaseServer();
      // Vamos buscar checkins + estabs em paralelo e correlacionar
      const [checkinsRes, estabsRes] = await Promise.all([
        sb
          .from("checkins")
          .select("establishment_id")
          .gte("checked_in_at", start.toISOString())
          .lte("checked_in_at", end.toISOString())
          .limit(50000),
        sb.from("establishments").select("id, city, state"),
      ]);

      const idToLoc = new Map<string, { city: string; state: string }>();
      for (const e of (estabsRes.data ?? []) as Array<{ id: string; city: string; state: string }>) {
        idToLoc.set(e.id, { city: e.city, state: e.state });
      }

      const map = new Map<string, { city: string; state: string; count: number }>();
      for (const c of (checkinsRes.data ?? []) as Array<{ establishment_id: string }>) {
        const loc = idToLoc.get(c.establishment_id);
        if (!loc) continue;
        const key = `${loc.city}|${loc.state}`;
        const cur = map.get(key) ?? { city: loc.city, state: loc.state, count: 0 };
        cur.count += 1;
        map.set(key, cur);
      }

      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    },
    [],
    "getLocalsByCheckins"
  );
}
