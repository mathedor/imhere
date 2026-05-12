import { users as mockUsers } from "@/data/users";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";
import type { Profile } from "./types";

function mockToProfile(u: (typeof mockUsers)[number]): Profile {
  return {
    id: u.id,
    role: "user",
    name: u.name,
    email: `${u.id}@imhere.app`,
    phone: null,
    whatsapp: null,
    instagram: u.instagram ?? null,
    birth_date: null,
    gender: u.gender,
    profession: u.profession,
    bio: u.bio,
    photo_url: u.photo,
    status: u.status,
    city: u.city,
    state: u.state,
    current_plan_id: null,
    verified_at: null,
    last_seen_at: u.checkedInAt ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getProfile(id: string): Promise<Profile | null> {
  if (isMockMode()) {
    const u = mockUsers.find((x) => x.id === id);
    return u ? mockToProfile(u) : null;
  }
  const sb = await supabaseServer();
  const { data } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (isMockMode()) return null;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  if (isMockMode()) return;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await sb.from("profiles").update(updates).eq("id", user.id);
}

export async function getUserGallery(profileId: string): Promise<string[]> {
  if (isMockMode()) {
    const u = mockUsers.find((x) => x.id === profileId);
    return u?.gallery ?? [];
  }
  const sb = await supabaseServer();
  const { data } = await sb
    .from("user_photos")
    .select("url")
    .eq("profile_id", profileId)
    .order("position");
  return (data ?? []).map((p) => p.url);
}
