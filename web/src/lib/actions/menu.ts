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

export async function createMenuItemAction(formData: FormData) {
  if (isMockMode()) {
    revalidatePath("/estabelecimento/cardapio");
    return;
  }
  const estabId = await getMyEstabId();
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

  revalidatePath("/estabelecimento/cardapio");
}

export async function updateMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) {
    revalidatePath("/estabelecimento/cardapio");
    return;
  }
  const priceReais = Number(String(formData.get("price") ?? "0").replace(",", "."));
  const sb = await supabaseServer();
  await sb
    .from("menu_items")
    .update({
      category: String(formData.get("category") ?? ""),
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      price_cents: Math.round(priceReais * 100),
      image_url: String(formData.get("imageUrl") ?? "") || null,
    })
    .eq("id", id);

  revalidatePath("/estabelecimento/cardapio");
}

export async function toggleMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const available = formData.get("available") === "true";
  if (!id || isMockMode()) return;
  const sb = await supabaseServer();
  await sb.from("menu_items").update({ available: !available }).eq("id", id);
  revalidatePath("/estabelecimento/cardapio");
}

export async function deleteMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const sb = await supabaseServer();
  await sb.from("menu_items").delete().eq("id", id);
  revalidatePath("/estabelecimento/cardapio");
}
