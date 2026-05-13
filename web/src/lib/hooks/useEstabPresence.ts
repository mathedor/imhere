"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface PresenceState {
  online: number;
  recentJoin: string | null; // profile_id que acabou de entrar
}

/**
 * Conecta no presence channel do estab e mantém contagem viva de online.
 * - `online` incrementa quando alguém entra (presence_state)
 * - `recentJoin` pulsa o último que chegou pra animação
 *
 * Cada user que abre a página do estab "track" no canal.
 */
export function useEstabPresence(estabId: string | null, userId: string | null): PresenceState {
  const [online, setOnline] = useState(0);
  const [recentJoin, setRecentJoin] = useState<string | null>(null);

  useEffect(() => {
    if (!estabId || !userId) return;

    const sb = supabase();
    const channel = sb.channel(`estab-presence:${estabId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const total = Object.keys(state).length;
        setOnline(total);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key !== userId) {
          setRecentJoin(key);
          setTimeout(() => setRecentJoin(null), 5000);
        }
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          joined_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
      sb.removeChannel(channel);
    };
  }, [estabId, userId]);

  return { online, recentJoin };
}
