"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

export async function submitVerificationAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (isMockMode()) return { ok: true };
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Faça login" };

    const selfieUrl = String(formData.get("selfieUrl") ?? "");
    const docUrl = String(formData.get("docUrl") ?? "") || null;
    if (!selfieUrl) return { ok: false, error: "Selfie obrigatória" };

    // Cancela pending anterior (não dá pra usar UNIQUE deferrable em conflict do PostgREST)
    await sb
      .from("identity_verifications")
      .delete()
      .eq("profile_id", user.id)
      .eq("status", "pending");

    const { error } = await sb.from("identity_verifications").insert({
      profile_id: user.id,
      selfie_url: selfieUrl,
      doc_url: docUrl,
      status: "pending",
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/app/perfil/verificacao");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function reviewVerificationAction(
  verificationId: string,
  decision: "approved" | "rejected",
  reason?: string
): Promise<void> {
  if (isMockMode()) return;
  try {
    const admin = supabaseAdmin();
    await admin
      .from("identity_verifications")
      .update({
        status: decision,
        reviewed_at: new Date().toISOString(),
        rejection_reason: decision === "rejected" ? (reason ?? "Selfie não atende aos critérios") : null,
      })
      .eq("id", verificationId);
    revalidatePath("/admin/moderacao/verificacoes");
  } catch (err) {
    console.error("[reviewVerification]", err);
  }
}
