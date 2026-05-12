"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import type { EstablishmentType } from "@/lib/db/types";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function buildFullAddress(fd: FormData) {
  const street = String(fd.get("address_street") ?? "");
  const number = String(fd.get("address_number") ?? "");
  const complement = String(fd.get("address_complement") ?? "");
  const district = String(fd.get("address_district") ?? "");
  return (
    [
      street && `${street}, ${number}${complement ? ` — ${complement}` : ""}`,
      district,
    ]
      .filter(Boolean)
      .join(" — ") || "(a completar)"
  );
}

export async function createEstablishmentAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const cnpj = String(formData.get("cnpj") ?? "");
  const type = String(formData.get("type") ?? "bar") as EstablishmentType;
  const capacity = Number(formData.get("capacity") ?? 0) || null;
  const whatsapp = String(formData.get("whatsapp") ?? "") || null;
  const instagram = String(formData.get("instagram") ?? "") || null;
  const ownerEmail = String(formData.get("ownerEmail") ?? "");
  const about = String(formData.get("about") ?? "") || null;
  const planCode = String(formData.get("plan") ?? "trial");

  const cep = String(formData.get("address_cep") ?? "") || null;
  const city = String(formData.get("address_city") ?? "");
  const state = String(formData.get("address_state") ?? "").toUpperCase().slice(0, 2);
  const fullAddress = buildFullAddress(formData);

  if (isMockMode()) redirect("/admin/estabelecimentos");

  const admin = supabaseAdmin();

  // 1) Cria auth user pro owner (com senha aleatória, confirma email)
  let ownerId: string | null = null;
  if (ownerEmail) {
    const tempPass = `Welcome${Math.random().toString(36).slice(2, 10)}`;
    const { data: createdAuth } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password: tempPass,
      email_confirm: true,
      user_metadata: { name: name + " — Owner", role: "establishment" },
    });
    if (createdAuth?.user) {
      ownerId = createdAuth.user.id;
      await admin
        .from("profiles")
        .update({ role: "establishment", whatsapp, city, state })
        .eq("id", ownerId);
    }
  }

  // 2) Cria establishment
  const { data: estab, error } = await admin
    .from("establishments")
    .insert({
      owner_id: ownerId,
      slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
      name,
      type,
      cnpj,
      capacity,
      whatsapp,
      instagram,
      about,
      city,
      state,
      cep,
      address: fullAddress,
      tags: [],
    })
    .select()
    .single();

  if (error) {
    redirect(`/admin/estabelecimentos/novo?error=${encodeURIComponent(error.message)}`);
  }

  // 3) Plano (se não trial)
  if (estab && planCode !== "trial") {
    const { data: plan } = await admin
      .from("plans")
      .select("id, monthly_price_cents")
      .eq("code", planCode)
      .maybeSingle();
    if (plan) {
      await admin.from("subscriptions").insert({
        establishment_id: estab.id,
        plan_id: plan.id,
        amount_cents: plan.monthly_price_cents,
        billing_cycle: "monthly",
        status: "trialing",
      });
    }
  }

  revalidatePath("/admin/estabelecimentos");
  redirect("/admin/estabelecimentos");
}

export async function updateEstablishmentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/estabelecimentos");

  const updates = {
    name: String(formData.get("name") ?? ""),
    cnpj: String(formData.get("cnpj") ?? "") || null,
    type: String(formData.get("type") ?? "bar") as EstablishmentType,
    capacity: Number(formData.get("capacity") ?? 0) || null,
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    instagram: String(formData.get("instagram") ?? "") || null,
    about: String(formData.get("about") ?? "") || null,
    cep: String(formData.get("address_cep") ?? "") || null,
    city: String(formData.get("address_city") ?? ""),
    state: String(formData.get("address_state") ?? "").toUpperCase().slice(0, 2),
    address: buildFullAddress(formData),
  };

  if (isMockMode()) redirect(`/admin/estabelecimentos/${id}`);

  const admin = supabaseAdmin();
  await admin.from("establishments").update(updates).eq("id", id);

  revalidatePath("/admin/estabelecimentos");
  revalidatePath(`/admin/estabelecimentos/${id}`);
  redirect(`/admin/estabelecimentos/${id}`);
}

export async function deleteEstablishmentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) redirect("/admin/estabelecimentos");

  const admin = supabaseAdmin();
  await admin.from("establishments").delete().eq("id", id);

  revalidatePath("/admin/estabelecimentos");
  redirect("/admin/estabelecimentos");
}

export async function setGeoAction(estabId: string, lat: number, lng: number): Promise<void> {
  if (isMockMode()) return;
  const admin = supabaseAdmin();
  await admin.rpc("set_establishment_geo", { estab_id: estabId, lat, lng });
}
