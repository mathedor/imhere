import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface QuizAnswers {
  q1_vibe: string | null;
  q2_drink: string | null;
  q3_music: string | null;
  q4_company: string | null;
  q5_time: string | null;
}

export async function getMyQuizAnswers(): Promise<QuizAnswers | null> {
  if (isMockMode()) return null;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb
    .from("profile_quiz_answers")
    .select("q1_vibe, q2_drink, q3_music, q4_company, q5_time")
    .eq("profile_id", user.id)
    .maybeSingle();
  return (data as QuizAnswers) ?? null;
}
