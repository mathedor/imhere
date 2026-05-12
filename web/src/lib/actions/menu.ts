"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

/**
 * Resolve qual estabelecimento a action deve atuar:
 * - Se FormData traz `establishmentId`, o caller precisa ser admin pra usar
 * - Caso contrário, usa o estab do owner logado
 */
async function resolveTargetEstabId(formData: FormData): Promise<{
  estabId: string | null;
  isAdminScope: boolean;
}> {
  if (isMockMode()) return { estabId: null, isAdminScope: false };

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { estabId: null, isAdminScope: false };

  const explicit = String(formData.get("establishmentId") ?? "").trim();
  if (explicit) {
    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") return { estabId: null, isAdminScope: false };
    return { estabId: explicit, isAdminScope: true };
  }

  const { data } = await sb.from("establishments").select("id").eq("owner_id", user.id).maybeSingle();
  return { estabId: data?.id ?? null, isAdminScope: false };
}

function revalidateMenu(estabId: string | null, isAdminScope: boolean) {
  if (isAdminScope && estabId) {
    revalidatePath(`/admin/estabelecimentos/${estabId}/cardapio`);
    revalidatePath(`/admin/estabelecimentos/${estabId}`);
  } else {
    revalidatePath("/estabelecimento/cardapio");
  }
}

export async function createMenuItemAction(formData: FormData) {
  if (isMockMode()) {
    revalidatePath("/estabelecimento/cardapio");
    return;
  }
  const { estabId, isAdminScope } = await resolveTargetEstabId(formData);
  if (!estabId) return;

  const priceReais = Number(String(formData.get("price") ?? "0").replace(",", "."));
  const sb = await supabaseServer();
  await sb.from("menu_items").insert({
    establishment_id: estabId,
    category: String(formData.get("category") ?? "Sem categoria"),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    price_cents: Math.round(priceReais * 100),
    image_url: String(formData.get("imageUrl") ?? "") || null,
    position: Number(formData.get("position") ?? 0),
  });

  revalidateMenu(estabId, isAdminScope);
}

export async function updateMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) {
    revalidatePath("/estabelecimento/cardapio");
    return;
  }
  const { estabId, isAdminScope } = await resolveTargetEstabId(formData);
  const priceReais = Number(String(formData.get("price") ?? "0").replace(",", "."));
  const sb = await supabaseServer();
  const q = sb
    .from("menu_items")
    .update({
      category: String(formData.get("category") ?? ""),
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      price_cents: Math.round(priceReais * 100),
      image_url: String(formData.get("imageUrl") ?? "") || null,
    })
    .eq("id", id);
  if (estabId) await q.eq("establishment_id", estabId);
  else await q;

  revalidateMenu(estabId, isAdminScope);
}

export async function toggleMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const available = formData.get("available") === "true";
  if (!id || isMockMode()) return;
  const { estabId, isAdminScope } = await resolveTargetEstabId(formData);
  const sb = await supabaseServer();
  const q = sb.from("menu_items").update({ available: !available }).eq("id", id);
  if (estabId) await q.eq("establishment_id", estabId);
  else await q;
  revalidateMenu(estabId, isAdminScope);
}

export async function deleteMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const { estabId, isAdminScope } = await resolveTargetEstabId(formData);
  const sb = await supabaseServer();
  const q = sb.from("menu_items").delete().eq("id", id);
  if (estabId) await q.eq("establishment_id", estabId);
  else await q;
  revalidateMenu(estabId, isAdminScope);
}
