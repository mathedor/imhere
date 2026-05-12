"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import { moderate } from "@/lib/moderation";
import type { Message } from "./types";

export async function createContactRequest(toProfileId: string, establishmentId: string) {
  if (isMockMode()) return { id: "mock-req", status: "pending" as const };
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await sb
    .from("contact_requests")
    .insert({
      from_profile_id: user.id,
      to_profile_id: toProfileId,
      establishment_id: establishmentId,
    })
    .select()
    .single();
  if (error) throw error;

  await sb.from("notifications").insert({
    profile_id: toProfileId,
    kind: "contact_request",
    title: "Alguém quer falar com você",
    body: "Toque para responder ao pedido de contato.",
    link: "/app/notificacoes",
  });

  return data;
}

export async function respondContactRequest(reqId: string, accept: boolean): Promise<string | null> {
  if (isMockMode()) return accept ? "mock-conv" : null;
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("respond_contact_request", { req_id: reqId, accept });
  if (error) throw error;
  return data;
}

export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  const moderation = moderate(body);
  if (!moderation.ok && moderation.reason === "blocked") {
    throw new Error(`Mensagem bloqueada: contém "${moderation.matched}"`);
  }

  if (isMockMode()) {
    return {
      id: `mock-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: "u-me",
      type: "text",
      body,
      media_url: null,
      audio_duration_sec: null,
      link_url: null,
      link_title: null,
      status: "sent",
      blocked_reason: null,
      created_at: new Date().toISOString(),
    };
  }

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await sb
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      type: "text",
      body,
      status: "sent",
    })
    .select()
    .single();
  if (error) throw error;

  await sb
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

export async function listConversations() {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from("conversations")
    .select("*")
    .contains("participants", [user.id])
    .order("last_message_at", { ascending: false });
  return data ?? [];
}

export async function listMessages(conversationId: string) {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");
  return data ?? [];
}
