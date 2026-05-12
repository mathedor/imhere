"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import { moderate } from "@/lib/moderation";

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

  revalidatePath("/estabelecimento/momento");
  revalidatePath("/estabelecimento");
}

export async function deleteMomentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const sb = await supabaseServer();
  await sb.from("moments").delete().eq("id", id);
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
