import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface LoyaltyProgram {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  checkins_required: number;
  reward_label: string;
  reward_description: string | null;
  active: boolean;
}

export interface LoyaltyProgressRow {
  programId: string;
  programName: string;
  rewardLabel: string;
  checkinsRequired: number;
  checkinsDone: number;
  pct: number;
  ready: boolean;
}

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[loyalty] ${label}:`, err);
    return fallback;
  }
}

export async function listMyEstabPrograms(): Promise<LoyaltyProgram[]> {
  if (isMockMode()) return [];
  return safe(
    async () => {
      const sb = await supabaseServer();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return [];
      const { data: estab } = await sb
        .from("establishments")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!estab) return [];
      const { data } = await sb
        .from("loyalty_programs")
        .select("*")
        .eq("establishment_id", estab.id)
        .order("created_at", { ascending: false });
      return (data as LoyaltyProgram[] | null) ?? [];
    },
    [],
    "listMyEstabPrograms"
  );
}

export async function listProgramsByEstab(estabId: string): Promise<LoyaltyProgram[]> {
  if (isMockMode()) return [];
  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data } = await sb
        .from("loyalty_programs")
        .select("*")
        .eq("establishment_id", estabId)
        .eq("active", true);
      return (data as LoyaltyProgram[] | null) ?? [];
    },
    [],
    "listProgramsByEstab"
  );
}

export async function getMyProgressForEstab(estabId: string): Promise<LoyaltyProgressRow[]> {
  if (isMockMode()) return [];
  return safe(
    async () => {
      const sb = await supabaseServer();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return [];

      const { data: programs } = await sb
        .from("loyalty_programs")
        .select("id, name, reward_label, checkins_required")
        .eq("establishment_id", estabId)
        .eq("active", true);

      if (!programs || programs.length === 0) return [];

      const programIds = programs.map((p) => p.id);
      const { data: progress } = await sb
        .from("loyalty_progress")
        .select("program_id, checkins_done")
        .eq("profile_id", user.id)
        .in("program_id", programIds);

      const progressMap = new Map(
        ((progress ?? []) as Array<{ program_id: string; checkins_done: number }>).map((p) => [
          p.program_id,
          p.checkins_done,
        ])
      );

      return (programs as Array<{
        id: string;
        name: string;
        reward_label: string;
        checkins_required: number;
      }>).map((p) => {
        const done = progressMap.get(p.id) ?? 0;
        const pct = Math.min(100, (done / p.checkins_required) * 100);
        return {
          programId: p.id,
          programName: p.name,
          rewardLabel: p.reward_label,
          checkinsRequired: p.checkins_required,
          checkinsDone: done,
          pct,
          ready: done >= p.checkins_required,
        };
      });
    },
    [],
    "getMyProgressForEstab"
  );
}

export interface CustomerProgressRow {
  profileId: string;
  profileName: string;
  profilePhoto: string | null;
  programId: string;
  programName: string;
  rewardLabel: string;
  checkinsRequired: number;
  checkinsDone: number;
  ready: boolean;
  lastCheckinAt: string | null;
}

/** Lista TODOS clientes que tem progresso > 0 num programa do estab */
export async function listProgramCustomers(estabId: string): Promise<CustomerProgressRow[]> {
  if (isMockMode()) return [];
  return safe(
    async () => {
      const sb = await supabaseServer();
      const { data: programs } = await sb
        .from("loyalty_programs")
        .select("id, name, reward_label, checkins_required")
        .eq("establishment_id", estabId)
        .eq("active", true);
      if (!programs || programs.length === 0) return [];

      const programIds = programs.map((p) => p.id);
      const { data: progress } = await sb
        .from("loyalty_progress")
        .select("program_id, profile_id, checkins_done, last_checkin_at, profiles(name, photo_url)")
        .in("program_id", programIds)
        .gt("checkins_done", 0)
        .order("checkins_done", { ascending: false })
        .limit(100);

      const programMap = new Map(
        (programs as Array<{ id: string; name: string; reward_label: string; checkins_required: number }>).map((p) => [
          p.id,
          p,
        ])
      );

      return ((progress ?? []) as unknown as Array<{
        program_id: string;
        profile_id: string;
        checkins_done: number;
        last_checkin_at: string | null;
        profiles: { name: string | null; photo_url: string | null } | null;
      }>).map((row) => {
        const program = programMap.get(row.program_id);
        return {
          profileId: row.profile_id,
          profileName: row.profiles?.name ?? "—",
          profilePhoto: row.profiles?.photo_url ?? null,
          programId: row.program_id,
          programName: program?.name ?? "—",
          rewardLabel: program?.reward_label ?? "—",
          checkinsRequired: program?.checkins_required ?? 0,
          checkinsDone: row.checkins_done,
          ready: row.checkins_done >= (program?.checkins_required ?? 999),
          lastCheckinAt: row.last_checkin_at,
        };
      });
    },
    [],
    "listProgramCustomers"
  );
}
