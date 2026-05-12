import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isMockMode } from "./config";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Pode falhar em RSC, ignorar — middleware faz a sync
        }
      },
    },
  });
}

export { isMockMode };
