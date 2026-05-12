"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function completeOnboardingAction(): Promise<void> {
  if (isMockMode()) return;
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;
    await sb
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id);
  } catch (err) {
    console.error("[completeOnboarding]", err);
  }
}

export async function acceptCodeOfConductAction(): Promise<void> {
  if (isMockMode()) return;
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;
    await sb
      .from("profiles")
      .update({ code_of_conduct_accepted_at: new Date().toISOString() })
      .eq("id", user.id);
  } catch (err) {
    console.error("[acceptCodeOfConduct]", err);
  }
}
