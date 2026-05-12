import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import { STAGE_ORDER, type LeadStage } from "./leads-meta";

export { STAGE_LABEL, STAGE_COLOR, STAGE_ORDER, type LeadStage } from "./leads-meta";

export interface Lead {
  id: string;
  owner_id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
  expected_mrr_cents: number;
  stage: LeadStage;
  probability_pct: number;
  notes: string | null;
  next_action_at: string | null;
  established_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function listMyLeads(): Promise<Lead[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from("leads")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  return (data as Lead[] | null) ?? [];
}

export interface LeadStageCount {
  stage: LeadStage;
  count: number;
  forecastCents: number;
}

export async function getMyLeadCounts(): Promise<LeadStageCount[]> {
  if (isMockMode()) {
    return STAGE_ORDER.map((s) => ({ stage: s, count: 0, forecastCents: 0 }));
  }
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return STAGE_ORDER.map((s) => ({ stage: s, count: 0, forecastCents: 0 }));

  const { data } = await sb
    .from("leads")
    .select("stage, expected_mrr_cents, probability_pct")
    .eq("owner_id", user.id);

  const map = new Map<LeadStage, { count: number; forecastCents: number }>();
  for (const row of (data ?? []) as Array<{ stage: LeadStage; expected_mrr_cents: number; probability_pct: number }>) {
    const existing = map.get(row.stage) ?? { count: 0, forecastCents: 0 };
    existing.count += 1;
    existing.forecastCents += Math.round((row.expected_mrr_cents ?? 0) * (row.probability_pct ?? 0) / 100);
    map.set(row.stage, existing);
  }

  return STAGE_ORDER.map((s) => ({
    stage: s,
    count: map.get(s)?.count ?? 0,
    forecastCents: map.get(s)?.forecastCents ?? 0,
  }));
}
