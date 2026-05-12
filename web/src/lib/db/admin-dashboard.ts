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

export async function listRecentSubscriptions(): Promise<RecentSubscription[]> {
  if (isMockMode()) {
    return [];
  }

  const sb = await supabaseServer();
  const { data } = await sb
    .from("subscriptions")
    .select("id, status, amount_cents, method, created_at, profiles(name), plans(name)")
    .order("created_at", { ascending: false })
    .limit(10);

  return ((data ?? []) as unknown as Array<{
    id: string;
    status: string;
    amount_cents: number;
    method: string | null;
    created_at: string;
    profiles: { name: string } | null;
    plans: { name: string } | null;
  }>).map((s) => ({
    id: s.id.slice(0, 8),
    user: s.profiles?.name ?? "—",
    plan: s.plans?.name ?? "—",
    amount: s.amount_cents / 100,
    status: s.status,
    method: s.method ?? "—",
    date: s.created_at.split("T")[0],
  }));
}
