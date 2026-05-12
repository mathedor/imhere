import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface DashboardKPIs {
  totalUsers: number;
  totalEstabs: number;
  activeCheckins: number;
  mrrCents: number;
  totalInteractions: number;
  totalCreditsInEconomy: number;
  totalSubscriptions: number;
  totalMomentsActive: number;
}

const EMPTY_KPIS: DashboardKPIs = {
  totalUsers: 0,
  totalEstabs: 0,
  activeCheckins: 0,
  mrrCents: 0,
  totalInteractions: 0,
  totalCreditsInEconomy: 0,
  totalSubscriptions: 0,
  totalMomentsActive: 0,
};

export async function getAdminDashboardKPIs(): Promise<DashboardKPIs> {
  if (isMockMode()) {
    return {
      totalUsers: 12418,
      totalEstabs: 26,
      activeCheckins: 8400,
      mrrCents: 18_400_000,
      totalInteractions: 11200,
      totalCreditsInEconomy: 250 * 4,
      totalSubscriptions: 1284,
      totalMomentsActive: 2,
    };
  }

  try {
    const sb = await supabaseServer();
    const [users, estabs, chk, subs, balances, msgs, moments] = await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("establishments").select("id", { count: "exact", head: true }),
      sb.from("checkins").select("id", { count: "exact", head: true }).eq("status", "active"),
      sb.from("subscriptions").select("amount_cents,status"),
      sb.from("credit_balances").select("balance"),
      sb.from("messages").select("id", { count: "exact", head: true }).gt("created_at", new Date(Date.now() - 86400_000).toISOString()),
      sb.from("moments").select("id", { count: "exact", head: true }).gt("expires_at", new Date().toISOString()),
    ]);

    const activeSubs = (subs.data ?? []).filter((s) => s.status === "active");
    const mrrCents = activeSubs.reduce((a, s) => a + (s.amount_cents ?? 0), 0);

    return {
      totalUsers: users.count ?? 0,
      totalEstabs: estabs.count ?? 0,
      activeCheckins: chk.count ?? 0,
      mrrCents,
      totalInteractions: msgs.count ?? 0,
      totalCreditsInEconomy: (balances.data ?? []).reduce((a, b) => a + (b.balance ?? 0), 0),
      totalSubscriptions: activeSubs.length,
      totalMomentsActive: moments.count ?? 0,
    };
  } catch (err) {
    console.error("[admin-dashboard] getAdminDashboardKPIs falhou:", err);
    return EMPTY_KPIS;
  }
}

export interface PlanRow {
  plan: string;
  count: number;
}

export async function getPlanDistribution(): Promise<PlanRow[]> {
  if (isMockMode()) {
    return [
      { plan: "Free", count: 7430 },
      { plan: "Básico", count: 2104 },
      { plan: "Premium", count: 1842 },
      { plan: "VIP", count: 312 },
    ];
  }

  try {
    const sb = await supabaseServer();
    const [profilesRes, plansRes, subsRes] = await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
      sb.from("plans").select("id, name").eq("target", "user"),
      sb.from("subscriptions").select("plan_id, status").eq("status", "active"),
    ]);

    const totalUsers = profilesRes.count ?? 0;
    const planMap = new Map((plansRes.data ?? []).map((p) => [p.id, p.name]));
    const counts: Record<string, number> = {};

    for (const s of subsRes.data ?? []) {
      const name = planMap.get(s.plan_id) ?? "Outro";
      counts[name] = (counts[name] ?? 0) + 1;
    }

    const subscribed = Object.values(counts).reduce((a, b) => a + b, 0);
    const free = Math.max(0, totalUsers - subscribed);

    return [
      { plan: "Free", count: free },
      ...Object.entries(counts).map(([plan, count]) => ({ plan, count })),
    ];
  } catch (err) {
    console.error("[admin-dashboard] getPlanDistribution falhou:", err);
    return [{ plan: "Free", count: 0 }];
  }
}

export interface DailyPoint {
  label: string;
  value: number;
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
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  return buckets;
}

function bucketsToSeries(buckets: Map<string, number>): DailyPoint[] {
  return Array.from(buckets.entries()).map(([iso, value]) => {
    const [, m, day] = iso.split("-");
    return { label: `${day}/${m}`, value };
  });
}

function mockSeries(days: number, base: number, variance = 0.3): DailyPoint[] {
  const buckets = buildDailyBuckets(days);
  let i = 0;
  for (const key of buckets.keys()) {
    const d = new Date(key);
    const dayBoost = [0.7, 0.6, 1, 1.4, 1.7, 2.2, 1.8][d.getDay()];
    const noise = 1 + ((i * 13) % 100) / 100 * variance - variance / 2;
    buckets.set(key, Math.max(1, Math.round(base * dayBoost * noise)));
    i++;
  }
  return bucketsToSeries(buckets);
}

async function dailyFromTable(
  table: string,
  dateColumn: string,
  days: number
): Promise<DailyPoint[]> {
  try {
    const sb = await supabaseServer();
    const start = daysBack(days);
    const { data, error } = await sb
      .from(table)
      .select(`${dateColumn}, amount_cents`)
      .gte(dateColumn, start.toISOString())
      .limit(10000);
    if (error) throw error;
    const buckets = buildDailyBuckets(days);
    for (const row of (data ?? []) as Array<Record<string, string | number | null>>) {
      const raw = row[dateColumn];
      if (typeof raw !== "string") continue;
      const key = raw.slice(0, 10);
      if (!buckets.has(key)) continue;
      const inc = typeof row.amount_cents === "number" ? row.amount_cents / 100 : 1;
      buckets.set(key, (buckets.get(key) ?? 0) + inc);
    }
    return bucketsToSeries(buckets);
  } catch (err) {
    console.error(`[admin-dashboard] daily ${table}.${dateColumn} falhou:`, err);
    return bucketsToSeries(buildDailyBuckets(days));
  }
}

export async function getRevenueByDay(days = 30): Promise<DailyPoint[]> {
  if (isMockMode()) return mockSeries(days, 1280);
  return dailyFromTable("subscriptions", "created_at", days);
}

export async function getNewUsersByDay(days = 30): Promise<DailyPoint[]> {
  if (isMockMode()) return mockSeries(days, 48);
  try {
    const sb = await supabaseServer();
    const start = daysBack(days);
    const { data, error } = await sb
      .from("profiles")
      .select("created_at")
      .gte("created_at", start.toISOString());
    if (error) throw error;
    const buckets = buildDailyBuckets(days);
    for (const row of (data ?? []) as Array<{ created_at: string }>) {
      const key = row.created_at?.slice(0, 10);
      if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return bucketsToSeries(buckets);
  } catch (err) {
    console.error("[admin-dashboard] getNewUsersByDay falhou:", err);
    return bucketsToSeries(buildDailyBuckets(days));
  }
}

export async function getAllCheckinsByDay(days = 30): Promise<DailyPoint[]> {
  if (isMockMode()) return mockSeries(days, 220);
  try {
    const sb = await supabaseServer();
    const start = daysBack(days);
    const { data, error } = await sb
      .from("checkins")
      .select("checked_in_at")
      .gte("checked_in_at", start.toISOString())
      .limit(10000);
    if (error) throw error;
    const buckets = buildDailyBuckets(days);
    for (const row of (data ?? []) as Array<{ checked_in_at: string }>) {
      const key = row.checked_in_at?.slice(0, 10);
      if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return bucketsToSeries(buckets);
  } catch (err) {
    console.error("[admin-dashboard] getAllCheckinsByDay falhou:", err);
    return bucketsToSeries(buildDailyBuckets(days));
  }
}

export async function getInteractionsByDay(days = 30): Promise<DailyPoint[]> {
  if (isMockMode()) return mockSeries(days, 380);
  try {
    const sb = await supabaseServer();
    const start = daysBack(days);
    const { data, error } = await sb
      .from("messages")
      .select("created_at")
      .gte("created_at", start.toISOString())
      .limit(10000);
    if (error) throw error;
    const buckets = buildDailyBuckets(days);
    for (const row of (data ?? []) as Array<{ created_at: string }>) {
      const key = row.created_at?.slice(0, 10);
      if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return bucketsToSeries(buckets);
  } catch (err) {
    console.error("[admin-dashboard] getInteractionsByDay falhou:", err);
    return bucketsToSeries(buildDailyBuckets(days));
  }
}

export interface SalesKPIs {
  mrrCents: number;
  arrCents: number;
  churnPct: number;
  delinquentPct: number;
  activeCount: number;
  canceledCount: number;
}

export async function getSalesKPIs(): Promise<SalesKPIs> {
  if (isMockMode()) {
    return { mrrCents: 18_400_000, arrCents: 220_800_000, churnPct: 3.2, delinquentPct: 1.1, activeCount: 1284, canceledCount: 42 };
  }
  try {
    const sb = await supabaseServer();
    const { data, error } = await sb.from("subscriptions").select("amount_cents, status");
    if (error) throw error;
    const rows = (data ?? []) as Array<{ amount_cents: number; status: string }>;

    const active = rows.filter((r) => r.status === "active");
    const canceled = rows.filter((r) => r.status === "canceled");
    const delinquent = rows.filter((r) => r.status === "delinquent");
    const mrrCents = active.reduce((a, r) => a + (r.amount_cents ?? 0), 0);
    const totalEverActive = active.length + canceled.length;
    const churnPct = totalEverActive > 0 ? (canceled.length / totalEverActive) * 100 : 0;
    const delinquentPct = rows.length > 0 ? (delinquent.length / rows.length) * 100 : 0;

    return {
      mrrCents,
      arrCents: mrrCents * 12,
      churnPct: Number(churnPct.toFixed(1)),
      delinquentPct: Number(delinquentPct.toFixed(1)),
      activeCount: active.length,
      canceledCount: canceled.length,
    };
  } catch (err) {
    console.error("[admin-dashboard] getSalesKPIs falhou:", err);
    return { mrrCents: 0, arrCents: 0, churnPct: 0, delinquentPct: 0, activeCount: 0, canceledCount: 0 };
  }
}

export interface RecentSubscription {
  id: string;
  user: string;
  plan: string;
  amount: number;
  status: string;
  method: string;
  date: string;
}

export async function listRecentSubscriptions(limit = 10): Promise<RecentSubscription[]> {
  if (isMockMode()) {
    return [];
  }

  try {
    const sb = await supabaseServer();
    const { data, error } = await sb
      .from("subscriptions")
      .select("id, status, amount_cents, method, created_at, profiles(name), plans(name)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return ((data ?? []) as unknown as Array<{
      id: string;
      status: string;
      amount_cents: number | null;
      method: string | null;
      created_at: string | null;
      profiles: { name: string } | null;
      plans: { name: string } | null;
    }>).map((s) => ({
      id: (s.id ?? "").slice(0, 8),
      user: s.profiles?.name ?? "—",
      plan: s.plans?.name ?? "—",
      amount: (s.amount_cents ?? 0) / 100,
      status: s.status,
      method: s.method ?? "—",
      date: s.created_at?.split("T")[0] ?? "—",
    }));
  } catch (err) {
    console.error("[admin-dashboard] listRecentSubscriptions falhou:", err);
    return [];
  }
}
