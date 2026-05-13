"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

// ============================================================
// NPS response
// ============================================================
export async function submitNpsAction(formData: FormData): Promise<{ ok: boolean }> {
  if (isMockMode()) return { ok: true };
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false };
    const score = Math.max(0, Math.min(10, Number(formData.get("score") ?? 0)));
    const feedback = String(formData.get("feedback") ?? "") || null;
    const conversationId = String(formData.get("conversationId") ?? "") || null;
    await sb.from("nps_responses").insert({
      profile_id: user.id,
      conversation_id: conversationId,
      score,
      feedback,
      context: "post_chat",
    });
    return { ok: true };
  } catch (err) {
    console.error("[submitNps]", err);
    return { ok: false };
  }
}

// ============================================================
// Boost por evento (estab compra com créditos)
// ============================================================
const BOOST_COST_CREDITS = 50;
const BOOST_DURATION_MIN = 60;

export async function buyEstabBoostAction(formData: FormData): Promise<{
  ok: boolean;
  endsAt?: string;
  error?: string;
}> {
  if (isMockMode()) {
    return { ok: true, endsAt: new Date(Date.now() + 3600_000).toISOString() };
  }
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Faça login" };

    const { data: estab } = await sb
      .from("establishments")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!estab) return { ok: false, error: "Estabelecimento não encontrado" };

    const reason = String(formData.get("reason") ?? "evento");

    // Debita créditos do owner (usa RPC spend_credits com feature ad-hoc)
    // Como spend_credits espera um feature_code do catalog, vamos chamar add_credits com amount negativo
    // ou usar uma deduction direta via supabaseAdmin pra simplicidade
    const admin = supabaseAdmin();
    const { data: balance } = await admin
      .from("credit_balances")
      .select("balance")
      .eq("profile_id", user.id)
      .maybeSingle();
    const current = balance?.balance ?? 0;
    if (current < BOOST_COST_CREDITS) {
      return { ok: false, error: `Saldo insuficiente · faltam ${BOOST_COST_CREDITS - current} créditos` };
    }

    await admin
      .from("credit_balances")
      .update({ balance: current - BOOST_COST_CREDITS, updated_at: new Date().toISOString() })
      .eq("profile_id", user.id);

    await admin.from("credit_transactions").insert({
      profile_id: user.id,
      amount: -BOOST_COST_CREDITS,
      kind: "spend",
      balance_after: current - BOOST_COST_CREDITS,
      description: `Boost de evento · ${estab.name}`,
    });

    const endsAt = new Date(Date.now() + BOOST_DURATION_MIN * 60_000).toISOString();
    const { data: boost } = await admin
      .from("establishment_boosts")
      .insert({
        establishment_id: estab.id,
        paid_credits: BOOST_COST_CREDITS,
        ends_at: endsAt,
        reason,
        created_by: user.id,
      })
      .select("id")
      .single();

    revalidatePath("/estabelecimento");
    revalidatePath("/estabelecimento/boost");
    return { ok: true, endsAt };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ============================================================
// Plano casal: invite + accept
// ============================================================
export async function inviteCoupleAction(formData: FormData): Promise<{ ok: boolean; token?: string; error?: string }> {
  if (isMockMode()) return { ok: true, token: "mock-token" };
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Faça login" };

    const inviteeEmail = String(formData.get("inviteeEmail") ?? "").toLowerCase().trim();
    if (!inviteeEmail.includes("@")) return { ok: false, error: "E-mail inválido" };

    // Verifica se o user tem subscription ativa
    const { data: sub } = await sb
      .from("subscriptions")
      .select("id, status, is_couple_plan, partner_profile_id")
      .eq("profile_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) return { ok: false, error: "Você precisa ter um plano ativo pra convidar parceiro(a)" };
    if (sub.partner_profile_id) return { ok: false, error: "Você já tem um parceiro vinculado" };

    const admin = supabaseAdmin();

    // Verifica se invitee já existe
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("email", inviteeEmail)
      .maybeSingle();

    const { data: inv } = await admin
      .from("couple_invitations")
      .insert({
        primary_profile_id: user.id,
        invitee_email: inviteeEmail,
        invitee_profile_id: existing?.id ?? null,
        subscription_id: sub.id,
      })
      .select("token")
      .single();

    // Se o user já existe, manda notif
    if (existing?.id) {
      await admin.from("notifications").insert({
        profile_id: existing.id,
        kind: "courtesy_received",
        title: "Convite pra plano casal 💑",
        body: "Alguém te convidou pra dividir um plano premium · aceite e libere features juntos.",
        link: `/app/casal/aceitar?token=${inv?.token}`,
      });
    }

    return { ok: true, token: inv?.token };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function acceptCoupleInviteAction(token: string): Promise<{ ok: boolean; error?: string }> {
  if (isMockMode()) return { ok: true };
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Faça login" };

    const { data: inv } = await sb
      .from("couple_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();
    if (!inv) return { ok: false, error: "Convite inválido ou expirado" };

    const admin = supabaseAdmin();
    await admin
      .from("couple_invitations")
      .update({
        invitee_profile_id: user.id,
        status: "accepted",
        responded_at: new Date().toISOString(),
      })
      .eq("id", inv.id);

    await admin
      .from("subscriptions")
      .update({
        partner_profile_id: user.id,
        is_couple_plan: true,
      })
      .eq("id", inv.subscription_id);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ============================================================
// Resolver alerta admin
// ============================================================
export async function resolveAlertAction(alertId: string): Promise<void> {
  if (isMockMode()) return;
  const admin = supabaseAdmin();
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  await admin
    .from("admin_alerts")
    .update({ resolved: true, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
    .eq("id", alertId);
  revalidatePath("/admin/alertas");
}
