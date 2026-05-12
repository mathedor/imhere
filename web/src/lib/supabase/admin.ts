import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from "./config";

/**
 * Cliente com service role — bypassa RLS. USE APENAS EM SERVER ACTIONS / API ROUTES.
 * Nunca exponha esta key no client.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Supabase admin não configurado. Defina SUPABASE_SERVICE_ROLE_KEY em .env.local"
    );
  }
  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
