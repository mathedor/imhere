"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import { moderate } from "@/lib/moderation";
import { sendWebPushTo } from "@/lib/push";

async function getMyEstablishmentId(): Promise<string | null> {
  if (isMockMode()) return null;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("establishments").select("id").eq("owner_id", user.id).maybeSingle();
  return data?.id ?? null;
}

export async function postMomentAction(formData: FormData) {
  const imageUrl = String(formData.get("imageUrl") ?? "");
  const caption = String(formData.get("caption") ?? "") || null;
  if (!imageUrl) return;

  if (isMockMode()) redirect("/estabelecimento/momento");

  const estabId = await getMyEstablishmentId();
  if (!estabId) redirect("/estabelecimento/momento?error=no-estab");

  const sb = await supabaseServer();
  await sb.from("moments").insert({ establishment_id: estabId, image_url: imageUrl, caption });

  // Notifica audience: usuarios com check-in ativo + ultimos visitantes
  notifyMomentAudience(estabId, caption).catch((e) =>
    console.error("[notifyMomentAudience]", e)
  );

  revalidatePath("/estabelecimento/momento");
  revalidatePath("/estabelecimento");
}

/**
 * Manda notif (in-app + push) pra usuarios que:
 *  - Estão com check-in ativo no estab agora
 *  - Já fizeram check-in nos últimos 7 dias (frequentadores)
 */
async function notifyMomentAudience(estabId: string, caption: string | null): Promise<void> {
  if (isMockMode()) return;
  const admin = supabaseAdmin();

  // Pega nome do estab pra mensagem
  const { data: estab } = await admin
    .from("establishments")
    .select("name")
    .eq("id", estabId)
    .maybeSingle();
  const estabName = estab?.name ?? "Um lugar perto de você";

  // Coleta audience (active + recent 7d)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const [activeRes, recentRes] = await Promise.all([
    admin.from("checkins").select("profile_id").eq("establishment_id", estabId).eq("status", "active"),
    admin
      .from("checkins")
      .select("profile_id")
      .eq("establishment_id", estabId)
      .gte("checked_in_at", sevenDaysAgo)
      .limit(500),
  ]);

  const audience = new Set<string>();
  for (const r of (activeRes.data ?? []) as Array<{ profile_id: string }>) {
    if (r.profile_id) audience.add(r.profile_id);
  }
  for (const r of (recentRes.data ?? []) as Array<{ profile_id: string }>) {
    if (r.profile_id) audience.add(r.profile_id);
  }

  if (audience.size === 0) return;

  const title = `${estabName} postou no momento 📸`;
  const body = caption ?? "Toque pra ver o que tá rolando agora";
  const link = `/app/estabelecimento/${estabId}/momento`;

  // 1. Insere notifications in-app (1 query batch)
  const notifRows = Array.from(audience).map((profileId) => ({
    profile_id: profileId,
    kind: "moment_posted",
    title,
    body,
    link,
  }));
  await admin.from("notifications").insert(notifRows);

  // 2. Web push em paralelo (não bloqueia)
  await Promise.all(
    Array.from(audience).map((profileId) =>
      sendWebPushTo(profileId, {
        title,
        body,
        url: link,
        tag: `moment-${estabId}`,
      }).catch(() => 0)
    )
  );
}

export async function deleteMomentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const sb = await supabaseServer();
  await sb.from("moments").delete().eq("id", id);
  revalidatePath("/estabelecimento/momento");
}

/** Agenda um momento pra publicar mais tarde */
export async function scheduleMomentAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const imageUrl = String(formData.get("imageUrl") ?? "");
  const caption = String(formData.get("caption") ?? "") || null;
  const scheduledFor = String(formData.get("scheduledFor") ?? "");

  if (!imageUrl || !scheduledFor) return { ok: false, error: "Foto e data são obrigatórios" };

  const when = new Date(scheduledFor);
  if (Number.isNaN(when.getTime())) return { ok: false, error: "Data inválida" };
  if (when.getTime() <= Date.now()) return { ok: false, error: "Data precisa ser no futuro" };
  if (when.getTime() > Date.now() + 30 * 86400_000) return { ok: false, error: "No máximo 30 dias no futuro" };

  if (isMockMode()) return { ok: true };

  const estabId = await getMyEstablishmentId();
  if (!estabId) return { ok: false, error: "Sem estabelecimento" };

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const { error } = await sb.from("scheduled_moments").insert({
    establishment_id: estabId,
    image_url: imageUrl,
    caption,
    scheduled_for: when.toISOString(),
    created_by: user?.id ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/estabelecimento/momento");
  return { ok: true };
}

export async function cancelScheduledMomentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const sb = await supabaseServer();
  await sb.from("scheduled_moments").update({ status: "cancelled" }).eq("id", id).eq("status", "pending");
  revalidatePath("/estabelecimento/momento");
}

export async function sendCourtesyAction(formData: FormData) {
  const toProfileId = String(formData.get("toProfileId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "");
  const message = String(formData.get("message") ?? "") || null;
  if (!toProfileId || !kind || !title) return;

  if (isMockMode()) return;

  const estabId = await getMyEstablishmentId();
  if (!estabId) return;

  const admin = supabaseAdmin(); // bypass RLS
  await admin.from("courtesies").insert({
    establishment_id: estabId,
    to_profile_id: toProfileId,
    kind,
    title,
    message,
  });

  await admin.from("notifications").insert({
    profile_id: toProfileId,
    kind: "courtesy_received",
    title,
    body: message ?? "Cortesia liberada para você!",
    link: "/app/cortesias",
  });

  revalidatePath("/estabelecimento/cortesias");
  revalidatePath("/estabelecimento/pessoas");
}

export async function updateEstablishmentProfileAction(formData: FormData) {
  const estabId = await getMyEstablishmentId();
  if (!estabId) redirect("/estabelecimento");

  const updates = {
    name: String(formData.get("name") ?? ""),
    about: String(formData.get("about") ?? "") || null,
    instagram: String(formData.get("instagram") ?? "") || null,
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    menu_url: String(formData.get("menu_url") ?? "") || null,
    reservation_url: String(formData.get("reservation_url") ?? "") || null,
  };

  if (isMockMode()) redirect("/estabelecimento/perfil?saved=1");

  const sb = await supabaseServer();
  await sb.from("establishments").update(updates).eq("id", estabId);

  revalidatePath("/estabelecimento");
  redirect("/estabelecimento/perfil?saved=1");
}

export async function togglePerkAction(formData: FormData) {
  const perkId = String(formData.get("perkId") ?? "");
  const active = formData.get("active") === "true";

  if (isMockMode() || !perkId) return;

  const estabId = await getMyEstablishmentId();
  if (!estabId) return;

  const sb = await supabaseServer();
  const { data: place } = await sb.from("establishments").select("perks_active").eq("id", estabId).maybeSingle();
  const current = (place?.perks_active as string[] | null) ?? [];
  const next = active ? [...new Set([...current, perkId])] : current.filter((p) => p !== perkId);
  await sb.from("establishments").update({ perks_active: next }).eq("id", estabId);

  revalidatePath("/estabelecimento/premium-casa");
}
