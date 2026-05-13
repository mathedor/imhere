"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

async function getMyEstabId(): Promise<string | null> {
  if (isMockMode()) return null;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("establishments").select("id").eq("owner_id", user.id).maybeSingle();
  return data?.id ?? null;
}

export async function createLoyaltyProgramAction(formData: FormData) {
  if (isMockMode()) return;
  const estabId = await getMyEstabId();
  if (!estabId) return;
  const sb = await supabaseServer();
  await sb.from("loyalty_programs").insert({
    establishment_id: estabId,
    name: String(formData.get("name") ?? "Cliente fiel"),
    description: String(formData.get("description") ?? "") || null,
    checkins_required: Math.max(1, Number(formData.get("checkinsRequired") ?? 5)),
    reward_label: String(formData.get("rewardLabel") ?? "Drink grátis"),
    reward_description: String(formData.get("rewardDescription") ?? "") || null,
  });
  revalidatePath("/estabelecimento/fidelidade");
  revalidatePath("/estabelecimento");
}

export async function updateLoyaltyProgramAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const estabId = await getMyEstabId();
  if (!estabId) return;
  const sb = await supabaseServer();
  await sb
    .from("loyalty_programs")
    .update({
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      checkins_required: Math.max(1, Number(formData.get("checkinsRequired") ?? 5)),
      reward_label: String(formData.get("rewardLabel") ?? ""),
      reward_description: String(formData.get("rewardDescription") ?? "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("establishment_id", estabId);
  revalidatePath("/estabelecimento/fidelidade");
}

export async function toggleLoyaltyProgramAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const currentActive = formData.get("active") === "true";
  if (!id || isMockMode()) return;
  const estabId = await getMyEstabId();
  if (!estabId) return;
  const sb = await supabaseServer();
  await sb
    .from("loyalty_programs")
    .update({ active: !currentActive })
    .eq("id", id)
    .eq("establishment_id", estabId);
  revalidatePath("/estabelecimento/fidelidade");
}

export async function deleteLoyaltyProgramAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const estabId = await getMyEstabId();
  if (!estabId) return;
  const sb = await supabaseServer();
  await sb.from("loyalty_programs").delete().eq("id", id).eq("establishment_id", estabId);
  revalidatePath("/estabelecimento/fidelidade");
}

export async function redeemLoyaltyAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const programId = String(formData.get("programId") ?? "");
  const profileId = String(formData.get("profileId") ?? "");
  if (!programId || !profileId) return { ok: false, error: "Dados incompletos" };
  if (isMockMode()) return { ok: true };
  try {
    const sb = await supabaseServer();
    const { error } = await sb.rpc("redeem_loyalty", { prog_id: programId, target_profile: profileId });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/estabelecimento/fidelidade");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ============================================================
// Broadcast / push manual do estab
// ============================================================

export async function broadcastEstabMessageAction(formData: FormData): Promise<{
  ok: boolean;
  sent: number;
  error?: string;
}> {
  if (isMockMode()) return { ok: true, sent: 0 };
  const message = String(formData.get("message") ?? "").trim();
  const audience = String(formData.get("audience") ?? "active"); // active | recent | both
  if (!message || message.length < 3) return { ok: false, sent: 0, error: "Mensagem muito curta" };

  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, sent: 0, error: "Não autenticado" };

    const { data: estab } = await sb
      .from("establishments")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!estab) return { ok: false, sent: 0, error: "Estabelecimento não encontrado" };

    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = supabaseAdmin();

    const targets = new Set<string>();

    if (audience === "active" || audience === "both") {
      const { data: active } = await admin
        .from("checkins")
        .select("profile_id")
        .eq("establishment_id", estab.id)
        .eq("status", "active");
      for (const r of (active ?? []) as Array<{ profile_id: string }>) {
        if (r.profile_id) targets.add(r.profile_id);
      }
    }

    if (audience === "recent" || audience === "both") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data: recent } = await admin
        .from("checkins")
        .select("profile_id")
        .eq("establishment_id", estab.id)
        .gte("checked_in_at", sevenDaysAgo)
        .limit(500);
      for (const r of (recent ?? []) as Array<{ profile_id: string }>) {
        if (r.profile_id) targets.add(r.profile_id);
      }
    }

    if (targets.size === 0) return { ok: true, sent: 0 };

    const title = `${estab.name} avisou`;
    const link = `/app/estabelecimento/${estab.id}`;
    const rows = Array.from(targets).map((profileId) => ({
      profile_id: profileId,
      kind: "courtesy_received",
      title,
      body: message,
      link,
    }));
    await admin.from("notifications").insert(rows);

    // Push web em paralelo (silently ignora se VAPID não configurado)
    const { sendWebPushTo } = await import("@/lib/push");
    await Promise.all(
      Array.from(targets).map((profileId) =>
        sendWebPushTo(profileId, { title, body: message, url: link, tag: `broadcast-${estab.id}` }).catch(() => 0)
      )
    );

    return { ok: true, sent: targets.size };
  } catch (err) {
    return { ok: false, sent: 0, error: (err as Error).message };
  }
}
