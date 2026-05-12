"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function doCheckInAction(formData: FormData) {
  const estabId = String(formData.get("estabId") ?? "");
  if (!estabId) return;
  if (isMockMode()) {
    revalidatePath(`/app/estabelecimento/${estabId}`);
    return;
  }
  const sb = await supabaseServer();
  await sb.rpc("do_checkin", { estab_id: estabId });
  revalidatePath(`/app/estabelecimento/${estabId}`);
  revalidatePath("/app");
}

export async function doCheckOutAction(formData: FormData) {
  const estabId = String(formData.get("estabId") ?? "");
  if (isMockMode()) {
    if (estabId) revalidatePath(`/app/estabelecimento/${estabId}`);
    return;
  }
  const sb = await supabaseServer();
  await sb.rpc("do_checkout");
  if (estabId) revalidatePath(`/app/estabelecimento/${estabId}`);
  revalidatePath("/app");
}

export async function createContactRequestAction(formData: FormData) {
  const toProfileId = String(formData.get("toProfileId") ?? "");
  const establishmentId = String(formData.get("establishmentId") ?? "");
  if (!toProfileId || !establishmentId) return;
  if (isMockMode()) {
    revalidatePath(`/app/usuario/${toProfileId}`);
    return;
  }
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  await sb.from("contact_requests").insert({
    from_profile_id: user.id,
    to_profile_id: toProfileId,
    establishment_id: establishmentId,
  });
  await sb.from("notifications").insert({
    profile_id: toProfileId,
    kind: "contact_request",
    title: "Alguém quer falar com você",
    body: "Toque para responder",
    link: "/app/notificacoes",
  });
  revalidatePath(`/app/usuario/${toProfileId}`);
}

export async function respondContactRequestAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const accept = formData.get("accept") === "true";
  if (!requestId || isMockMode()) return;

  const sb = await supabaseServer();
  await sb.rpc("respond_contact_request", { req_id: requestId, accept });
  revalidatePath("/app/notificacoes");
  revalidatePath("/app/chat");
}
