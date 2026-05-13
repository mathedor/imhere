import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface VerificationRow {
  id: string;
  profile_id: string;
  selfie_url: string;
  doc_url: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface VerificationWithProfile extends VerificationRow {
  profile: { id: string; name: string | null; email: string | null; photo_url: string | null } | null;
}

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[verifications] ${label}:`, err);
    return fallback;
  }
}

export async function getMyVerification(): Promise<VerificationRow | null> {
  if (isMockMode()) return null;
  return safe(
    async () => {
      const sb = await supabaseServer();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return null;
      const { data } = await sb
        .from("identity_verifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as VerificationRow | null) ?? null;
    },
    null,
    "getMyVerification"
  );
}

export async function listPendingVerifications(): Promise<VerificationWithProfile[]> {
  if (isMockMode()) return [];
  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data } = await sb
        .from("identity_verifications")
        .select("*, profile:profiles(id, name, email, photo_url)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50);
      return ((data ?? []) as unknown as VerificationWithProfile[]);
    },
    [],
    "listPendingVerifications"
  );
}
