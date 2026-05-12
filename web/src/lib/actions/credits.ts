"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

export interface SpendResult {
  success: boolean;
  newBalance: number;
  message: string;
}

export async function spendCreditsAction(featureCode: string): Promise<SpendResult> {
  if (isMockMode()) {
    return { success: true, newBalance: 100, message: "Mock: usou créditos" };
  }
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("spend_credits", { feature_code: featureCode });
  if (error || !data || data.length === 0) {
    return { success: false, newBalance: 0, message: error?.message ?? "Erro" };
  }
  const row = data[0] as { success: boolean; new_balance: number; message: string };
  revalidatePath("/app/creditos");
  return { success: row.success, newBalance: row.new_balance, message: row.message };
}

export async function getMyBalance(): Promise<number> {
  if (isMockMode()) return 150;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return 0;
  const { data } = await sb.from("credit_balances").select("balance").eq("profile_id", user.id).maybeSingle();
  return data?.balance ?? 0;
}

/**
 * Retorna o slug do plano ativo do usuário (ex: "free", "premium", "vip").
 * Quando nenhum sub ativa existe, retorna "free".
 */
export async function getMyActivePlanKey(): Promise<string> {
  if (isMockMode()) return "free";
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return "free";
  const { data } = await sb
    .from("subscriptions")
    .select("plans(name)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const planName = (data as { plans?: { name?: string } | null } | null)?.plans?.name;
  if (!planName) return "free";
  return planName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  bonus: number;
  highlight: boolean;
  sort_order: number;
}

export async function listCreditPacks(): Promise<CreditPack[]> {
  if (isMockMode()) {
    return [
      { id: "p1", name: "Starter", credits: 50, price_cents: 990, bonus: 0, highlight: false, sort_order: 0 },
      { id: "p2", name: "Popular", credits: 150, price_cents: 2490, bonus: 25, highlight: true, sort_order: 1 },
      { id: "p3", name: "Plus", credits: 400, price_cents: 5990, bonus: 100, highlight: false, sort_order: 2 },
      { id: "p4", name: "Mega", credits: 1000, price_cents: 12990, bonus: 300, highlight: false, sort_order: 3 },
    ];
  }
  const sb = await supabaseServer();
  const { data } = await sb.from("credit_packs").select("*").eq("active", true).order("sort_order");
  return (data as CreditPack[]) ?? [];
}

export interface AdminCreditPack extends CreditPack {
  active: boolean;
}

/** Lista todos os pacotes (inclusive inativos) — uso interno do /admin */
export async function listAllCreditPacks(): Promise<AdminCreditPack[]> {
  if (isMockMode()) {
    const base = await listCreditPacks();
    return base.map((p) => ({ ...p, active: true }));
  }
  const sb = await supabaseServer();
  const { data } = await sb.from("credit_packs").select("*").order("sort_order");
  return (data as AdminCreditPack[]) ?? [];
}

export interface Feature {
  code: string;
  label: string;
  description: string | null;
  scope: string;
  cost_credits: number;
  unlocked_for_plans: string[];
}

export async function listFeatures(): Promise<Feature[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb.from("feature_pricing").select("*").eq("active", true).order("scope");
  return (data as Feature[]) ?? [];
}

export interface CreditTx {
  id: string;
  kind: string;
  amount: number;
  description: string | null;
  balance_after: number | null;
  created_at: string;
}

export async function listMyCreditTransactions(): Promise<CreditTx[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from("credit_transactions")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);
  return (data as CreditTx[]) ?? [];
}

// Compra de créditos (será chamada pela API de checkout após confirmação Efí)
export async function grantCreditsForPack(profileId: string, packId: string): Promise<void> {
  if (isMockMode()) return;
  const admin = supabaseAdmin();
  const { data: pack } = await admin.from("credit_packs").select("*").eq("id", packId).maybeSingle();
  if (!pack) return;

  const totalCredits = pack.credits + (pack.bonus ?? 0);
  await admin.rpc("add_credits", {
    target_profile: profileId,
    amount: totalCredits,
    kind: "purchase",
    description: `Compra: ${pack.name} (${pack.credits} + ${pack.bonus} bônus)`,
  });
}
