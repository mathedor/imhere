"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isMockMode } from "@/lib/supabase/config";
import type { Message } from "@/lib/db/types";

/**
 * Inscreve no canal Realtime do Supabase da conversa.
 * Retorna messages atualizadas em tempo real.
 */
export function useRealtimeMessages(conversationId: string, initial: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initial);

  useEffect(() => {
    if (isMockMode() || !conversationId) return;

    const sb = supabase();
    const channel = sb
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Evita duplicar mensagem que o próprio user enviou (já adicionada otimisticamente)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [conversationId]);

  return [messages, setMessages] as const;
}

/**
 * Inscreve no canal de presença de um estabelecimento.
 * Notifica quando alguém faz check-in/check-out.
 */
export function useRealtimePresence(establishmentId: string, onChange?: () => void) {
  useEffect(() => {
    if (isMockMode() || !establishmentId) return;
    const sb = supabase();
    const channel = sb
      .channel(`estab:${establishmentId}:checkins`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checkins",
          filter: `establishment_id=eq.${establishmentId}`,
        },
        () => onChange?.()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [establishmentId, onChange]);
}

/**
 * Inscreve nas notificações do user atual.
 */
export function useRealtimeNotifications(profileId: string, onNew?: (n: unknown) => void) {
  useEffect(() => {
    if (isMockMode() || !profileId) return;
    const sb = supabase();
    const channel = sb
      .channel(`notif:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => onNew?.(payload.new)
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [profileId, onNew]);
}
