"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

/** Calcula score de afinidade entre o user logado e outro perfil. Retorna null se algum dos dois não respondeu o quiz. */
export async function getAffinityWithUserAction(otherProfileId: string): Promise<number | null> {
  if (isMockMode()) return 75;
  if (!otherProfileId) return null;
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    if (user.id === otherProfileId) return null;

    const { data, error } = await sb.rpc("calc_quiz_affinity", {
      profile_a: user.id,
      profile_b: otherProfileId,
    });
    if (error) return null;
    const score = data as number | null;
    if (score === null || score === 0) return null;
    return score;
  } catch {
    return null;
  }
}

const Q1 = ["agitado", "tranquilo", "misto"] as const;
const Q2 = ["cerveja", "drink", "vinho", "nenhum"] as const;
const Q3 = ["sertanejo", "eletronica", "pagode", "rock", "indie"] as const;
const Q4 = ["sozinho", "amigos", "casal", "familia"] as const;
const Q5 = ["jantar", "happy", "madrugada"] as const;

function pick<T extends readonly string[]>(value: unknown, options: T): T[number] | null {
  const v = String(value ?? "");
  return (options as readonly string[]).includes(v) ? (v as T[number]) : null;
}

export async function saveQuizAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (isMockMode()) return { ok: true };

  const q1 = pick(formData.get("q1"), Q1);
  const q2 = pick(formData.get("q2"), Q2);
  const q3 = pick(formData.get("q3"), Q3);
  const q4 = pick(formData.get("q4"), Q4);
  const q5 = pick(formData.get("q5"), Q5);

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Faça login" };

  const { error } = await sb.from("profile_quiz_answers").upsert({
    profile_id: user.id,
    q1_vibe: q1,
    q2_drink: q2,
    q3_music: q3,
    q4_company: q4,
    q5_time: q5,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/perfil/quiz");
  revalidatePath("/app/perfil");
  revalidatePath("/app/perfil/match-analysis");
  return { ok: true };
}
