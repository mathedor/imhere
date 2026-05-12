"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { LeadStage } from "@/lib/db/leads";

export async function createLeadAction(formData: FormData) {
  if (isMockMode()) redirect("/comercial/pipeline");
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/comercial/pipeline");

  const mrrReais = Number(String(formData.get("expectedMrr") ?? "0").replace(",", "."));

  await sb.from("leads").insert({
    owner_id: user.id,
    name: String(formData.get("name") ?? ""),
    contact_name: String(formData.get("contactName") ?? "") || null,
    contact_email: String(formData.get("contactEmail") ?? "") || null,
    contact_phone: String(formData.get("contactPhone") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    state: String(formData.get("state") ?? "") || null,
    expected_mrr_cents: Math.round(mrrReais * 100),
    probability_pct: Number(formData.get("probability") ?? 20),
    notes: String(formData.get("notes") ?? "") || null,
    stage: (String(formData.get("stage") ?? "new") as LeadStage) || "new",
  });

  revalidatePath("/comercial/pipeline");
  revalidatePath("/comercial");
  redirect("/comercial/pipeline");
}

export async function updateLeadStageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "") as LeadStage;
  if (!id || !stage || isMockMode()) return;

  const sb = await supabaseServer();
  await sb.from("leads").update({ stage }).eq("id", id);

  revalidatePath("/comercial/pipeline");
  revalidatePath("/comercial");
}

export async function deleteLeadAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;

  const sb = await supabaseServer();
  await sb.from("leads").delete().eq("id", id);

  revalidatePath("/comercial/pipeline");
  revalidatePath("/comercial");
}
