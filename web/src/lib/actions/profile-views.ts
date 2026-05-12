"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function recordProfileViewAction(targetId: string) {
  if (isMockMode() || !targetId) return;
  const sb = await supabaseServer();
  await sb.rpc("record_profile_view", { target_id: targetId });
}

export interface ProfileVisitor {
  viewer_id: string;
  viewer_name: string;
  viewer_photo: string | null;
  viewer_profession: string | null;
  visits_count: number;
  last_view: string;
}

export async function getMyProfileViews(daysBack = 30): Promise<ProfileVisitor[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb.rpc("my_profile_views", { days_back: daysBack });
  return (data as ProfileVisitor[] | null) ?? [];
}
