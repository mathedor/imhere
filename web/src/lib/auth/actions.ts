"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import type { EstablishmentType, UserRole } from "@/lib/db/types";

const ROLE_REDIRECTS: Record<UserRole, string> = {
  user: "/app",
  establishment: "/estabelecimento",
  sales: "/comercial",
  admin: "/admin",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (isMockMode()) {
    redirect("/app");
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Erro ao entrar")}`);
  }

  // Detecta role automaticamente do profile
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const targetRole = (profile?.role as UserRole | undefined) ?? "user";
  redirect(ROLE_REDIRECTS[targetRole]);
}

export async function signUpUserAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  const whatsapp = String(formData.get("whatsapp") ?? "");

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

export async function signUpEstablishmentAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ownerName = String(formData.get("ownerName") ?? "");
  const whatsapp = String(formData.get("whatsapp") ?? "");

  const estabName = String(formData.get("estabName") ?? "");
  const estabType = String(formData.get("estabType") ?? "bar") as EstablishmentType;
  const cnpj = String(formData.get("cnpj") ?? "");
  const city = String(formData.get("city") ?? "");
  const state = String(formData.get("state") ?? "").toUpperCase().slice(0, 2);

  if (isMockMode()) redirect("/estabelecimento");

  const sb = await supabaseServer();
  const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name: ownerName, whatsapp, role: "establishment" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });
  if (signUpErr) redirect(`/cadastro?error=${encodeURIComponent(signUpErr.message)}`);
  if (!signUpData.user) {
    redirect("/cadastro?confirme=1");
  }

  // Cria o establishment com owner_id = novo user (via service role pra bypass RLS)
  try {
    const admin = supabaseAdmin();
    // Garante que o profile tem role establishment (caso o metadata não tenha pego no trigger)
    await admin
      .from("profiles")
      .update({
        role: "establishment",
        whatsapp,
        name: ownerName,
        city,
        state,
      })
      .eq("id", signUpData.user.id);

    await admin.from("establishments").insert({
      owner_id: signUpData.user.id,
      slug: `${slugify(estabName)}-${signUpData.user.id.slice(0, 6)}`,
      name: estabName,
      type: estabType,
      cnpj,
      city,
      state,
      address: "(a completar no painel)",
      whatsapp,
      tags: [],
    });
  } catch (e) {
    console.error("create establishment failed", e);
    // Não falha o cadastro — o owner pode completar depois
  }

  if (signUpData.user && !signUpData.session) {
    redirect("/cadastro?confirme=1");
  }
  redirect("/estabelecimento");
}

// alias legado (caso algum lugar ainda use)
export const signUpAction = signUpUserAction;

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
