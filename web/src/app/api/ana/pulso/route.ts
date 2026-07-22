import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CONECTOR DA ANA — pulso do I'm Here.
 * GET /api/ana/pulso — Authorization: Bearer <ANA_PULSO_TOKEN>
 *
 * Métricas (todas de tabelas reais do schema):
 * - online_agora: checkins status='active' ainda não expirados (gente na balada AGORA)
 * - acessos_hoje: check-ins feitos hoje (America/Sao_Paulo)
 * - vendas_hoje / transacionado_hoje_centavos: payments status='paid' pagos hoje
 * - chamados_abertos: moderation_reports status='pending' (denúncias aguardando moderação)
 * - tarefas_pendentes: identity_verifications status='pending' (selfies aguardando revisão)
 * - avisos: admin_alerts não resolvidos (kind: checkin_drop, report_spike, churn_spike...)
 */

/** Início do dia de hoje em America/Sao_Paulo (UTC-3 fixo, Brasil sem DST desde 2019). */
function inicioHojeSP(): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return `${ymd}T00:00:00-03:00`;
}

export async function GET(req: Request) {
  const token = process.env.ANA_PULSO_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const avisos: string[] = [];
  const pulso: Record<string, unknown> = { sistema: "imhere" };

  let sb: ReturnType<typeof supabaseAdmin> | null = null;
  try {
    sb = supabaseAdmin();
  } catch {
    avisos.push("banco indisponivel (SUPABASE_SERVICE_ROLE_KEY ausente)");
  }

  const hoje = inicioHojeSP();
  const agora = new Date().toISOString();

  if (sb) {
    // online_agora — check-ins ativos e não expirados neste instante
    try {
      const { count, error } = await sb
        .from("checkins")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gt("expires_at", agora);
      if (error) throw error;
      pulso.online_agora = count ?? 0;
    } catch {
      avisos.push("metrica online_agora indisponivel");
    }

    // acessos_hoje — check-ins feitos hoje (o "acesso" do I'm Here é o check-in)
    try {
      const { count, error } = await sb
        .from("checkins")
        .select("id", { count: "exact", head: true })
        .gte("checked_in_at", hoje);
      if (error) throw error;
      pulso.acessos_hoje = count ?? 0;
    } catch {
      avisos.push("metrica acessos_hoje indisponivel");
    }

    // vendas_hoje + transacionado_hoje_centavos — payments pagos hoje (Efí seta status='paid' + paid_at)
    try {
      const { data, error } = await sb
        .from("payments")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("paid_at", hoje);
      if (error) throw error;
      const rows = (data ?? []) as Array<{ amount_cents: number | null }>;
      pulso.vendas_hoje = rows.length;
      pulso.transacionado_hoje_centavos = rows.reduce(
        (a, r) => a + (r.amount_cents ?? 0),
        0
      );
    } catch {
      avisos.push("metrica vendas_hoje indisponivel");
      avisos.push("metrica transacionado_hoje_centavos indisponivel");
    }

    // chamados_abertos — denúncias (botão pânico / report) aguardando moderação
    try {
      const { count, error } = await sb
        .from("moderation_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      pulso.chamados_abertos = count ?? 0;
    } catch {
      avisos.push("metrica chamados_abertos indisponivel");
    }

    // tarefas_pendentes — verificações de identidade (selfie) aguardando revisão do admin
    try {
      const { count, error } = await sb
        .from("identity_verifications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      pulso.tarefas_pendentes = count ?? 0;
    } catch {
      avisos.push("metrica tarefas_pendentes indisponivel");
    }

    // avisos — alertas de anomalia não resolvidos (checkin_drop, report_spike, churn_spike, fraud)
    try {
      const { data, error } = await sb
        .from("admin_alerts")
        .select("severity, title")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      for (const a of (data ?? []) as Array<{ severity: string; title: string }>) {
        avisos.push(`[${a.severity}] ${a.title}`);
      }
    } catch {
      avisos.push("alertas admin indisponiveis");
    }
  }

  pulso.avisos = avisos;
  return NextResponse.json(pulso);
}
