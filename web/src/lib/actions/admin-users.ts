"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import type { UserGender, UserRole, UserStatus } from "@/lib/db/types";

export async function createUserAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  const role = (String(formData.get("role") ?? "user") as UserRole);
  const whatsapp = String(formData.get("whatsapp") ?? "") || null;
  const cpf = String(formData.get("cpf") ?? "") || null;
  const birth = String(formData.get("birth") ?? "") || null;
  const gender = (String(formData.get("gender") ?? "") as UserGender) || null;
  const profession = String(formData.get("profession") ?? "") || null;
  const bio = String(formData.get("bio") ?? "") || null;
  const status = (String(formData.get("status") ?? "open") as UserStatus);

  if (isMockMode()) redirect("/admin/usuarios");

  const admin = supabaseAdmin();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error) {
    redirect(`/admin/usuarios/novo?error=${encodeURIComponent(error.message)}`);
  }
  if (created?.user) {
    await admin
      .from("profiles")
      .update({
        role,
        name,
        whatsapp,
        cpf,
        birth_date: birth,
        gender,
        profession,
        bio,
        status,
      })
      .eq("id", created.user.id);
  }
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function updateUserAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/usuarios");

  const updates = {
    name: String(formData.get("name") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    cpf: String(formData.get("cpf") ?? "") || null,
    birth_date: String(formData.get("birth") ?? "") || null,
    gender: (String(formData.get("gender") ?? "") as UserGender) || null,
    profession: String(formData.get("profession") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    role: String(formData.get("role") ?? "user") as UserRole,
    status: String(formData.get("status") ?? "open") as UserStatus,
  };

  if (isMockMode()) redirect(`/admin/usuarios/${id}`);

  const admin = supabaseAdmin();
  await admin.from("profiles").update(updates).eq("id", id);

  revalidatePath(`/admin/usuarios/${id}`);
  revalidatePath("/admin/usuarios");
  redirect(`/admin/usuarios/${id}`);
}

export async function deleteUserAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/usuarios");
  if (isMockMode()) redirect("/admin/usuarios");

  const admin = supabaseAdmin();
  await admin.auth.admin.deleteUser(id);

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}
