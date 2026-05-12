"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function sendCourtesy(input: {
  establishmentId: string;
  toProfileId: string;
  kind: string;
  title: string;
  message?: string;
}) {
  if (isMockMode()) {
    return { id: "mock-courtesy", status: "sent" as const };
  }
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("courtesies")
    .insert({
      establishment_id: input.establishmentId,
      to_profile_id: input.toProfileId,
      kind: input.kind,
      title: input.title,
      message: input.message ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  await sb.from("notifications").insert({
    profile_id: input.toProfileId,
    kind: "courtesy_received",
    title: input.title,
    body: input.message ?? "Cortesia liberada para você!",
    link: "/app/cortesias",
  });
  return data;
}

export async function redeemCourtesy(courtesyId: string): Promise<void> {
  if (isMockMode()) return;
  const sb = await supabaseServer();
  await sb.rpc("redeem_courtesy", { courtesy_id: courtesyId });
}
