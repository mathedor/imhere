"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

interface LogInput {
  query?: string;
  filters?: Record<string, unknown>;
  resultCount?: number;
  lat?: number;
  lng?: number;
}

export async function logSearchAction(input: LogInput): Promise<void> {
  if (isMockMode()) return;
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    await sb.from("search_events").insert({
      profile_id: user?.id ?? null,
      query: input.query?.trim() || null,
      filters: input.filters ?? {},
      result_count: input.resultCount ?? 0,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
    });
  } catch (err) {
    console.error("[search-log] falha:", err);
  }
}
