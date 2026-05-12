import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { Establishment, Profile } from "./types";

export async function listAllProfiles(): Promise<Profile[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as Profile[] | null) ?? [];
}

export async function listAllEstablishments(): Promise<Establishment[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb
    .from("establishments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as Establishment[] | null) ?? [];
}

export async function listSalesAgents(): Promise<Profile[]> {
  if (isMockMode()) return [];
  const sb = await supabaseServer();
  const { data } = await sb.from("profiles").select("*").eq("role", "sales");
  return (data as Profile[] | null) ?? [];
}

export interface AdminStats {
  totalUsers: number;
  totalEstabs: number;
  activeCheckins: number;
  mrrCents: number;
  totalNotifications: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (isMockMode()) {
    return {
      totalUsers: 12418,
      totalEstabs: 480,
      activeCheckins: 8400,
      mrrCents: 18_400_000,
      totalNotifications: 0,
    };
  }
  const sb = await supabaseServer();
  const [users, estabs, activeChks, subs] = await Promise.all([
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb.from("establishments").select("id", { count: "exact", head: true }),
    sb.from("checkins").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("subscriptions").select("amount_cents").eq("status", "active"),
  ]);
  const mrrCents = (subs.data ?? []).reduce((a, s) => a + (s.amount_cents ?? 0), 0);
  return {
    totalUsers: users.count ?? 0,
    totalEstabs: estabs.count ?? 0,
    activeCheckins: activeChks.count ?? 0,
    mrrCents,
    totalNotifications: 0,
  };
}
