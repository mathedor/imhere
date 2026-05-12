"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function postMoment(input: {
  establishmentId: string;
  imageUrl: string;
  caption?: string;
}) {
  if (isMockMode()) {
    return {
      id: `mock-${Date.now()}`,
      establishment_id: input.establishmentId,
      image_url: input.imageUrl,
      caption: input.caption ?? null,
      views_count: 0,
      posted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 4 * 60 * 60_000).toISOString(),
    };
  }
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("moments")
    .insert({
      establishment_id: input.establishmentId,
      image_url: input.imageUrl,
      caption: input.caption ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMoment(momentId: string): Promise<void> {
  if (isMockMode()) return;
  const sb = await supabaseServer();
  await sb.from("moments").delete().eq("id", momentId);
}

export async function recordMomentView(momentId: string): Promise<void> {
  if (isMockMode()) return;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("moment_views").upsert({ moment_id: momentId, profile_id: user.id });
}
