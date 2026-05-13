"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";
import { checkRateLimit, getRateLimitKey, LIMITS } from "@/lib/rate-limit";
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

  // Rate limit por IP (ainda não logado)
  const rlKey = await getRateLimitKey(`signIn:${email}`);
  const rl = checkRateLimit(rlKey, LIMITS.signIn.limit, LIMITS.signIn.windowMs);
  if (!rl.ok) {
    redirect(`/login?error=${encodeURIComponent(`Muitas tentativas. Aguarde ${Math.ceil(rl.resetIn / 1000)}s.`)}`);
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

  const rlKey = await getRateLimitKey(`signUp`);
  const rl = checkRateLimit(rlKey, LIMITS.signUp.limit, LIMITS.signUp.windowMs);
  if (!rl.ok) {
    redirect(`/cadastro?error=${encodeURIComponent("Muitas tentativas. Aguarde alguns minutos.")}`);
  }

  // Cria via admin + auto-confirm (sem confirmacao por email)
  const admin = supabaseAdmin();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, whatsapp, role: "user" },
  });
  if (createErr) redirect(`/cadastro?error=${encodeURIComponent(createErr.message)}`);

  if (created?.user) {
    // Garante role + whatsapp no profile (trigger pode nao ter pegado)
    await admin
      .from("profiles")
      .update({ role: "user", whatsapp, name })
      .eq("id", created.user.id);
  }

  // Logar imediatamente
  const sb = await supabaseServer();
  await sb.auth.signInWithPassword({ email, password });
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

  // Endereço completo do AddressFieldset
  const cep = String(formData.get("address_cep") ?? "");
  const street = String(formData.get("address_street") ?? "");
  const number = String(formData.get("address_number") ?? "");
  const complement = String(formData.get("address_complement") ?? "");
  const district = String(formData.get("address_district") ?? "");
  const city = String(formData.get("address_city") ?? "");
  const state = String(formData.get("address_state") ?? "").toUpperCase().slice(0, 2);
  const fullAddress = [
    street && `${street}, ${number}${complement ? ` — ${complement}` : ""}`,
    district,
  ].filter(Boolean).join(" — ") || "(a completar no painel)";

  if (isMockMode()) redirect("/estabelecimento");

  // Cria via admin + auto-confirm
  const admin = supabaseAdmin();
  const { data: created, error: signUpErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: ownerName, whatsapp, role: "establishment" },
  });
  if (signUpErr) redirect(`/cadastro?error=${encodeURIComponent(signUpErr.message)}`);
  if (!created?.user) {
    redirect(`/cadastro?error=${encodeURIComponent("Falha ao criar conta")}`);
  }

  try {
    await admin
      .from("profiles")
      .update({
        role: "establishment",
        whatsapp,
        name: ownerName,
        city,
        state,
      })
      .eq("id", created!.user.id);

    await admin.from("establishments").insert({
      owner_id: created!.user.id,
      slug: `${slugify(estabName)}-${created!.user.id.slice(0, 6)}`,
      name: estabName,
      type: estabType,
      cnpj,
      city,
      state,
      cep,
      address: fullAddress,
      whatsapp,
      tags: [],
    });
  } catch (e) {
    console.error("create establishment failed", e);
  }

  // Login automatico
  const sb = await supabaseServer();
  await sb.auth.signInWithPassword({ email, password });
  redirect("/estabelecimento");
}

// alias legado (caso algum lugar ainda use)
export const signUpAction = signUpUserAction;

/** Envia email de reset de senha. Falha silenciosa pra não revelar se o email existe (anti-enum). */
export async function requestPasswordResetAction(formData: FormData): Promise<{ ok: boolean }> {
  if (isMockMode()) return { ok: true };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { ok: false };

  const rlKey = await getRateLimitKey(`reset:${email}`);
  const rl = checkRateLimit(rlKey, LIMITS.resetPassword.limit, LIMITS.resetPassword.windowMs);
  if (!rl.ok) return { ok: true }; // silently noop pra anti-enum

  try {
    const sb = await supabaseServer();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/redefinir-senha`;
    await sb.auth.resetPasswordForEmail(email, { redirectTo });
  } catch (err) {
    console.error("[resetPassword]", err);
  }
  // Sempre retorna ok=true (anti-enumeration)
  return { ok: true };
}

/** Define nova senha — chamado da página /redefinir-senha após user clicar o link do email */
export async function updatePasswordAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (isMockMode()) return { ok: true };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { ok: false, error: "Senha precisa ter no mínimo 8 caracteres" };
  try {
    const sb = await supabaseServer();
    const { error } = await sb.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
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
