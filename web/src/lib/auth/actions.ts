"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import type { UserRole } from "@/lib/db/types";

const ROLE_REDIRECTS: Record<UserRole, string> = {
  user: "/app",
  establishment: "/estabelecimento",
  sales: "/comercial",
  admin: "/admin",
};

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as UserRole) ?? "user";

  if (isMockMode()) {
    redirect(ROLE_REDIRECTS[role] ?? "/app");
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Erro ao entrar")}`);
  }

  // Busca o role real do usuário
  const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).single();
  const targetRole = profile?.role ?? "user";
  redirect(ROLE_REDIRECTS[targetRole as UserRole]);
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const whatsapp = formData.get("whatsapp") as string | null;

  if (isMockMode()) redirect("/app");

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name, whatsapp, role: "user" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });
  if (error) redirect(`/cadastro?error=${encodeURIComponent(error.message)}`);
  if (data.user && !data.session) {
    redirect("/cadastro?confirme=1");
  }
  redirect("/app");
}

export async function signOutAction() {
  if (isMockMode()) redirect("/");
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

export async function createSalesUser(email: string, name: string) {
  if (isMockMode()) return;
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name, role: "sales" },
  });
  if (error) throw error;
  if (data.user) {
    await admin.from("profiles").update({ role: "sales" }).eq("id", data.user.id);
  }
}
