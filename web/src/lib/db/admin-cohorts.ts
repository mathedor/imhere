import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin-cohorts] ${label}:`, err);
    return fallback;
  }
}

// ============================================================
// Cohort retention: por semana de signup, % que voltou semana N+1, N+2, ...
// ============================================================

export interface CohortRow {
  cohortLabel: string;
  signupCount: number;
  retentionByWeek: number[]; // [w0=100%, w1=%, w2=%, ...]
}

export async function getRetentionCohorts(weeksBack = 8): Promise<CohortRow[]> {
  if (isMockMode()) {
    const out: CohortRow[] = [];
    for (let w = 0; w < weeksBack; w++) {
      const date = new Date();
      date.setDate(date.getDate() - (weeksBack - w) * 7);
      const decay = (i: number) => Math.max(0, Math.round(100 * Math.pow(0.7, i)));
      const retention = Array.from({ length: weeksBack - w }, (_, i) => (i === 0 ? 100 : decay(i)));
      out.push({
        cohortLabel: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`,
        signupCount: Math.round(50 + Math.random() * 80),
        retentionByWeek: retention,
      });
    }
    return out;
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const start = new Date();
      start.setDate(start.getDate() - weeksBack * 7);
      start.setHours(0, 0, 0, 0);

      const [{ data: profiles }, { data: checkins }] = await Promise.all([
        sb.from("profiles").select("id, created_at").gte("created_at", start.toISOString()).eq("role", "user"),
        sb.from("checkins").select("profile_id, checked_in_at").gte("checked_in_at", start.toISOString()).limit(50000),
      ]);

      // Bucket profiles em semanas de signup (cohort week)
      const cohorts = new Map<number, Set<string>>(); // weekIdx → set of profile_ids
      const profileSignupWeek = new Map<string, number>();
      for (const p of (profiles ?? []) as Array<{ id: string; created_at: string }>) {
        const wk = Math.floor((new Date(p.created_at).getTime() - start.getTime()) / (7 * 86400_000));
        if (wk < 0 || wk >= weeksBack) continue;
        if (!cohorts.has(wk)) cohorts.set(wk, new Set());
        cohorts.get(wk)!.add(p.id);
        profileSignupWeek.set(p.id, wk);
      }

      // Bucket check-ins por semana global
      const profileActiveWeeks = new Map<string, Set<number>>(); // profile → set of week indices
      for (const c of (checkins ?? []) as Array<{ profile_id: string; checked_in_at: string }>) {
        const wk = Math.floor((new Date(c.checked_in_at).getTime() - start.getTime()) / (7 * 86400_000));
        if (wk < 0 || wk >= weeksBack) continue;
        if (!profileActiveWeeks.has(c.profile_id)) profileActiveWeeks.set(c.profile_id, new Set());
        profileActiveWeeks.get(c.profile_id)!.add(wk);
      }

      const out: CohortRow[] = [];
      for (let cwk = 0; cwk < weeksBack; cwk++) {
        const date = new Date(start);
        date.setDate(date.getDate() + cwk * 7);
        const cohortIds = cohorts.get(cwk) ?? new Set();
        const signupCount = cohortIds.size;
        const retention: number[] = [];
        for (let offset = 0; cwk + offset < weeksBack; offset++) {
          const targetWk = cwk + offset;
          let active = 0;
          for (const id of cohortIds) {
            if (profileActiveWeeks.get(id)?.has(targetWk)) active += 1;
          }
          retention.push(signupCount > 0 ? Math.round((active / signupCount) * 100) : 0);
        }
        out.push({
          cohortLabel: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`,
          signupCount,
          retentionByWeek: retention,
        });
      }
      return out;
    },
    [],
    "getRetentionCohorts"
  );
}

// ============================================================
// Cohort revenue / LTV
// ============================================================

export interface RevenueCohortRow {
  cohortLabel: string;
  userCount: number;
  revenueByMonthCents: number[]; // [m0, m1, ...]
  ltvCents: number;
}

export async function getRevenueCohorts(monthsBack = 6): Promise<RevenueCohortRow[]> {
  if (isMockMode()) {
    const out: RevenueCohortRow[] = [];
    for (let m = 0; m < monthsBack; m++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (monthsBack - m - 1));
      date.setDate(1);
      const userCount = 50 + Math.floor(Math.random() * 100);
      const revs = Array.from({ length: monthsBack - m }, (_, i) =>
        Math.round((100 - i * 15) * userCount * 100 * (0.8 + Math.random() * 0.4))
      );
      out.push({
        cohortLabel: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        userCount,
        revenueByMonthCents: revs,
        ltvCents: revs.reduce((a, b) => a + b, 0),
      });
    }
    return out;
  }

  return safe(
    async () => {
      const sb = await supabaseServer();
      const start = new Date();
      start.setMonth(start.getMonth() - monthsBack + 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const [{ data: profiles }, { data: subs }] = await Promise.all([
        sb.from("profiles").select("id, created_at").gte("created_at", start.toISOString()).eq("role", "user"),
        sb.from("subscriptions").select("profile_id, amount_cents, created_at").gte("created_at", start.toISOString()),
      ]);

      function monthIdx(d: Date): number {
        return (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth());
      }

      const profilesByCohort = new Map<number, Set<string>>();
      for (const p of (profiles ?? []) as Array<{ id: string; created_at: string }>) {
        const idx = monthIdx(new Date(p.created_at));
        if (idx < 0 || idx >= monthsBack) continue;
        if (!profilesByCohort.has(idx)) profilesByCohort.set(idx, new Set());
        profilesByCohort.get(idx)!.add(p.id);
      }

      const revByCohortByMonth = new Map<number, Map<number, number>>();
      for (const s of (subs ?? []) as Array<{ profile_id: string; amount_cents: number; created_at: string }>) {
        const subMonth = monthIdx(new Date(s.created_at));
        let cohort = -1;
        for (const [c, set] of profilesByCohort) {
          if (set.has(s.profile_id)) {
            cohort = c;
            break;
          }
        }
        if (cohort < 0) continue;
        const offset = subMonth - cohort;
        if (offset < 0) continue;
        if (!revByCohortByMonth.has(cohort)) revByCohortByMonth.set(cohort, new Map());
        const m = revByCohortByMonth.get(cohort)!;
        m.set(offset, (m.get(offset) ?? 0) + (s.amount_cents ?? 0));
      }

      const out: RevenueCohortRow[] = [];
      for (let c = 0; c < monthsBack; c++) {
        const date = new Date(start);
        date.setMonth(date.getMonth() + c);
        const users = profilesByCohort.get(c) ?? new Set();
        const revMap = revByCohortByMonth.get(c) ?? new Map();
        const revArray: number[] = [];
        for (let off = 0; c + off < monthsBack; off++) {
          revArray.push(revMap.get(off) ?? 0);
        }
        out.push({
          cohortLabel: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
          userCount: users.size,
          revenueByMonthCents: revArray,
          ltvCents: revArray.reduce((a, b) => a + b, 0),
        });
      }
      return out;
    },
    [],
    "getRevenueCohorts"
  );
}
