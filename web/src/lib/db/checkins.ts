"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function doCheckIn(establishmentId: string): Promise<string | null> {
  if (isMockMode()) return `mock-checkin-${establishmentId}`;
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("do_checkin", { estab_id: establishmentId });
  if (error) throw error;
  return data;
}

export async function doCheckOut(): Promise<void> {
  if (isMockMode()) return;
  const sb = await supabaseServer();
  await sb.rpc("do_checkout");
}

export async function getCurrentCheckin() {
  if (isMockMode()) return null;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb
    .from("checkins")
    .select("*, establishments(*)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  return data;
}
