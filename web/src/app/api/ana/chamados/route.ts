import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://imhere-nine.vercel.app";

type Chamado = {
  id: string;
  titulo: string;
  de: string;
  status: string;
  prioridade: "normal" | "alta";
  criado_em: string;
  detalhe: string;
  url?: string;
};

/** Conector da Ana — chamados um a um · GET /api/ana/chamados · Bearer ANA_PULSO_TOKEN */
export async function GET(req: Request) {
  const token = process.env.ANA_PULSO_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const chamados: Chamado[] = [];

  try {
    const sb = supabaseAdmin();

    // moderation_reports pendentes — mesma entidade do chamados_abertos do pulso
    const { data, error } = await sb
      .from("moderation_reports")
      .select("id, reporter_id, category, description, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      id: string;
      reporter_id: string | null;
      category: string | null;
      description: string | null;
      status: string;
      created_at: string;
    }>;

    // nome de quem denunciou (best-effort)
    const nomes: Record<string, string> = {};
    try {
      const ids = [...new Set(rows.map((r) => r.reporter_id).filter(Boolean))] as string[];
      if (ids.length > 0) {
        const { data: profs, error: e2 } = await sb
          .from("profiles")
          .select("id, name")
          .in("id", ids);
        if (e2) throw e2;
        for (const p of (profs ?? []) as Array<{ id: string; name: string | null }>) {
          if (p.name) nomes[p.id] = p.name;
        }
      }
    } catch {
      // segue sem nomes
    }

    for (const r of rows) {
      const cat = r.category ?? "other";
      chamados.push({
        id: r.id,
        titulo: `Denúncia: ${cat}`,
        de: (r.reporter_id && nomes[r.reporter_id]) || "anônimo",
        status: "pendente",
        prioridade: cat === "safety" || cat === "harassment" ? "alta" : "normal",
        criado_em: r.created_at,
        detalhe: r.description || `Denúncia de moderação (categoria ${cat}) aguardando revisão.`,
        url: `${BASE}/admin/moderacao`,
      });
    }
  } catch {
    // listagem nunca 500 — devolve o que tiver
  }

  return NextResponse.json({ sistema: "imhere", chamados });
}
