"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import { checkRateLimit, getRateLimitKey, LIMITS } from "@/lib/rate-limit";

type ReportCategory = "harassment" | "spam" | "fake" | "offensive" | "safety" | "other";

interface ReportInput {
  reportedProfileId?: string;
  conversationId?: string;
  messageId?: string;
  establishmentId?: string;
  category: ReportCategory;
  description?: string;
}

export async function createModerationReportAction(input: ReportInput): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (isMockMode()) return { ok: true };

  const rlKey = await getRateLimitKey("report");
  const rl = checkRateLimit(rlKey, LIMITS.report.limit, LIMITS.report.windowMs);
  if (!rl.ok) return { ok: false, error: "Muitas denúncias num curto período. Aguarde alguns minutos." };

  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Faça login pra denunciar" };

    const { error } = await sb.from("moderation_reports").insert({
      reporter_id: user.id,
      reported_profile_id: input.reportedProfileId ?? null,
      conversation_id: input.conversationId ?? null,
      message_id: input.messageId ?? null,
      establishment_id: input.establishmentId ?? null,
      category: input.category,
      description: input.description ?? null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    console.error("[createModerationReport]", err);
    return { ok: false, error: "Erro ao enviar denúncia" };
  }
}

export async function resolveReportAction(
  reportId: string,
  resolution: "reviewed" | "dismissed" | "actioned"
): Promise<void> {
  if (isMockMode()) return;
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;
    await sb
      .from("moderation_reports")
      .update({
        status: resolution,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    revalidatePath("/admin/moderacao");
  } catch (err) {
    console.error("[resolveReport]", err);
  }
}
