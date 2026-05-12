import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

/**
 * Envia notificação push para um profile_id.
 * Body: { profileId, title, body, url? }
 *
 * Em produção, usaria a biblioteca `web-push` com VAPID keys.
 * Por simplicidade, aqui salvamos a intenção e o SW lê quando online.
 */
export async function POST(req: NextRequest) {
  const { profileId, title, body, url } = await req.json();

  if (!profileId || !title) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  if (isMockMode()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const admin = supabaseAdmin();

  // Persiste como notification — o trigger ON INSERT em notifications faz o resto
  await admin.from("notifications").insert({
    profile_id: profileId,
    kind: "push",
    title,
    body: body ?? null,
    link: url ?? null,
  });

  // TODO: integrar web-push library com VAPID keys do .env
  // import webpush from "web-push";
  // webpush.setVapidDetails("mailto:admin@imhere.app", VAPID_PUBLIC, VAPID_PRIVATE);
  // const { data: tokens } = await admin.from("push_tokens")
  //   .select("token").eq("profile_id", profileId).eq("enabled", true);
  // for (const t of tokens ?? []) {
  //   const sub = JSON.parse(t.token);
  //   await webpush.sendNotification(sub, JSON.stringify({ title, body, url }));
  // }

  return NextResponse.json({ ok: true });
}
