"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import { moderate } from "@/lib/moderation";

export async function sendMessageAction(formData: FormData) {
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId || !body) return;

  // Moderação client-side já feita; revalidamos server-side por segurança
  const mod = moderate(body);
  if (!mod.ok && mod.reason === "blocked") {
    if (!isMockMode()) {
      const sb = await supabaseServer();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        await sb.from("moderation_logs").insert({
          profile_id: user.id,
          conversation_id: conversationId,
          type: "blocked",
          matched: mod.matched,
          body,
        });
      }
    }
    return;
  }

  if (isMockMode()) return;

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  await sb.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    type: "text",
    body,
    status: "sent",
  });

  await sb
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/app/chat/${conversationId}`);
  revalidatePath("/app/chat");
}

/** Envia mídia (imagem ou áudio) já uploaded no Storage */
export async function sendMediaMessageAction(input: {
  conversationId: string;
  mediaUrl: string;
  type: "image" | "audio";
  durationSec?: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (isMockMode()) return { ok: true };
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Faça login" };

    await sb.from("messages").insert({
      conversation_id: input.conversationId,
      sender_id: user.id,
      type: input.type,
      body: null,
      media_url: input.mediaUrl,
      audio_duration_sec: input.type === "audio" ? Math.max(1, Math.round(input.durationSec ?? 0)) : null,
      status: "sent",
    });

    await sb
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", input.conversationId);

    revalidatePath(`/app/chat/${input.conversationId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
