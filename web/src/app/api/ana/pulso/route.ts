import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CONECTOR DA ANA — pulso do I'm Here (Pulso v2).
 * GET /api/ana/pulso — Authorization: Bearer <ANA_PULSO_TOKEN>
 *
 * Métricas (todas de tabelas reais do schema):
 * - novos_cadastros_hoje / cadastros_por_nivel: profiles criados hoje, por role
 * - online_agora: usuários distintos com atividade nos últimos 15 min
 *   (check-in feito ou mensagem enviada; last_seen_at nunca é gravado pelo app)
 * - acessos_hoje: OMITIDO — não há tracking próprio de page views;
 *   o AnaBeacon no layout público alimenta a Ana diretamente
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
  const ha15min = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  if (sb) {
    // novos_cadastros_hoje + cadastros_por_nivel — profiles criados hoje, por role
    try {
      const { data, error } = await sb
        .from("profiles")
        .select("role")
        .gte("created_at", hoje);
      if (error) throw error;
      const rows = (data ?? []) as Array<{ role: string | null }>;
      pulso.novos_cadastros_hoje = rows.length;
      const porNivel: Record<string, number> = {};
      for (const r of rows) {
        const nivel = r.role ?? "user";
        porNivel[nivel] = (porNivel[nivel] ?? 0) + 1;
      }
      pulso.cadastros_por_nivel = porNivel;
    } catch {
      avisos.push("metrica novos_cadastros_hoje indisponivel");
      avisos.push("metrica cadastros_por_nivel indisponivel");
    }

    // online_agora — usuários distintos com atividade nos últimos 15 min
    // (check-in feito OU mensagem enviada; last_seen_at existe mas nunca é gravado)
    try {
      const ativos = new Set<string>();
      const { data: cks, error: e1 } = await sb
        .from("checkins")
        .select("profile_id")
        .gte("checked_in_at", ha15min);
      if (e1) throw e1;
      for (const c of (cks ?? []) as Array<{ profile_id: string }>) ativos.add(c.profile_id);
      const { data: msgs, error: e2 } = await sb
        .from("messages")
        .select("sender_id")
        .gte("created_at", ha15min);
      if (e2) throw e2;
      for (const m of (msgs ?? []) as Array<{ sender_id: string }>) ativos.add(m.sender_id);
      pulso.online_agora = ativos.size;
    } catch {
      avisos.push("metrica online_agora indisponivel");
    }

    // acessos_hoje — OMITIDO de propósito: sem tracking próprio de visitas;
    // o AnaBeacon (layout público) alimenta a Ana diretamente.

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
