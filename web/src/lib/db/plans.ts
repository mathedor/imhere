import { plans as mockPlans } from "@/data/plans";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { Plan, SubscriptionTarget } from "./types";

export async function listPlans(target: SubscriptionTarget = "user"): Promise<Plan[]> {
  if (isMockMode()) {
    return mockPlans.map((p, i) => ({
      id: p.id,
      target,
      code: p.id,
      name: p.name,
      tagline: p.tagline,
      monthly_price_cents: Math.round(p.monthlyPrice * 100),
      annual_price_cents: Math.round(p.annualPrice * 100),
      features: p.features,
      highlight: p.highlight ?? false,
      active: true,
      sort_order: i,
    }));
  }
  const sb = await supabaseServer();
  const { data } = await sb
    .from("plans")
    .select("*")
    .eq("target", target)
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}
