import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

const COMMISSION_PCT = 0.10;

export interface SalesAgent {
  id: string;
  name: string;
  email: string;
  establishments: number;
  mrrCents: number;
  commissionCents: number;
}

/**
 * Lista todos profiles com role='sales', já agregando quantos estabelecimentos
 * cada um gerencia (sales_agent_id) e o MRR total das assinaturas ativas
 * daqueles estabelecimentos.
 */
export async function listSalesAgents(): Promise<SalesAgent[]> {
  if (isMockMode()) return [];

  const sb = await supabaseServer();
  const { data: agents } = await sb
    .from("profiles")
    .select("id, name, email")
    .eq("role", "sales")
    .order("name");

  if (!agents || agents.length === 0) return [];
  const ids = agents.map((a) => a.id);

  const { data: estabs } = await sb
    .from("establishments")
    .select("id, sales_agent_id")
    .in("sales_agent_id", ids);

  const estabsByAgent = new Map<string, string[]>();
  for (const e of (estabs ?? []) as Array<{ id: string; sales_agent_id: string }>) {
    const arr = estabsByAgent.get(e.sales_agent_id) ?? [];
    arr.push(e.id);
    estabsByAgent.set(e.sales_agent_id, arr);
  }

  const allEstabIds = (estabs ?? []).map((e) => e.id);
  let mrrByEstab = new Map<string, number>();
  if (allEstabIds.length > 0) {
    const { data: subs } = await sb
      .from("subscriptions")
      .select("establishment_id, amount_cents")
      .in("establishment_id", allEstabIds)
      .eq("status", "active");
    for (const s of (subs ?? []) as Array<{ establishment_id: string | null; amount_cents: number }>) {
      if (!s.establishment_id) continue;
      mrrByEstab.set(s.establishment_id, (mrrByEstab.get(s.establishment_id) ?? 0) + (s.amount_cents ?? 0));
    }
  }

  return agents.map((a) => {
    const myEstabs = estabsByAgent.get(a.id) ?? [];
    const mrr = myEstabs.reduce((acc, eid) => acc + (mrrByEstab.get(eid) ?? 0), 0);
    return {
      id: a.id,
      name: a.name ?? "—",
      email: a.email ?? "",
      establishments: myEstabs.length,
      mrrCents: mrr,
      commissionCents: Math.round(mrr * COMMISSION_PCT),
    };
  });
}

export interface CommercialEstab {
  id: string;
  name: string;
  city: string;
  status: "active" | "trial" | "paused" | "lead";
  plan: string;
  mrrCents: number;
  signedAt: string;
}

export interface CommercialContext {
  profile: { id: string; name: string; email: string } | null;
  estabs: CommercialEstab[];
  estabsCount: number;
  mrrCents: number;
  commissionCents: number;
  conversionPct: number;
}

/**
 * Carrega contexto do comercial logado: seus estabs + métricas agregadas.
 */
export async function getMyCommercialContext(): Promise<CommercialContext> {
  if (isMockMode()) {
    return {
      profile: null,
      estabs: [],
      estabsCount: 0,
      mrrCents: 0,
      commissionCents: 0,
      conversionPct: 0,
    };
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return {
      profile: null,
      estabs: [],
      estabsCount: 0,
      mrrCents: 0,
      commissionCents: 0,
      conversionPct: 0,
    };
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: estabs } = await sb
    .from("establishments")
    .select("id, name, city, created_at")
    .eq("sales_agent_id", user.id)
    .order("created_at", { ascending: false });

  const estabIds = (estabs ?? []).map((e) => e.id);
  let subsByEstab = new Map<string, { amount_cents: number; status: string; plan_id: string }>();
  if (estabIds.length > 0) {
    const { data: subs } = await sb
      .from("subscriptions")
      .select("establishment_id, amount_cents, status, plan_id")
      .in("establishment_id", estabIds);
    for (const s of (subs ?? []) as Array<{
      establishment_id: string | null;
      amount_cents: number;
      status: string;
      plan_id: string;
    }>) {
      if (!s.establishment_id) continue;
      // Priorizar status active sobre outros
      const existing = subsByEstab.get(s.establishment_id);
      if (!existing || (s.status === "active" && existing.status !== "active")) {
        subsByEstab.set(s.establishment_id, {
          amount_cents: s.amount_cents ?? 0,
          status: s.status,
          plan_id: s.plan_id,
        });
      }
    }
  }

  let plansMap = new Map<string, string>();
  const planIds = Array.from(subsByEstab.values()).map((s) => s.plan_id).filter(Boolean);
  if (planIds.length > 0) {
    const { data: plans } = await sb.from("plans").select("id, name").in("id", planIds);
    for (const p of (plans ?? []) as Array<{ id: string; name: string }>) plansMap.set(p.id, p.name);
  }

  const rows: CommercialEstab[] = (estabs ?? []).map((e) => {
    const sub = subsByEstab.get(e.id);
    let status: CommercialEstab["status"] = "lead";
    if (sub) {
      if (sub.status === "active") status = "active";
      else if (sub.status === "trialing") status = "trial";
      else if (sub.status === "canceled") status = "paused";
    }
    return {
      id: e.id,
      name: e.name,
      city: e.city,
      status,
      plan: sub?.plan_id ? plansMap.get(sub.plan_id) ?? "—" : "—",
      mrrCents: sub?.status === "active" ? sub.amount_cents : 0,
      signedAt: e.created_at?.slice(0, 10) ?? "—",
    };
  });

  const mrrCents = rows.reduce((a, r) => a + r.mrrCents, 0);
  const activeCount = rows.filter((r) => r.status === "active").length;
  const totalNonLead = rows.filter((r) => r.status !== "lead").length;
  const conversionPct = totalNonLead > 0 ? (activeCount / totalNonLead) * 100 : 0;

  return {
    profile: profile ? { id: profile.id, name: profile.name ?? "—", email: profile.email ?? "" } : null,
    estabs: rows,
    estabsCount: rows.length,
    mrrCents,
    commissionCents: Math.round(mrrCents * COMMISSION_PCT),
    conversionPct: Number(conversionPct.toFixed(0)),
  };
}
