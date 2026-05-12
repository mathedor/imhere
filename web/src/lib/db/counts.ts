import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export interface UnreadCounts {
  notifications: number;
  chat: number;
  courtesies: number;
}

export async function getMyUnreadCounts(): Promise<UnreadCounts> {
  if (isMockMode()) return { notifications: 3, chat: 3, courtesies: 1 };

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { notifications: 0, chat: 0, courtesies: 0 };

  const [notifs, courts, msgs] = await Promise.all([
    sb
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .is("read_at", null),
    sb
      .from("courtesies")
      .select("id", { count: "exact", head: true })
      .eq("to_profile_id", user.id)
      .in("status", ["sent", "delivered"]),
    sb
      .from("messages")
      .select("conversation_id", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .neq("status", "read"),
  ]);

  return {
    notifications: notifs.count ?? 0,
    chat: msgs.count ?? 0,
    courtesies: courts.count ?? 0,
  };
}
