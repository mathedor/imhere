"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

export async function updateFeaturePricingAction(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  if (!code || isMockMode()) return;

  const cost = Math.max(0, Number(formData.get("cost") ?? 0));
  const active = formData.get("active") === "true";
  const plansRaw = String(formData.get("unlockedFor") ?? "");
  const unlocked = plansRaw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const admin = supabaseAdmin();
  await admin
    .from("feature_pricing")
    .update({
      cost_credits: cost,
      active,
      unlocked_for_plans: unlocked,
    })
    .eq("code", code);

  revalidatePath("/admin/creditos");
  revalidatePath("/app/creditos");
}

export async function updateCreditPackAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;

  const credits = Math.max(0, Number(formData.get("credits") ?? 0));
  const bonus = Math.max(0, Number(formData.get("bonus") ?? 0));
  const priceCents = Math.max(0, Math.round(Number(formData.get("price") ?? 0) * 100));
  const highlight = formData.get("highlight") === "true";
  const active = formData.get("active") === "true";

  const admin = supabaseAdmin();
  await admin
    .from("credit_packs")
    .update({ credits, bonus, price_cents: priceCents, highlight, active })
    .eq("id", id);

  revalidatePath("/admin/creditos");
  revalidatePath("/app/creditos");
}

export async function createCreditPackAction(formData: FormData) {
  if (isMockMode()) return;

  const admin = supabaseAdmin();
  await admin.from("credit_packs").insert({
    name: String(formData.get("name") ?? "Novo pacote"),
    credits: Math.max(1, Number(formData.get("credits") ?? 50)),
    bonus: Math.max(0, Number(formData.get("bonus") ?? 0)),
    price_cents: Math.max(100, Math.round(Number(formData.get("price") ?? 9.9) * 100)),
    highlight: false,
    active: true,
    sort_order: 99,
  });

  revalidatePath("/admin/creditos");
}

export async function grantBonusCreditsAction(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  const amount = Math.max(1, Number(formData.get("amount") ?? 0));
  const description = String(formData.get("description") ?? "Bônus do admin");
  if (!profileId || isMockMode()) return;

  const admin = supabaseAdmin();
  await admin.rpc("add_credits", {
    target_profile: profileId,
    amount,
    kind: "bonus",
    description,
  });

  revalidatePath("/admin/creditos");
  revalidatePath(`/admin/usuarios/${profileId}`);
}
