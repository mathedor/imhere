"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function markAllNotificationsReadAction() {
  if (isMockMode()) return;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  // Marca todas notifications como lidas
  await sb
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .is("read_at", null);

  // Marca conversas como lidas (zera badge chat)
  const { data: myConvs } = await sb
    .from("conversations")
    .select("id")
    .contains("participants", [user.id]);

  if (myConvs && myConvs.length > 0) {
    await sb
      .from("messages")
      .update({ status: "read" })
      .in(
        "conversation_id",
        myConvs.map((c) => c.id)
      )
      .neq("sender_id", user.id)
      .neq("status", "read");
  }

  revalidatePath("/app/notificacoes");
  revalidatePath("/app/chat");
  revalidatePath("/app");
}

export async function markNotificationReadAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id || isMockMode()) return;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;
  await sb
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", user.id);
  revalidatePath("/app/notificacoes");
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (isMockMode()) return 3;
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return 0;
  const { count } = await sb
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .is("read_at", null);
  return count ?? 0;
}
