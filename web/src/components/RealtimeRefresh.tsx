"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { isMockMode } from "@/lib/supabase/config";

/**
 * Componente invisível que escuta novas notifications + courtesies + checkins
 * do user logado e dispara router.refresh() pra atualizar os badges do layout.
 *
 * Inserido no app/layout.tsx — funciona automaticamente em qualquer página do /app.
 */
export function RealtimeRefresh({ profileId }: { profileId: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (isMockMode() || !profileId) return;

    const sb = supabase();
    const channel = sb
      .channel(`live:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "courtesies",
          filter: `to_profile_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "credit_balances",
          filter: `profile_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [profileId, router]);

  return null;
}
