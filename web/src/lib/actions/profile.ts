"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { UserGender, UserStatus } from "@/lib/db/types";

export async function updateMyProfileAction(formData: FormData) {
  if (isMockMode()) redirect("/app/perfil?saved=1");

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const updates = {
    name: String(formData.get("name") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    cpf: String(formData.get("cpf") ?? "") || null,
    instagram: String(formData.get("instagram") ?? "") || null,
    birth_date: String(formData.get("birth") ?? "") || null,
    gender: (String(formData.get("gender") ?? "") as UserGender) || null,
    profession: String(formData.get("profession") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    status: (String(formData.get("status") ?? "open") as UserStatus),
  };

  await sb.from("profiles").update(updates).eq("id", user.id);

  revalidatePath("/app/perfil");
  redirect("/app/perfil?saved=1");
}
