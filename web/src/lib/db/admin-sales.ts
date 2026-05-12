import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export type SalesType = "subscriptions" | "credits" | "both";

export interface SalesKPIsByType {
  totalRevenueCents: number;
  subsRevenueCents: number;
  creditsRevenueCents: number;
  subsActiveCount: number;
  subsCanceledCount: number;
  creditsPacksSold: number;
  churnPct: number;
  arrCents: number;
  avgTicketCents: number;
}

export interface DailyPoint {
  label: string;
  value: number;
}

export interface SalesTxRow {
  id: string;
  kind: "subscription" | "credit_pack";
  user: string;
  description: string;
  amount: number; // em reais
  status: string;
  method: string;
  date: string;
}

function daysBack(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (n - 1));
  return d;
}

function buildBuckets(days: number): Map<string, { subs: number; credits: number }> {
  const m = new Map<string, { subs: number; credits: number }>();
  const start = daysBack(days);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    m.set(d.toISOString().slice(0, 10), { subs: 0, credits: 0 });
  }
  return m;
}

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin-sales] ${label}:`, err);
    return fallback;
  }
}

// ============================================================
// KPIs filtrados por tipo
// ============================================================

export async function getSalesKPIsByType(type: SalesType, days = 30): Promise<SalesKPIsByType> {
  if (isMockMode()) {
    const subs = { rev: 18_400_000, active: 1284, canceled: 42 };
    const credits = { rev: 4_200_000, packs: 312 };
    const subsRev = type === "credits" ? 0 : subs.rev;
    const creditsRev = type === "subscriptions" ? 0 : credits.rev;
    const total = subsRev + creditsRev;
    const tickets = (type === "credits" ? 0 : subs.active) + (type === "subscriptions" ? 0 : credits.packs);
    return {
      totalRevenueCents: total,
      subsRevenueCents: subsRev,
      creditsRevenueCents: creditsRev,
      subsActiveCount: type === "credits" ? 0 : subs.active,
      subsCanceledCount: type === "credits" ? 0 : subs.canceled,
      creditsPacksSold: type === "subscriptions" ? 0 : credits.packs,
      churnPct: type === "credits" ? 0 : 3.2,
      arrCents: subsRev * 12,
      avgTicketCents: tickets > 0 ? Math.round(total / tickets) : 0,
    };
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const start = daysBack(days);

      // Subscriptions: agrega MRR + counts (sempre busca pra ter denominator de churn)
      const [subsRes, paymentsRes] = await Promise.all([
        sb.from("subscriptions").select("amount_cents, status"),
        sb
          .from("payments")
          .select("amount_cents, subscription_id, status")
          .gte("created_at", start.toISOString())
          .eq("status", "paid")
          .limit(50000),
      ]);

      const subsRows = (subsRes.data ?? []) as Array<{ amount_cents: number; status: string }>;
      const active = subsRows.filter((s) => s.status === "active");
      const canceled = subsRows.filter((s) => s.status === "canceled");
      const subsRev = active.reduce((a, s) => a + (s.amount_cents ?? 0), 0);

      // Credit pack payments: paid, sem subscription_id
      const creditPayments = (paymentsRes.data ?? []).filter(
        (p) => !p.subscription_id
      ) as Array<{ amount_cents: number }>;
      const creditsRev = creditPayments.reduce((a, p) => a + (p.amount_cents ?? 0), 0);
      const packsSold = creditPayments.length;

      const subsRevFiltered = type === "credits" ? 0 : subsRev;
      const creditsRevFiltered = type === "subscriptions" ? 0 : creditsRev;
      const total = subsRevFiltered + creditsRevFiltered;

      const totalEverActive = active.length + canceled.length;
      const churnPct = totalEverActive > 0 ? (canceled.length / totalEverActive) * 100 : 0;

      const tickets = (type === "credits" ? 0 : active.length) + (type === "subscriptions" ? 0 : packsSold);

      return {
        totalRevenueCents: total,
        subsRevenueCents: subsRevFiltered,
        creditsRevenueCents: creditsRevFiltered,
        subsActiveCount: type === "credits" ? 0 : active.length,
        subsCanceledCount: type === "credits" ? 0 : canceled.length,
        creditsPacksSold: type === "subscriptions" ? 0 : packsSold,
        churnPct: type === "credits" ? 0 : Number(churnPct.toFixed(1)),
        arrCents: subsRevFiltered * 12,
        avgTicketCents: tickets > 0 ? Math.round(total / tickets) : 0,
      };
    },
    {
      totalRevenueCents: 0,
      subsRevenueCents: 0,
      creditsRevenueCents: 0,
      subsActiveCount: 0,
      subsCanceledCount: 0,
      creditsPacksSold: 0,
      churnPct: 0,
      arrCents: 0,
      avgTicketCents: 0,
    },
    "getSalesKPIsByType"
  );
}

// ============================================================
// Receita por dia, filtrado por tipo
// ============================================================

export async function getRevenueByDayByType(type: SalesType, days = 30): Promise<DailyPoint[]> {
  if (isMockMode()) {
    const buckets = buildBuckets(days);
    let i = 0;
    for (const [, v] of buckets) {
      const dow = new Date().getDay();
      const dayBoost = [0.7, 0.5, 0.8, 1.2, 1.5, 2.0, 1.7][(dow + i) % 7];
      v.subs = Math.round(1200 * dayBoost + ((i * 11) % 23));
      v.credits = Math.round(280 * dayBoost + ((i * 7) % 17));
      i++;
    }
    return Array.from(buckets.entries()).map(([iso, v]) => {
      const [, m, d] = iso.split("-");
      const val =
        type === "subscriptions" ? v.subs : type === "credits" ? v.credits : v.subs + v.credits;
      return { label: `${d}/${m}`, value: val };
    });
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const start = daysBack(days);
      const buckets = buildBuckets(days);

      const [subsRes, paymentsRes] = await Promise.all([
        type === "credits"
          ? Promise.resolve({ data: [] })
          : sb
              .from("subscriptions")
              .select("amount_cents, created_at")
              .gte("created_at", start.toISOString())
              .limit(50000),
        type === "subscriptions"
          ? Promise.resolve({ data: [] })
          : sb
              .from("payments")
              .select("amount_cents, created_at, subscription_id, status")
              .gte("created_at", start.toISOString())
              .eq("status", "paid")
              .limit(50000),
      ]);

      // Subscriptions (criadas no período)
      for (const row of (subsRes.data ?? []) as Array<{
        amount_cents: number;
        created_at: string;
      }>) {
        const key = row.created_at?.slice(0, 10);
        if (key && buckets.has(key)) {
          buckets.get(key)!.subs += (row.amount_cents ?? 0) / 100;
        }
      }

      // Payments de credit_pack (sem subscription_id)
      for (const row of (paymentsRes.data ?? []) as Array<{
        amount_cents: number;
        created_at: string;
        subscription_id: string | null;
      }>) {
        if (row.subscription_id) continue; // skip subscription payments aqui (já contados acima)
        const key = row.created_at?.slice(0, 10);
        if (key && buckets.has(key)) {
          buckets.get(key)!.credits += (row.amount_cents ?? 0) / 100;
        }
      }

      return Array.from(buckets.entries()).map(([iso, v]) => {
        const [, m, d] = iso.split("-");
        const val =
          type === "subscriptions" ? v.subs : type === "credits" ? v.credits : v.subs + v.credits;
        return { label: `${d}/${m}`, value: val };
      });
    },
    Array.from(buildBuckets(days).entries()).map(([iso]) => {
      const [, m, d] = iso.split("-");
      return { label: `${d}/${m}`, value: 0 };
    }),
    "getRevenueByDayByType"
  );
}

// ============================================================
// Lista de transações recentes (subs + credit packs misturadas)
// ============================================================

export async function listRecentSalesTx(type: SalesType, limit = 30): Promise<SalesTxRow[]> {
  if (isMockMode()) {
    return [];
  }

  return safe(
    async () => {
      const sb = await supabaseServer();

      const tasks: Promise<SalesTxRow[]>[] = [];

      if (type !== "credits") {
        tasks.push(
          (async () => {
            const { data } = await sb
              .from("subscriptions")
              .select("id, status, amount_cents, method, created_at, profiles(name), plans(name)")
              .order("created_at", { ascending: false })
              .limit(limit);
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
              kind: "subscription" as const,
              user: s.profiles?.name ?? "—",
              description: s.plans?.name ?? "Assinatura",
              amount: (s.amount_cents ?? 0) / 100,
              status: s.status,
              method: s.method ?? "—",
              date: s.created_at?.split("T")[0] ?? "—",
            }));
          })()
        );
      }

      if (type !== "subscriptions") {
        tasks.push(
          (async () => {
            const { data } = await sb
              .from("payments")
              .select("id, amount_cents, method, status, created_at, profiles(name)")
              .is("subscription_id", null)
              .order("created_at", { ascending: false })
              .limit(limit);
            return ((data ?? []) as unknown as Array<{
              id: string;
              amount_cents: number | null;
              method: string | null;
              status: string;
              created_at: string | null;
              profiles: { name: string } | null;
            }>).map((p) => ({
              id: (p.id ?? "").slice(0, 8),
              kind: "credit_pack" as const,
              user: p.profiles?.name ?? "—",
              description: "Pacote de créditos",
              amount: (p.amount_cents ?? 0) / 100,
              status: p.status,
              method: p.method ?? "—",
              date: p.created_at?.split("T")[0] ?? "—",
            }));
          })()
        );
      }

      const results = await Promise.all(tasks);
      const merged = results.flat().sort((a, b) => b.date.localeCompare(a.date));
      return merged.slice(0, limit);
    },
    [],
    "listRecentSalesTx"
  );
}
