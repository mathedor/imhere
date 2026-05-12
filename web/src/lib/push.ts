import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@imhere.app";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  configured = true;
}

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  icon?: string;
  tag?: string;
}

/**
 * Envia push web a todos os tokens de um profile.
 * Retorna número de pushes enviados com sucesso.
 */
export async function sendWebPushTo(profileId: string, payload: PushPayload): Promise<number> {
  if (isMockMode() || !VAPID_PUBLIC || !VAPID_PRIVATE) return 0;
  ensureConfigured();

  const admin = supabaseAdmin();
  const { data: tokens } = await admin
    .from("push_tokens")
    .select("id, token")
    .eq("profile_id", profileId)
    .eq("enabled", true)
    .eq("platform", "web");

  if (!tokens || tokens.length === 0) return 0;

  let sent = 0;
  for (const t of tokens) {
    try {
      const sub = JSON.parse(t.token);
      await webpush.sendNotification(sub, JSON.stringify(payload));
      sent++;
    } catch (err: unknown) {
      const e = err as { statusCode?: number };
      // 410 Gone: subscription expirada, desativa
      if (e.statusCode === 410 || e.statusCode === 404) {
        await admin.from("push_tokens").update({ enabled: false }).eq("id", t.id);
      }
    }
  }
  return sent;
}
